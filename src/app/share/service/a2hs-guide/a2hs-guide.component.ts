import { isHandheldPlatform } from 'src/app/utils';
import { A2hsService } from './../a2hs.service';
import { Component, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-a2hs-guide',
  templateUrl: './a2hs-guide.component.html',
  styleUrls: ['./a2hs-guide.component.scss'],
})
export class A2hsGuideComponent implements OnInit {

  isMobileOrTablet = false;
  isIOS = false;
  isAndroid = false;

  isDesktopModeHint = false;

  isEdge = false;
  isSamsung = false;
  isHuawei = false;
  isChrome = false;
  isSafari = false;

  num = 1;
  prefix: string;
  imgsSrc: string[];

  // get agent() { return window.navigator.userAgent.toLocaleLowerCase(); }

  constructor(private a2hs: A2hsService, private plt: Platform, private modal: ModalController) { }

  ngOnInit() {
    const browser = this.a2hs.checkBrowser();
    const agent = window.navigator.userAgent.toLocaleLowerCase();

    this.isMobileOrTablet = isHandheldPlatform(this.plt);
    this.isIOS = this.plt.is('ios');
    this.isAndroid = this.plt.is('android') || /android/.test(agent);

    if (!this.isMobileOrTablet) {
      this.isDesktopModeHint = /x11/.test(agent) || !/windows|win64/.test(agent);
    }

    if (browser === 'samsung') {
      this.isSamsung = true;
      this.prefix = 'SamsungInternet';
    }
    if (browser === 'safari') {
      this.isSafari = true;
      this.num = 2;
      this.prefix = 'Safari';
    }
    if (browser === 'huawei') {
      this.isHuawei = true;
      this.num = 2;
      this.prefix = 'HuaweiBrowser';
    }
    if (browser === 'edge') {
      this.isEdge = true;
      this.prefix = 'Edge';
      if (this.isMobileOrTablet || this.isDesktopModeHint) {
        this.num = 2;
        this.prefix += 'Android';
      }
    }
    if (browser === 'chrome') {
      this.isChrome = true;
      this.prefix = 'Chrome';
      if (this.isMobileOrTablet || this.isDesktopModeHint) {
        this.num = 3;
        this.prefix += 'Android';
      }
    }
    // case ios, ask to use safari only
    if (this.isIOS) {
      this.num = 2;
      this.prefix = 'Safari';
    }

    this.imgsSrc = Array(this.num).fill(1).map((x, i) => 'assets/guide/install/' + this.getPrefix(i) + (this.num > 1 ? `_${x + i}` : '') + '.jpg');
  }

  getPrefix(i: number): string {
    if (this.isIOS && this.plt.is('ipad')) {
      return i === 0 ? this.prefix + '_ipad' : this.prefix;
    }
    return this.prefix;
  }

  close() {
    this.modal.dismiss();
  }

}
