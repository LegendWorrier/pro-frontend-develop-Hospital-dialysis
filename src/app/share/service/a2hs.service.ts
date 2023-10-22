import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { A2hsGuideComponent } from './a2hs-guide/a2hs-guide.component';

@Injectable({
  providedIn: 'root'
})
export class A2hsService {

  get isInstalled() { return this.installed; }
  get isStandalone() { return this.checkStandalone(); }
  get isInstalledHint() { return this.installedHint; }

  constructor(private plt: Platform, private modal: ModalController, private storage: StorageService) {
    this.checkInstalled();
    if (this.plt.is('capacitor') || this.checkStandalone()) {
      return;
    }

    // ====== PWA =========
    console.log('initialize install feature...');
    window.addEventListener('beforeinstallprompt', (e) => {
      // Stash the event so it can be displayed when the user wants.
      this.deferredPrompt = e;
      this.promptSaved = true;
      console.log('install prompted.');
      // reset installed flag
      this.setInstalled(false);
      this.delayFinished = true;
      // cancel delay
      clearTimeout(this.delay);
    });
    window.addEventListener('appinstalled', (evt) => {
      console.log('app installed.');
      this.setInstalled(true);
      this.deferredPrompt = null; // maybe user install app from browser, so clear the defer too.
      // cancel delay
      clearTimeout(this.delay);
    });
    this.browserSupported = this.isBrowserSupportPwaApp();
  }

  deferredPrompt;
  promptSaved = false;

  deferredPromptRejected = false;

  private installed = false;
  private browserSupported = false;
  private isOpen = false;
  private installedHint = false;

  delayFinished = false;

  delay: NodeJS.Timeout;

  checkInstallPrompt() {
    return this.promptSaved;
  }

  checkStandalone(): boolean {
    return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator as any).standalone
            || window.navigator.userAgent.indexOf('hap') >= 0;
  }

  checkShowInstall(): boolean {
    // Note: as of 20/2/2022
    // Major browser that support PWA install prompt: Edge, Chrome, Samsung, Huawei (for ios, only safari is supported but has no prompt)
    // *Huawei has no 'appinstalled' event call (so if install manually, the app won't know if it's already installed),
    // *Huawei also has no standalone check support, so it rely on the app to know if it's already installed.
    // **Edge android seems to have separate management for multiple shorcuts for each site
    // (install prompt will keep showing no matter how many times user has installed the app)

    return this.plt.is('ios') || (this.browserSupported && !this.installed && this.delayFinished) || this.checkInstallPrompt();
  }

  async addToHomeScreen() {

    if (!this.deferredPrompt) {
      this.showGuide();
      return;
    }

    // Show the prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      this.delay = setTimeout(() => {
        this.setInstalled(true);
      }, 500);
    }
    else {
      this.deferredPromptRejected = true;
    }
    // We've used the prompt, and can't use it again, throw it away
    this.deferredPrompt = null;
  }

  isBrowserSupportPwaApp(browser?: string) {
    if (!browser) { browser = this.checkBrowser(); }

    return browser === 'edge' ||
    browser === 'samsung' ||
    browser === 'huawei' ||
    browser === 'safari' ||
    browser === 'chrome';

    // Note: on ios, only Safari is supported.
  }

  /**
   * Check browser user agent to determine the browser type.
   *
   * Note: for Huawei Browser, it can disguise itself into other type.
   * Right now, there is no way to distinguish this.
   *
   * @return {*}  {string}
   * @memberof A2hsService
   */
  checkBrowser(): string {
    const agent = window.navigator.userAgent.toLocaleLowerCase();

    const isEdgeiOS = /edgios/.test(agent);
    const isEdgeAndroid = /edga/.test(agent);
    const isEdgeDesktop = /edg/.test(agent);

    if (isEdgeDesktop || isEdgeiOS || isEdgeAndroid) {
      return 'edge';
    }

    const isSamsung = /samsung/.test(agent);
    if (isSamsung) {
      return 'samsung';
    }
    const isHuawei = /huawei|harmonyos/.test(agent);
    if (isHuawei) {
      return 'huawei';
    }
    const isOpera = /opr/.test(agent);
    if (isOpera) {
      return 'opera';
    }


    const isChrome = /chrome|crios/.test(agent);
    if (isChrome) {
      return 'chrome';
    }
    const isSafari = /safari/.test(agent);
    if (isSafari) {
      return 'safari';
    }

    const isFirefox  = /firefox/.test(agent);
    if (isFirefox) {
      return 'firefox';
    }

    return 'others';
  }

  async showGuide() {
    if (this.isOpen) {
      return;
    }
    const guide = await this.modal.create({
      component: A2hsGuideComponent,
      cssClass: ['a2hs-guide'],
      canDismiss: true,
      backdropDismiss: true,
      showBackdrop: false
    });
    guide.present();

    this.isOpen = true;
    await guide.onWillDismiss();
    this.isOpen = false;
  }

  setInstalled(installed: boolean) {
    this.storage.set('installed', installed);
    this.installed = installed;
  }

  // call on first create service, only once
  async checkInstalled() {
    this.installed = await this.storage.get('installed') as boolean;
    // if after some delay (3 secs) 'beforeinstallprompt' still not called, manually show the guide.
    if (!this.installed) {
      this.delay = setTimeout(() => {
        this.delayFinished = true;
        const browser = this.checkBrowser();
        if (browser === 'huawei') {
          this.installedHint = true;
        }
      }, 3000);
    }
  }
}
