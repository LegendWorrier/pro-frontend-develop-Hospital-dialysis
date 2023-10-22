import { StorageService } from './../share/service/storage.service';
import { AppConfig } from 'src/app/app.config';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateFn } from '@angular/router';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable()
export class InitGuard {
  constructor(private http: HttpClient, private router: Router, private storage: StorageService, private plt: Platform){}
  static skip: boolean;
  static isServerOnline = true;

  static finish = new BehaviorSubject<boolean>(true);
  static isInit = false;

  static async checkServiceWorker(): Promise<boolean> {
    try {
      const service = await navigator.serviceWorker.getRegistrations();
      return service?.length !== 0;

    } catch (error) {
      console.log('service worker failed.', error);
    }
    return false;
  }

  static async checkInit(http: HttpClient): Promise<boolean> {
    if (!await this.checkSSL(http)) {
      console.log('cannot connect backend with ssl');
      return false;
    }

    return await InitGuard.checkServiceWorker();
  }

  static flagBypass(storage: StorageService): void {
    storage.set('ssl-bypass', true);
  }

  static async checkSSL(http: HttpClient): Promise<boolean> {
    // try calling backend with https, CORS will block if ssl is not valid
    return this.healthcheck(http, true);
  }

  static async checkServerOnline(http: HttpClient): Promise<boolean> {
    return this.healthcheck(http, false);
  }

  private static async healthcheck(http: HttpClient, ssl: boolean): Promise<boolean> {
    const portSplit = AppConfig.config.apiServer.removeProtocol().split(':');
    let testPath = `${ssl ? 'https' : 'http'}://${portSplit[0]}`;
    if (portSplit[0] === AppConfig.config.secureDomain || portSplit.length > 1) {
      testPath += ssl ? ':9000' : ':9010';
    }
    testPath += '/health';
    const result = await firstValueFrom(http.get(testPath, { responseType: 'text' })).catch((err) => {
      console.log('health result: ', err);
      // status 504 timeouted - when offline
      // status 0 - when error other than connection (cert error, COR error)
      if (err.status !== 0) {
        InitGuard.isServerOnline = false;
      }
      return false;
    });
    if (result) {
      return true;
    }
    return false;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    InitGuard.finish.next(false);
    return new Promise<boolean | UrlTree>(async (resolve) => {
      if (InitGuard.skip || await this.bypass() || this.plt.is('capacitor')) {
        InitGuard.isInit = true;
        return resolve(true);
      }

      const redirect = this.router.createUrlTree(['/init'], { queryParams: { redirect_url: state.url } });
      if (document.location.protocol !== 'https:') {
        console.log('not using https');
        InitGuard.isInit = false;
        return resolve(redirect);
      }

      // check for PWA readiness
      if (!await InitGuard.checkServiceWorker()) {
        InitGuard.isInit = false;
        return resolve(redirect);
      }

      if (!await this.checkSSL()) {
        if (!InitGuard.isServerOnline) {
          // cannot connect to server, delegate to login page
          InitGuard.isInit = true;
          return resolve(true);
        }
        // Actual SSL error
        InitGuard.isInit = false;
        return resolve(redirect);
      }

      InitGuard.isInit = true;
      return resolve(true);
    })
    .finally(() => InitGuard.finish.next(true));

  }

  async checkServerOnline() {
    return InitGuard.checkServerOnline(this.http);
  }
  async checkSSL() {
    return InitGuard.checkSSL(this.http);
  }

  async bypass() {
    return await this.storage.get('ssl-bypass');
  }

}

export const InitCheck: CanActivateFn = 
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const initGuard = inject(InitGuard);
    return initGuard.canActivate(route, state);
  };
