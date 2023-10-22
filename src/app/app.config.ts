import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, ObservableInput, Subject } from 'rxjs';
import { mergeMap, first } from 'rxjs/operators';
import { IAppConfig } from './IAppConfig';
import { Preferences } from '@capacitor/preferences';

@Injectable()
export class AppConfig {

  static get isInit(): boolean {
    return AppConfig.config?.apiServer != null;
  }

  constructor(private http: HttpClient, private plt: Platform) {
    this.load();
  }

  static config: IAppConfig;
  static get configWatch() { return this.configSubject.asObservable() }

  private static configSubject: Subject<IAppConfig> = new BehaviorSubject<IAppConfig>(null);

  static async reload(injector: Injector) {
    const instance = injector.get(AppConfig);
    await instance.load();
  }

  static afterInit<O extends ObservableInput<any>>(callback: (value: IAppConfig, index: number) => O) {
    return AppConfig.configWatch.pipe(first(x => !!x), mergeMap(callback));
  }

  private load() {

    return new Promise<boolean>(async (resolve, reject) => {
      const jsonFile = configPath;
      let url = jsonFile;
      if (this.plt.is('capacitor')) {
        const { value } = await Preferences.get({ key: 'setting-server' });
        let server = value;
        if (!server) {
          const JSON = await this.http.get<IAppConfig>(jsonFile).toPromise();
          server = 'https://' + JSON.secureDomain;
          await Preferences.set({
            key: 'setting-server',
            value: server
          });
        }
        url = server + '/' + jsonFile;
      }
      this.http.get(url, { headers: {'Cache-Control': 'no-cache'} }).subscribe({
        next: (response: IAppConfig) => {
          AppConfig.config = (response as IAppConfig);
          if (!AppConfig.config.prescription || AppConfig.config.prescription.acHr < 3) {
            AppConfig.config.prescription = { acHr: 3 };
          }
          if (!AppConfig.config.dialysisRecord) {
            AppConfig.config.dialysisRecord = {};
          }
          if (!AppConfig.config.timeZoneId) {
            AppConfig.config.timeZoneId = 'Asia/Bangkok'; // hard-coded default
          }
          if (!AppConfig.config.localLanguage) {
            AppConfig.config.localLanguage = 'th'; // hard-coded default
          }
          AppConfig.configSubject.next(AppConfig.config);
          resolve(true);
        },
        error : (response: any) => {
          if (this.plt.is('capacitor')) {
            // case: wrong or invalid server url
            AppConfig.config = ({ centerName: 'Unknown' } as IAppConfig);
            AppConfig.configSubject.next(AppConfig.config);
            resolve(false);
          }
          else {
            reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
          }
        }});
    });
  }
}

export const configPath = 'assets/config/config.json';
