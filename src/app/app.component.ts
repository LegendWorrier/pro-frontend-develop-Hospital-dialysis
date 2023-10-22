import { filter, map } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppConfig } from './app.config';
import { Component, Injector, OnInit } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';

import { getPrimaryColor, presentToast, setupDarkmodeHandler, ToastType } from './utils';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  pwaSupported: boolean;
  darkMode = false;
  private primaryColor: string;

  pageTitle = '';

  constructor(
    private platform: Platform,
    private sw: SwUpdate,
    private injector: Injector,
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    
  }
  ngOnInit(): void {
    this.pwaSupported = this.sw.isEnabled || !environment.production;
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        let name = child.snapshot.data.title ?? '';
        while (child.firstChild) {
          child = child.firstChild;
          if (child.snapshot.data.title) {
            name = child.snapshot.data.title;
          }
        }
        return name;
      }))
      .subscribe((page: string) => {
        console.log(page);
        this.pageTitle = page;
        let title = AppConfig.config?.centerName ?? 'Hemodialysis Pro';
        if (this.pageTitle) {
          title += ` - ${this.pageTitle}`;
        }
        this.title.setTitle(title);
      });

    AppConfig.configWatch.subscribe((config) => {
      let title = config?.centerName ?? 'Hemodialysis Pro';
      if (this.pageTitle) {
        title += ` - ${this.pageTitle}`;
      }
      this.title.setTitle(title);
      
    });

    this.initializeApp();
  }
  
  initializeApp() {

    this.platform.ready().then(async () => {
      SplashScreen.hide();

      if (!this.platform.is('capacitor')) {
        console.log('non-native app platform.');
        this.registerPWA();
      }
      if (Capacitor.isPluginAvailable('Keyboard')) {
        Keyboard.setResizeMode({mode: KeyboardResize.Body});
      }

      this.primaryColor = getPrimaryColor();
      setupDarkmodeHandler((e) => {
        this.updateStatusBar(e);
      });

    });

  }

  updateStatusBar(isDarkmode: boolean) {
    if (!Capacitor.isPluginAvailable('StatusBar')) {
      return;
    }
    if (isDarkmode) {
      StatusBar.setStyle({ style: Style.Dark });
    }
    else {
      StatusBar.setBackgroundColor({ color: this.primaryColor });
    }
  }

  registerPWA() {
    console.log('service worker enable: ', this.sw.isEnabled);
    if (this.sw.isEnabled) {
      this.sw.checkForUpdate().catch(err => console.log('check update failed', err));

      this.sw.versionUpdates.pipe(filter(x => x.type === 'VERSION_READY')).subscribe(event => {
        const info = event as VersionReadyEvent;
        console.log('current version is', info.currentVersion);
        console.log('available version is', info.latestVersion);
        presentToast(this.injector, { message: 'New Update is available!', native: true });
        this.promptUpdate(info);

      });
    }
  }

  private async promptUpdate(event: VersionReadyEvent) {
    const alertCtl = this.injector.get(AlertController);
    const prompt = await alertCtl.create({
      backdropDismiss: true,
      header: 'Application Update',
      subHeader: 'There is an update for the app',
      message: 'Do you want to automatically update the app right away?',
      translucent: true,
      buttons: [
        {
          text: 'Yes',
          role: 'OK',
          handler: () => {
            this.sw.activateUpdate().then((success) => {
              if (success) {
                presentToast(this.injector, { message: 'The app has been updated!', native: true });
                document.location.reload();
              }
              else {
                presentToast(this.injector, { message: 'Update failed. Please try again.', type: ToastType.alert });
              }
            });
          }
        },
        {
          text: 'No',
          role: 'Cancel'
        }
      ]
    });
    prompt.present();
  }

  
}
