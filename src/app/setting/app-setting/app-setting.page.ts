import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { IonNav, ModalController } from '@ionic/angular';
import { AppConfig, configPath } from 'src/app/app.config';
import { IAppConfig } from 'src/app/IAppConfig';
import { presentToast, ToastType } from 'src/app/utils';

@Component({
  selector: 'app-setting',
  templateUrl: './app-setting.page.html',
  styleUrls: ['./app-setting.page.scss'],
})
export class AppSettingPage implements OnInit {
  
  server: string;
  valid: boolean;

  constructor(private injector: Injector, private http: HttpClient, private nav: IonNav, private modal: ModalController) {}

  async ngOnInit() {
    this.server = (await Preferences.get({ key: 'setting-server' })).value;
  }

  checkUrl() {
    return this.http.get<IAppConfig>(this.server + '/' + configPath).toPromise()
      .then(()=> {this.valid = true; })
      .catch(()=> {this.valid = false; })
  }

  async check() {
    await this.checkUrl();
    if (this.valid) {
      presentToast(this.injector, { message: 'The server url is valid.', native: true });
    }
    else {
      presentToast(this.injector, { message: 'The url is not valid. (or the server is down)', type: ToastType.alert, header: 'Invalid' });
    }
  }

  async save() {
    await this.checkUrl();
    if (this.valid) {
      Preferences.set({ key: 'setting-server', value: this.server })
      .then(async ()=> {
        presentToast(this.injector, { message: 'App setting saved.' });
        await AppConfig.reload(this.injector);
        const prevPage = await this.nav.getPrevious();
        if (prevPage) {
          this.nav.pop();
        }
        else {
          this.modal.dismiss(null, 'OK');
        }
      })
      .catch((err)=>presentToast(this.injector, { message: 'Cannot save the app setting. [Debug: ' + err + ']', type: ToastType.alert, header: 'Failed' }));
    }
    else {
      presentToast(this.injector, { message: 'The url is not valid. (or the server is down)', type: ToastType.alert, header: 'Failed' });
    }
    
  }

}
