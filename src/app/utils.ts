import { HttpErrorResponse } from '@angular/common/http';
import { Injector } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { AlertController, IonContent, IonNav, IonicSafeString, LoadingController, ModalController, NavController, NavParams, Platform, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { delay, finalize, mergeMap, retry } from 'rxjs/operators';
import { AppConfig } from './app.config';
import { User } from './auth/user';
import { BloodSign } from './patients/patient';
import { ModalService } from './share/service/modal.service';
import { GUID } from './share/guid';
import { GlobalErrorHandler } from './global-error-handler';
import { Header } from './share/header/header';

String.prototype.format = function(): string {
    const args = arguments;
    return this.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] !== 'undefined'
        ? args[number]
        : match
      ;
    });
};

String.prototype.capitalizeFirstLetter = function(): string {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.removeProtocol = function(): string {
  return this.replace(/https?:\/\//, '');
};

Array.prototype.removeIf = function(callback) {
  let i = this.length;
  while (i--) {
      if (callback(this[i], i)) {
          this.splice(i, 1);
      }
  }

  return this;
};

Array.prototype.groupBy = function<T, K extends keyof any>(getKey: (item: T) => K) {
  return this.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) { previous[group] = []; }
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);
};

Number.prototype.round = function(decimals) {
  const places = Math.pow(10, decimals);
  return Math.round((this + Number.EPSILON) * places) / places;
}

export const appPages = [
  {
    title: 'Patients',
    url: 'patients',
    icon: 'people-outline',
    iconActive: 'people'
  },
  {
    title: 'Schedule',
    url: 'schedule',
    icon: 'bed-outline',
    iconActive: 'bed'
  },
  {
    title: 'Shifts',
    url: 'shifts',
    icon: 'calendar-outline',
    iconActive: 'calendar'
  },
  {
    title: 'Lab Exams',
    url: 'lab-exam',
    icon: 'flask-outline',
    iconActive: 'flask'
  },
  {
    title: 'Monitor',
    url: 'monitor',
    icon: 'grid-outline',
    iconActive: 'grid'
  }
];

export const mailString = 'mailto:customer@softtechmedcare.com?Subject=Hemopro Support';

export function decimalPattern() { return `-?[0-9]*(\.[0-9]{1,${AppConfig.config.decimalPrecision}})?`; }
export function decimalFormat(withZero: boolean = false) { return '1.' + (withZero ? '1' : '0') + '-' + AppConfig.config.decimalPrecision; }

// encapsulated helper for backend manipulation
export class Backend {
  private constructor() {
    AppConfig.configWatch.subscribe(() => {
      if (AppConfig.isInit) {
        this.updateUrls();
      }
    });
  }
  public static get Instance()
  {
      return this._instance || (this._instance = new this());
  }

  public get Url() {
    if (!this._url) {
      this.updateUrls();
    }
    return this._url;
  }

  public get ReportUrl() {
    if (!this._reportUrl) {
      this.updateUrls();
    }
    return this._reportUrl;
  }

  public static get Url() {
    return this.Instance.Url;
  }

  public static get ReportUrl() {
    return this.Instance.ReportUrl;
  }
  private static _instance: Backend;
  private _url: string;
  private _reportUrl: string;

  private static replaceUrlProtocol(url: string): string {
    const protocol = window.location.protocol !== 'https:' ? 'http' : 'https';
    const domain = url.removeProtocol();
    return `${protocol}://${domain}`;
  }

  private updateUrls() {
    let apiServer = AppConfig.config.apiServer.removeProtocol();
    if (apiServer === AppConfig.config.secureDomain) {
      const protocol = window.location.protocol !== 'https:' ? 'http' : 'https';
      const port = protocol === 'https' ? '9000' : '9010';
      apiServer = `${apiServer.split(':')[0]}:${port}`;
    }

    this._url = Backend.replaceUrlProtocol(apiServer);

    const reportServer = AppConfig.config.reportService;
    if (reportServer.removeProtocol() === apiServer) {
      this._reportUrl = this._url;
    }
    else {
      this._reportUrl = Backend.replaceUrlProtocol(reportServer);
    }

  }
}

export function getBackendUrl() {
  return Backend.Url;
}

const DEFAULT_MAX_RETRIES = 5;

export function delayedRetry(delayMs: number, maxRetry = DEFAULT_MAX_RETRIES) {
  let retries = maxRetry;

  return (src: Observable<any>) =>
    src.pipe(
      retry({
        delay: (error) => {
          if (error instanceof HttpErrorResponse && error.status !== 0) {
            throw error;
          }
          if (--retries > 0) {
            return of(error);
          }
          throw error;
        }
      }));
}

export function setupDarkmodeHandler(handler) {
  const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  handler(darkMediaQuery.matches);

  // On normal platform we listen to theme change event
  try {
    // Chrome & Firefox
    darkMediaQuery.addEventListener('change', (e) => {
      handler(e.matches);
    });
  } catch (e1) {
    try {
      // Safari
      // tslint:disable-next-line: deprecation
      darkMediaQuery.addListener((e) => {
        handler(e.matches);
      });
    } catch (e2) {
      console.error(e2);
    }
  }
}

export function getPrimaryColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary').trim();
}

// =========== User Agent to platform Decipher ===============
// These string are based on pattern of model of each brand. May need to check periodically.
export const samsungUA = /samsung|(sm|gt|sgh|sch|sph)-[a-z][0-9a-z]{3,5}|sc-42a/;
export const huaweiUA = /huawei|harmonyos|([a-z]{3}-(l|al|tl|n|an|tn|lx|w)[0-9]{0,2}(?!\w|\d))|([a-z]{3}-nx9(a|b)?(?!\w|\d))/;

export function isHandheldPlatform(plt: Platform) {
  const agent = window.navigator.userAgent.toLocaleLowerCase();
  return !(plt.is('desktop') || /windows|win64/.test(agent)) && (
    plt.is('android')
    || plt.is('ipad') || plt.is('iphone')
    || plt.is('tablet')
    || samsungUA.test(agent)
    || huaweiUA.test(agent)
  );
}

export function isDesktopOrLaptop(plt: Platform) {
  return !isHandheldPlatform(plt);
}

export async function internalError(alertCtl: AlertController, error: any) {
  console.log(error);
  const alert = await alertCtl.create({
    header: 'An Error Has Occurred',
    subHeader: 'Unfortunately, the app needs to be restarted',
    message: new IonicSafeString(error),
    backdropDismiss: false,
    buttons: [
      {
        text: 'Restart',
        handler: () => {
          window.location.reload();
        }
      }
    ]
  });
  await alert.present();
}

export async function handleUnauthorizedError(alertCtl: AlertController, code: string = null) {
  if (GlobalErrorHandler.unauthorizedAlert) { // just a double check
    return;
  }
  
  const header = code === 'PERMISSION_CHANGE' ? 'Permission Changed' : 'Unauthorized or Expired Token';
  const subHeader = code === 'PERMISSION_CHANGE' ? 'Your user\' permission has been changed' : 'Unfortunately, you are not authorized or have an expired token.';

  const extraDetail = code === 'PERMISSION_CHANGE' ? 'Your user\'s permission has been changed.<br>' : '';

  const alert = await alertCtl.create({
    header,
    subHeader,
    message: new IonicSafeString(
    `${extraDetail}
    You need to refresh/re-login to authenticate your identity before continue using the app.
    <br>
    Pressing 'OK' will automatically refresh the app (and bring you to the login page if required).`),
    backdropDismiss: false,
    buttons: [
      {
        text: 'OK',
        handler: async () => {
          await SplashScreen.show({ autoHide: false });
          window.location.reload();
        }
      }
    ]
  });

  if (GlobalErrorHandler.unauthorizedAlert) { // just a double check
    return;
  }
  GlobalErrorHandler.unauthorizedAlert = alert;
  GlobalErrorHandler.unauthorizedAlert.onDidDismiss().then(() => {
    GlobalErrorHandler.unauthorizedAlert = null;
  });
  GlobalErrorHandler.unauthorizedAlert.present();
}

export function handleHttpError(err: any, content?: IonContent): string {
  let error: string;
  if (err instanceof HttpErrorResponse && (err.status === 500 || err.status === 400 || err.status === 409 )) {
    // console.log(err);
    switch (err.status) {
      case 500:
        error = err.error.detail;
        if (!error) {
          error = 'Unknown error from the server, please try again or contact an administrator.';
        }
        break;
      case 409:
        error = `${err.error.code} : ${err.error.message}`;
        break;
      case 400:
        const errorList = [];
        for (const key in err.error.errors) {
          if (Object.prototype.hasOwnProperty.call(err.error.errors, key)) {
            const item = err.error.errors[key];
            if (item instanceof Array) {
              item.forEach(element => { errorList.push(element); });
            }
            else {
              errorList.push(item);
            }
          }
        }

        if (isString(err.error.error)) {
          errorList.push(err.error.error);
        }
        if (isString(err.error)) {
          errorList.push(err.error);
        }

        error = errorList.join('\n');
        break;
      default:
        break;
    }
    content?.scrollToBottom();
    return error;
  }
  else {
    throw err;
  }
}

export function isString(obj: any) {
  return typeof obj === 'string' || obj instanceof String;
}

export async function presentToast(injector: Injector, options: {
  header?: string,
  message: string,
  type?: ToastType,
  native?: boolean
}) {
  const plt = injector.get(Platform);

  if (Capacitor.isPluginAvailable('Toast') && options.native) {
    Capacitor.Plugins.Toast.show({
      text: options.message,
      position: isDesktopOrLaptop(plt) ? 'top' : 'bottom',
      duration: 'short'
    });
    return;
  }

  const ctl = injector.get(ToastController);

  const toast = await ctl.create({
    header: options.header ?? 'Saved!',
    message: options.message,
    position: isDesktopOrLaptop(plt) ? 'top' : 'bottom',
    color: (options.type ?? ToastType.success) === ToastType.success ? 'success' : 'danger',
    duration: 2000,
    cssClass: (options.type ?? ToastType.success) === ToastType.success ? 'info-toast' : 'alert-toast'
  });
  toast.present();
}

export enum ToastType {
  success,
  alert
}

/**
 * pop or dismiss the page depending on whether it is a modal or not.
 *
 * @param {IonNav} nav IonNav
 * @param {NavParams} params NavParams
 * @param {ModalController} modal ModalController
 * @param {*} [data] any data to pass back to the parent context. (sent back to previous/parent page)
 */
export async function ModalBack(nav: IonNav, params: NavParams, modal: ModalController, data?: any) {
  return ModalReturn(data, { nav, params, modalCtl: modal });
}

export async function ModalReturn(data: any, option: { canGoBack?: boolean, nav?: IonNav, params?: NavParams, modalCtl: ModalController }) {
  ModalService.currentData = data;
  const canGoBack = option?.canGoBack ?? await option?.nav?.canGoBack();
  if (option.nav && canGoBack) {
    option?.nav.pop();
    const resolve = option.params?.get('resolve');
    if (resolve) {
      resolve(data);
    }
  }
  else {
    option.modalCtl.dismiss(data, 'OK');
  }
}

export function GetModalResult() {
  const data = ModalService.currentData;
  ModalService.currentData = null;
  return data;
}

/**
 * Pass observable to save or edit the data, and this function will magically handle the rest.
 *
 * Note: this function will auto call 'ModalBack' as a result.
 * @param injector injector of the app, retreive from angular
 * @param options Information about observable call (for save or update data), success text, and callback (error, redirect route).
 * @return nothing
 */
export async function addOrEdit(injector: Injector, options: {
 addOrEditCall: Observable<any>,
 successTxt: {
   name: string,
   editMode: boolean
 } | string,
 redirectRoute?: string | any[],
 content?: IonContent,
 errorCallback?: (err: string) => void,
 customErrorHandling?: (err: any) => boolean | Promise<boolean>,
 isModal?: boolean,
 successCallback?: (data: any) => any,
 completeCallback?: () => void,
 stay?: boolean,
 finalize?: () => void
}): Promise<void> {
  const loadingCtl = injector.get(LoadingController);

  const loading = await loadingCtl.create();
  loading.present().catch(() => {});

  let successTxt: string;
  if (typeof(options.successTxt) === 'string' ) {
    successTxt = options.successTxt;
  }
  else {
    successTxt = `${options.successTxt?.name} has been ${options.successTxt.editMode ? 'updated' : 'created'}.`;
  }
  return new Promise(resolve => {
    options.addOrEditCall.pipe(finalize(() => {
      loading.dismiss().then(() => {
        if (options.finalize) {
          options.finalize();
        }
      }, () => {});
    })).subscribe({
      next: async (data) => {
        await loading.dismiss();
        await presentToast(injector, { message: successTxt });
        if (options.successCallback) {
          const modify = options.successCallback(data);
          if (modify) {
            data = modify;
          }
        }

        if (options.stay) {
          return;
        }

        if (options.isModal) {
          const nav = injector.get(IonNav);
          const params = injector.get(NavParams);
          const modal = injector.get(ModalController);
          ModalBack(nav, params, modal, data);
        }
        else if (options.redirectRoute) {
          const nav = injector.get(NavController);
          nav.navigateRoot(options.redirectRoute);
        }
        else {
          const nav = injector.get(NavController);
          // TODO: find a way to know if we can go back or not
          if (window.history.length > 0) { // this condition is not working
            nav.pop();
          }
          else {
            nav.navigateBack(Header.initPrevPage);
          }
        }
        resolve();
      },
      error: async (err: any) => {
        if (options.customErrorHandling) {
          const handled = ((options.customErrorHandling) instanceof Promise) ? await options.customErrorHandling(err) : options.customErrorHandling(err);
          if (handled) {
            return;
          }
        }
        
        const errTxt = handleHttpError(err, options.content);
        if (options.errorCallback) {
          options.errorCallback(errTxt);
        }
        else {
          console.log(err);
          throw err;
        }

        resolve();
      },
      complete: options.completeCallback
    });
  });
}

/**
 * The callback for returning a value from a page.
 * Used in case of new page has been pushed onto the modal's page stack.
 *
 * Used in conjunction with 'pushOrModal' and 'ModalBack'.
 *
 * In case no change, you can safely pass 'null' as data.
 *
 * @param data the value to be returned.
 * @param getParam Injector or the NavParams itself.
 */
export function onLeavePage(data: any, getParam: NavParams) {

  const resolve = getParam.get('resolve');
  if (resolve) {
    resolve(data);
  }
}
/**
 * Add and go to next page, or open the page within a modal. (based on whether it is already on a modal or not).
 * This function will return the value from the page after it is confirmed by dismiss or onLeavePage callback function.
 *
 * @export
 * @param {*} component the page to go to
 * @param {{[key:string]:any}} props params for the new page
 * @param {ModalService} modal the modal service (via injection)
 * @return {*}  {Promise<any>} the value returned from the page.
 */
export function pushOrModal(component: any, props: {[key: string]: any}, modal: ModalService): Promise<any> {
  return new Promise(async (resolvePage, reject) => {
    if (modal.currentNav) {
      new Promise<any>((resolve) => {
        modal.currentNav.push(component, { ...props, resolve });
      }).then((data) => resolvePage(data));
    }
    else {
      modal.openModal(component, props, [], (result) => {
        if (result.role === 'OK') {
          resolvePage(result.data);
        }
        else {
          resolvePage(null);
        }
      }, true);
    }
  });
}

export function getName(user: User): string {
  if (!user) {
    return null;
  }
  let name = (user.firstName ?? '') + ' ' + (user.lastName ?? '');
  if (name.replace(' ', '') === '') {
    name = user.userName;
  }
  return name;
}

export function getEnumKeyByValue<T extends {[index: string]: string}>(myEnum: T, enumValue: string): keyof T|null {
  const keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : null;
}

export function formatBloodType(blood: string) {
  if (!blood) {
    return null;
  }
  const split = blood.split('-');
  let bloodType = split[0];
  if (split.length > 1) {
    const bloodSign = split[1];
    bloodType = bloodType + BloodSign[bloodSign];
  }
  return bloodType;
}

export function deepCopy(obj) {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (null === obj || 'object' !== typeof obj) { return obj; }

  // Handle Date
  if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
      copy = [];
      for (let i = 0, len = obj.length; i < len; i++) {
          copy[i] = deepCopy(obj[i]);
      }
      return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
      copy = {};
      for (const attr in obj) {
          if (obj.hasOwnProperty(attr)) { copy[attr] = deepCopy(obj[attr]); }
      }
      return copy;
  }

  throw new Error('Unable to copy obj! Its type isn\'t supported. => ' + typeof obj);
}

export function checkGuidEmpty(id: string | GUID): boolean {
  return id === '00000000-0000-0000-0000-000000000000';
}
export function checkGuidNullOrEmpty(id: string | GUID): boolean {
  return !id || checkGuidEmpty(id);
}

export type UncapitalizeKeys<T extends object> = Uncapitalize<keyof T & string>;

export type UncapitalizeObjectKeys<T extends object> = {
  [key in UncapitalizeKeys<T>]: Capitalize<key> extends keyof T ? T[Capitalize<key>] : never;
}

export function isUppercase(str: string){ 
  return str == str.toUpperCase() && str != str.toLowerCase();
}


export function GetDataUrlFromCall(dataCall: Observable<Blob>): Promise<string> {
  return new Promise<string>(resolve => {
    dataCall.subscribe({
      next: (data) => {
        if (data) {
          resolve(GetDataUrl(data));
        }
        else {
          resolve(null);
        }
      },
      error: (err) => {
        if (err.status === 404) {
          resolve(null);
          return;
        }
        throw err;
      }
    });
  });
}

export function GetDataUrl(data: Blob) {
  if (!data) {
    return null;
  }
  const url = window.URL.createObjectURL(data);
  return url;
}

