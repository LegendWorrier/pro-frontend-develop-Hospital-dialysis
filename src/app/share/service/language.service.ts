import { ServiceURL } from 'src/app/service-url';
import { ServiceBase } from './service-base';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';
import { Subject, BehaviorSubject, firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { filter, first, map } from 'rxjs/operators';
import { registerLocaleData } from '@angular/common';
import enUS from 'date-fns/locale/en-US';
import { Lang } from '../lang';

@Injectable({
  providedIn: 'root'
})
export class LanguageService extends ServiceBase {

  private locale: Locale;
  private _languageChange: Subject<string> = new Subject<string>();
  private init: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private languageList = [
    {
      id: 'en',
      locale: enUS
    }
  ];

  constructor(private storage: StorageService, http: HttpClient) {
    super(http);
    this.initLocalization().then(async _ => {
      const userPreferred = await this.GetLanguage();
      this._setLang(userPreferred ?? 'en');
      console.log('current language: ', Lang.currentLang);
      this.init.next(true);
    });
  }

  get isInit(): boolean {
    return this.init.value;
  }
  
  get afterInit() {
    return this.init.pipe(filter((isInit) => isInit), first(), map(() => this.CurrentLanguage));
  }

  get CurrentLanguage() {
    return Lang.currentLang;
  }

  get CurrentDateLocale() {
    return this.locale;
  }

  get OnLanguageChange() {
    return this._languageChange.asObservable();
  }

  async initLocalization() {
    await firstValueFrom(AppConfig.afterInit(async (config) => {
      const localLang = config.localLanguage;
      const dtLocale = await import(
        /* webpackMode: "lazy-once", webpackChunkName: "df-[index]", webpackExclude: /_lib/ */
        `date-fns/locale/${localLang}/index.js`
      );
      const angularLocale = await import(
        /* webpackMode: "lazy-once", webpackChunkName: "i18n-base", webpackExclude: /\.d\.ts$/ */
        `../../../../node_modules/@angular/common/locales/${localLang}.mjs`
      );
      const angularLocaleExtra = await import(
        /* webpackMode: "lazy-once", webpackChunkName: "i18n-extra", webpackExclude: /\.d\.ts$/ */
        `../../../../node_modules/@angular/common/locales/extra/${localLang}.mjs`
      );
      registerLocaleData(angularLocale.default, localLang, angularLocaleExtra.default);

      this.languageList.push({
        id: localLang,
        locale: dtLocale.default
      });
    }));
  }

  getLanguageList() {
    return this.languageList.copyWithin(2, 0);
  }

  async SetLanguage(lang: string) {
    this._setLang(lang);
    await firstValueFrom(this.http.put(this.API_URL + ServiceURL.lang.format(lang), {}, { withCredentials: true }));
  }

  private _setLang(lang: string) {
    const targetLang = this.languageList.find(x => x.id === lang);
    if (!targetLang) {
      throw new Error("Invalid language!");
    }
    Lang.currentLang = targetLang.id;
    this.locale = targetLang.locale;
    this.storage.set('lang', targetLang.id);

    this._languageChange.next(Lang.currentLang);
  }

  private GetLanguage() {
    return this.storage.get('lang');
  }
}
