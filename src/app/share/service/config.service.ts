import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AppConfig } from 'src/app/app.config';
import { ServiceURL } from 'src/app/service-url';
import { Backend, handleHttpError, presentToast, ToastType } from 'src/app/utils';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private injector: Injector, private http: HttpClient, private loadingCtl: LoadingController) { }

  async updateConfig(data: FormData, callback?: {
    onSuccess?: () => void,
    onError?: (err: any) => void
  }) {
    const loading = await this.loadingCtl.create({
        message: 'Updating server setting..'
      });
    loading.present();

    this.http.post(Backend.Url + ServiceURL.config, data)
      .pipe(
        finalize(() => loading.dismiss())
      )
      .subscribe({
        next: () => {
          AppConfig.reload(this.injector);
          if (callback?.onSuccess) {
            callback.onSuccess();
          }
          presentToast(this.injector, {
            header: 'Updated',
            message: 'Server setting has been updated.',
            native: true
          });
        },
        error: (err) => {
          console.log(err);
          if (callback?.onError) {
            callback.onError(err);
          }

          if (err instanceof HttpErrorResponse && err.status === 403) {
            handleHttpError(err);
          }
          presentToast(this.injector, {
            header: 'Error',
            message: 'Fail to update server setting. Please try again or contact an administrator.',
            type: ToastType.alert
          });
        }
      });
  }
}
