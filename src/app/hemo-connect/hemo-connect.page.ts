import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { isHandheldPlatform } from '../utils';
import { AlertController, Platform } from '@ionic/angular';
import { SmartLoginService } from '../auth/smart-login.service';
import { AppConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-hemo-connect',
  templateUrl: './hemo-connect.page.html',
  styleUrls: ['./hemo-connect.page.scss'],
})
export class HemoConnectPage implements OnInit {

  downloadClicked: boolean;
  linkAppClicked: boolean;

  constructor(
    private plt: Platform,
    private alertCtl: AlertController,
    private auth: AuthService,
    private smartLogin: SmartLoginService) { }

  ngOnInit() {
  }

  async link() {
    if (isHandheldPlatform(this.plt) || this.plt.is('ios')) {
      const warn = await this.alertCtl.create({
        header: 'Not Supported Platform',
        subHeader: 'Desktop Only',
        message: 'Hemo Connect can only be used on desktop.',
        buttons: [
          {
            text: 'Ok'
          }
        ]
      });
      warn.present();

      return;
    }

    const token = (await firstValueFrom(this.smartLogin.generateOneTimeToken()))?.token;
    if (!token) {
      console.error('failed to get One time token.');
      return;
    }

    window.location.assign(`hemo-connect://${AppConfig.config.secureDomain}/${token}`);

    this.linkAppClicked = true;
  }

  download() {
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', AppConfig.config.apiServer + '/api/hemoConnect/download');
    document.body.appendChild(link);
    link.click();
    link.remove();
    this.downloadClicked = true;
  }

}
