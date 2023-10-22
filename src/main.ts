import { StorageService } from './app/share/service/storage.service';
import { AppConfig } from 'src/app/app.config';
import { AlertController } from '@ionic/angular';
import { enableProdMode, Injector } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';


function checkUserAgentSupport(): boolean {
  const agent = navigator.userAgent.toLowerCase();
  console.log(agent);
  let isChrome = /chrome|crios/.test(agent);
  const isExplorer = /msie/.test(agent);
  const isExplorer_11 = /rv:11/.test(agent);
  const isFirefox  = /firefox/.test(agent);
  let isSafari = /safari/.test(agent);
  const isOpera = /opr/.test(agent);
  const isEdgeDesktop = /edg/.test(agent);
  const isEdgeiOS = /edgios/.test(agent);
  const isEdgeAndroid = /edga/.test(agent);
  const isSamsung = /samsung/.test(agent);
  const isHuawei = /huawei|harmonyos/.test(agent);
  const isLINE = /line/.test(agent);

  if (isChrome && isSafari) { isSafari = false; }
  if (isChrome && (     (isEdgeDesktop) ||
                            (isEdgeiOS) ||
                            (isEdgeAndroid) )  ) { isChrome = false; }
  if (isSafari && (     (isEdgeDesktop) ||
                            (isEdgeiOS) ||
                            (isEdgeAndroid) )  ) { isSafari = false; }
  if (isChrome && isOpera) { isChrome = false; }

  if (isExplorer || isExplorer_11 || isLINE // these are known browser that cannot run app properly
    || (isEdgeiOS || isEdgeAndroid || isOpera || isFirefox)) { // these are known browser that can run the app, but not fully support PWA) {
    return false;
  }

  return isChrome || isSafari || isEdgeDesktop || isSamsung || isHuawei; // these are default web browser that fully support PWA
  // (huawei browser support PWA and can install, but not as native as the other)

}

async function notSupport(inject: Injector) {
  const browserSupported = checkUserAgentSupport();
  inject.get(StorageService).set('supported', `${browserSupported}`);
  // if in case of cert ssl error (internal network) bypass this warning
  if (browserSupported && window.location.host === AppConfig.config.secureDomain) {
    return;
  }

  const alertCtl = inject.get(AlertController);
  const alert = await alertCtl.create({
    backdropDismiss: true,
    header: browserSupported ? 'Link not supported' : 'Browser not fully supported',
    message: browserSupported ?
    'This link is not supported. Please change to the recommended link (or domain) in order to use this app at the full potential.' :
    'This browser is not fully supported. Please change or update your browser in order to use this app at the full potential.',
    buttons: ['OK']
  });
  alert.present();
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then((ref) => {
  if (!environment.production) {
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('ngsw-worker.js', { scope: '/' })
    .catch(err => {
      notSupport(ref.injector);
      console.log('register service worker failed: ', err);
    });
  }
  else {
    notSupport(ref.injector);
  }
})
  .catch(err => console.log(err));

defineCustomElements(window);
