import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { AlertController, IonMenu, IonRouterOutlet, IonTabs, LoadingController, NavController, Platform } from '@ionic/angular';
import { appPages, isHandheldPlatform } from '../utils';
import { SettingPage } from '../setting/setting.page';
import { AuthService } from '../auth/auth.service';
import { A2hsService } from '../share/service/a2hs.service';
import { ModalService } from '../share/service/modal.service';
import { environment } from 'src/environments/environment';
import { AppConfig } from '../app.config';
import { SmartLoginService } from '../auth/smart-login.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss']
})
export class MainPage implements AfterViewInit {
  
  @ViewChild('outlet') routerOutlet: IonRouterOutlet;
  @ViewChild('menu') menu: IonMenu;
  @ViewChild('l') iframe: HTMLIFrameElement;

  get showInstall(): boolean { return this.pwaSupported && this.a2hs.checkShowInstall() && !this.a2hs.checkStandalone(); }
  get isIOS(): boolean { return this.platform.is('ios'); }
  get showForceInstalled(): boolean { return !this.a2hs.isInstalled && this.a2hs.isInstalledHint; }

  private pwaSupported: boolean;

  appPages = appPages;

  // =========== Permission =========
  hasStockPermission: boolean;

  isDev: boolean;
  trtEnabled: boolean;

  constructor(
    private platform: Platform,
    private auth: AuthService,
    private smartLogin: SmartLoginService,
    private loadingCtl: LoadingController,
    private modal: ModalService,
    private navCtl: NavController,
    private alertCtl: AlertController,
    private a2hs: A2hsService,
    private plt: Platform    )
  {
    this.hasStockPermission = auth.currentUser.checkPermission('stock');
    this.isDev = !environment.production;
    this.trtEnabled = AppConfig.config.enableTRTMap;
  }

  ngAfterViewInit(): void {
  }

  ionViewWillLeave() {
    this.menu.close();
  }

  ionViewWillEnter() {
  }

  async setting() {
    // presentingElement: this.routerOutlet.nativeEl
    this.modal.openModal(SettingPage, { isModal: true }, ['admin-class']);
    this.menu.close();
  }

  async logout() {
    const loading = await this.loadingCtl.create({
      message: 'Logging Out ...',
      backdropDismiss: false
    });
    loading.present();
    await this.auth.logout().toPromise();
    loading.dismiss();
  }

  install() {
    this.a2hs.addToHomeScreen();
  }

  setInstalled() {
    this.a2hs.setInstalled(true);
  }

  async hemoConnect() {
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

    let userPromptedToOpenDesktopApp = false;
    window.onblur = () => { userPromptedToOpenDesktopApp = true };

    const loading = await this.loadingCtl.create();
    loading.present();
    setTimeout(async () => {
      loading.dismiss();
      if (!userPromptedToOpenDesktopApp) {
        this.navCtl.navigateForward(['hemo-connect']);
      }
    }, 100);

    window.location.assign(`hemo-connect://${AppConfig.config.secureDomain}/${token}`);
  }

}
