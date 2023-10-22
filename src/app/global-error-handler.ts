import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { AlertController, IonicSafeString } from '@ionic/angular';
import { AuthService } from './auth/auth.service';
import { handleUnauthorizedError, internalError } from './utils';

@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
  constructor(
      private alerts: AlertController,
      private authService: AuthService
    ) {
      super();
  }

  static networkAlert: HTMLIonAlertElement;
  static unauthorizedAlert: HTMLIonAlertElement;
  static isAlertDisplaying = false;

  static isReportError = false;

  public handleError(error) {
    if (GlobalErrorHandler.isReportError) {
      GlobalErrorHandler.isReportError = false;
      return;
    }
    if (error.rejection) {
      const pError = error.rejection;
      if (pError instanceof HttpErrorResponse || pError.status) {
        this.handleHttpError(pError);
      }
      else if (pError.message && pError.message.includes('HubException')) {
        const splits = pError.message.split(':');
        this.networkErrorAlert('Internal Server Error',
          `Error Code: ${splits[1]}<br><br>
          ${splits[2]}`);
      }
      else {
        this.internalErrorAlert(error);
      }
    }
    else if (error instanceof HttpErrorResponse || error.status) {
      this.handleHttpError(error);
    }
    else if (error.message && error.message.includes('HubException')) {
      const splits = error.message.split(':');
      this.networkErrorAlert('Internal Server Error',
        `Error Code: ${splits[1]}<br><br>
        ${splits[2]}`);
    }
    else {
      this.internalErrorAlert(error);
    }
  }

  public async handleHttpError(error) {
    switch (error.status) {
      case 401:
          console.log('Unauthorized. Go to login page or renew token.');
          this.authService.logout().subscribe();
          this.unauthorizedAlert();
          break;
      case 403:
          this.networkErrorAlert('Forbidden',
          `Sorry sir, but your user does not have a permission for that.`);
          break;
      case 504:
      case 0:
          this.networkErrorAlert('Connection Failed',
          `Cannot connect to the server. Please check your network connection.<br><br>
          If you believe this is not because of your connection, perhaps the server is down right now.<br><br>
          Please contact the administrator.`);
          this.authService.stopSession();
          break;
      default:
          const message = error.status === 409 ? error.error.message : 'There is an error from the server. Please contact administrator if the problem remains.';
          const code = error.status === 409 ? error.error.code : error.status;

          if (code === 'LICENSE_ERROR') {
            this.networkErrorAlert('License Issue', 'The license is expired or invalid. Please update your subscription and payment.');
            break;
          }

          this.networkErrorAlert('Internal Server Error',
          `Error Code: ${code}<br><br>
          ${message}`);
          break;
    }
  }

  public async networkErrorAlert(subHeader: string, message: string) {
    if (!GlobalErrorHandler.isAlertDisplaying) {
      GlobalErrorHandler.isAlertDisplaying = true;
      const body = new IonicSafeString(message);
      const alert = await this.alerts.create({
        header: 'Network Error',
        subHeader,
        message: body,
        backdropDismiss: true,
        buttons: [
          {
            text: 'OK',
            role: 'OK'
          }
        ]
      });
      if (GlobalErrorHandler.networkAlert) { // just a double check
        return;
      }
      GlobalErrorHandler.networkAlert = alert;
      GlobalErrorHandler.networkAlert.onDidDismiss().then(() => {
        GlobalErrorHandler.networkAlert = null;
        GlobalErrorHandler.isAlertDisplaying = false;
      });
      GlobalErrorHandler.networkAlert.present();
    }
  }

  public async unauthorizedAlert() {
    handleUnauthorizedError(this.alerts);
  }

  public async internalErrorAlert(error: any) {
    internalError(this.alerts, error);
  }
}
