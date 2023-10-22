import { huaweiUA, isHandheldPlatform, samsungUA } from 'src/app/utils';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AppConfig } from 'src/app/app.config';
import { InitGuard } from '../init.guard';
import { IonicSlides } from '@ionic/angular';
import { useSwiper } from 'src/app/share/swiper-init';

@Component({
  selector: 'app-setup-guide',
  templateUrl: './setup-guide.page.html',
  styleUrls: ['./setup-guide.page.scss'],
})
export class SetupGuidePage implements OnInit {
  swiperModules = [IonicSlides];

  isSetup = false;
  isSameDomain = AppConfig.config.secureDomain === window.location.host;
  secureUrl = `https://${AppConfig.config.secureDomain}`;

  isIpad = false;
  isAndroid = false;
  isFirefox = false;
  isSamsung = false;
  isHuawei = false;

  isOthers = false; // Unknown handheld platform case (excluding desktop platform)

  items = [];

  iosNum = 10;
  androidNum = 7;
  samsungNum = 6;
  huaweiNum = 5;
  windowNum = 5;

  constructor(private router: Router, private plt: Platform, private http: HttpClient) { }

  async ngOnInit() {
    useSwiper();

    this.checkSetup().then((setup) => {
      this.isSetup = setup;
    }).catch();

    this.isAndroid = this.plt.is('android');

    const agent = window.navigator.userAgent.toLowerCase();
    this.isFirefox = /firefox/.test(agent);
    this.isHuawei = huaweiUA.test(agent);
    this.isSamsung = samsungUA.test(agent);

    // picture guide
    let platform = 'window'; // Default
    if (this.isIOS) {
      platform = 'ios';
      if (this.plt.is('ipad')) {
        platform = 'ios_ipad';
        this.isIpad = true;
      }
    }
    else if (this.isAndroid) { platform = 'android'; }
    if (this.isHuawei) { platform = 'huawei'; this.isAndroid = false; }
    else if (this.isSamsung) { platform = 'samsung'; this.isAndroid = false; }

    // other case for handheld
    if (platform === 'window' && this.isMobileOrTablet) {
      platform = 'android';
      this.isAndroid = true;
      this.isOthers = true;
    }

    const path = `assets/guide/${platform}_setting_`;
    let total = this.windowNum;
    if (this.isIOS) { total = this.iosNum; }
    else if (this.isAndroid) { total = this.androidNum; }
    if (this.isHuawei) { total = this.huaweiNum; }
    else if (this.isSamsung) { total = this.samsungNum; }

    for (let i = 1; i <= total; i++) {
      const item = { path: `${path}${i}.jpg`, loaded: false };
      this.items.push(item);
    }
  }

  changeDomain() {
    window.location.href = this.secureUrl;
  }

  checkSetup(): Promise<boolean> {
    return InitGuard.checkInit(this.http);
  }

  finish() {
    this.changeDomain();
  }

  get isIOS() { return this.plt.is('ios'); }

  get isMobileOrTablet() { return isHandheldPlatform(this.plt); }

  load(item) {
    item.loaded = true;
  }

}
