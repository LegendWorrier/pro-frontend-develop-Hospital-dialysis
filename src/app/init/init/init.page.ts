import { StorageService } from './../../share/service/storage.service';
import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { InitGuard } from '../init.guard';
import { ActivatedRoute, Router } from '@angular/router';
import { InitService } from '../init.service';
import { isHandheldPlatform } from 'src/app/utils';

@Component({
  selector: 'app-init',
  templateUrl: './init.page.html',
  styleUrls: ['./init.page.scss'],
})
export class InitPage implements OnInit {
  isDownloading = false;
  isBypassFlag = false;
  browserSupported = true;
  constructor(private plt: Platform,
              private initService: InitService,
              private router: Router,
              private nav: NavController,
              private activatedRoute: ActivatedRoute,
              private storage: StorageService) { }

  async ngOnInit() {
    this.browserSupported = await this.storage.get('supported') !== 'false';
  }

  get isNativePlatform() {
    return isHandheldPlatform(this.plt) && this.plt.is('mobileweb');
  }

  goToSetup() {
    this.router.navigate(['init/setup-guide']);
  }

  skipCheck() {
    if (this.isBypassFlag) {
      this.dontShowAgain();
    }

    InitGuard.skip = true;
    this.activatedRoute.queryParamMap.subscribe((param) => {
      this.nav.navigateBack([param.get('redirect_url') || '']);
    });
  }

  dontShowAgain() {
    InitGuard.flagBypass(this.storage);
  }

  async downloadApp() {
    if (this.isDownloading) {
      return;
    }

    this.isDownloading = true;

    await this.initService.downloadNative();

    this.isDownloading = false;
  }

}
