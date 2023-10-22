import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { saveAs } from 'file-saver';
import * as JSZipUtils from 'jszip-utils';
import { AppConfig, configPath } from '../app.config';
import { ServiceURL } from '../service-url';
import { getBackendUrl } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  constructor(private plt: Platform, private http: HttpClient, private alert: AlertController) { }

  downloadNative(catchError: boolean = false): Promise<void> {
    return new Promise((resolve, rejects) => {
      const filename = this.plt.is('ios') ? 'HemoPro.ipa' : 'HemoPro.apk';

      JSZipUtils.getBinaryContent(`assets/native/${filename}`, async (err, data) => {
        try {
          if (err) {
            throw err; // or handle err
          }

          const nativeFile = new Blob([new Uint8Array(data, 0, data.byteLength)]);
          const formData = new FormData();
          formData.append('jsonConfigFile', JSON.stringify(AppConfig.config));
          formData.append('configPath', configPath);
          formData.append('nativeFile', nativeFile, filename);

          const resultFile = await firstValueFrom(this.http.post(
            getBackendUrl() + ServiceURL.utils_native_zip,
            formData,
            {responseType: 'blob'}))
            // .catch((res) => {
            //   throw new Error('failed.');
            // });

          saveAs(resultFile, filename);

          return resolve();
        }
        catch (err2) {
          console.log(err2);
          if (catchError) {
            return rejects(err2);
          }

          const alert = await this.alert.create({
            header: 'Failed to download native file.',
            message: 'Cannot download the native file. Please contact administrator to manually give you the file.',
            buttons: ['OK']
          });
          await alert.present();
          return resolve();
        }
      });
    });
  }
}
