import { ConfigService } from './../../share/service/config.service';
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AppConfig } from 'src/app/app.config';
import { DialysisRecordSetting } from 'src/app/IAppConfig';

@Component({
  selector: 'app-dialysis-record-setting',
  templateUrl: './dialysis-record-setting.page.html',
  styleUrls: ['./dialysis-record-setting.page.scss'],
})
export class DialysisRecordSettingPage implements OnInit {

  constructor(
    private alertCtl: AlertController,
    private configService: ConfigService) {
  }

  static ALL = 38; // manually count all the available fields of dialysis records

  dialysisRecord: DialysisRecordSetting = {};

  ngOnInit() {
    if (AppConfig.config.dialysisRecord) {
      this.dialysisRecord = Object.assign({}, AppConfig.config.dialysisRecord);
    }
  }

  toggleAll() {
    let yes = 0;
    let no = 0;
    const all = DialysisRecordSettingPage.ALL;
    Object.keys(this.dialysisRecord).forEach(e => this.dialysisRecord[e] ? yes++ : no++ );
    let toggle = false;
    if (no === all || (yes > no && yes < all) || (yes < all && no === 0)) {
      toggle = true;
    }
    // if (yes === all || (no > yes && no < all)) {
    //   toggle = false;
    // }

    this.dialysisRecord.acLoading = toggle;
    this.dialysisRecord.acMaintain = toggle;
    this.dialysisRecord.ap = toggle;
    this.dialysisRecord.bc = toggle;
    this.dialysisRecord.bfav = toggle;
    this.dialysisRecord.bfr = toggle;
    this.dialysisRecord.bpd = toggle;
    this.dialysisRecord.bps = toggle;
    this.dialysisRecord.dc = toggle;
    this.dialysisRecord.dcTarget = toggle;
    this.dialysisRecord.dfr = toggle;
    this.dialysisRecord.dialysate = toggle;
    this.dialysisRecord.dp = toggle;
    this.dialysisRecord.dt = toggle;
    this.dialysisRecord.dtTarget = toggle;
    this.dialysisRecord.glucose50 = toggle;
    this.dialysisRecord.hav = toggle;
    this.dialysisRecord.hco3 = toggle;
    this.dialysisRecord.hr = toggle;
    this.dialysisRecord.mode = toggle;
    this.dialysisRecord.model = toggle;
    this.dialysisRecord.naProfile = toggle;
    this.dialysisRecord.naTarget = toggle;
    this.dialysisRecord.nss = toggle;
    this.dialysisRecord.number = toggle;
    this.dialysisRecord.remaining = toggle;
    this.dialysisRecord.rr = toggle;
    this.dialysisRecord.sRate = toggle;
    this.dialysisRecord.sTarget = toggle;
    this.dialysisRecord.sTemp = toggle;
    this.dialysisRecord.sTotal = toggle;
    this.dialysisRecord.temp = toggle;
    this.dialysisRecord.tmp = toggle;
    this.dialysisRecord.ufProfile = toggle;
    this.dialysisRecord.ufRate = toggle;
    this.dialysisRecord.ufTarget = toggle;
    this.dialysisRecord.ufTotal = toggle;
    this.dialysisRecord.vp = toggle;
    this.dialysisRecord.ktv = toggle;
    this.dialysisRecord.prr = toggle;
    this.dialysisRecord.recirculationRate = toggle;
    this.dialysisRecord.dbv = toggle;

  }

  async save() {
    let count = 0;
    Object.keys(this.dialysisRecord).forEach(e => this.dialysisRecord[e] ? count++ : null );
    if (count === DialysisRecordSettingPage.ALL) {
      const warning = await this.alertCtl.create({
        header: 'No field to show',
        message: 'All has been marked as hidden. There will be no any field to display.\nAre you sure?',
        buttons: [
          {
            text: 'Ok',
            role: 'ok'
          },
          {
            text: 'Cancel'
          }
        ]
      });
      warning.present();

      const result = await warning.onWillDismiss();
      if (result.role !== 'ok') {
        return;
      }
    }

    const formData = new FormData();
    formData.append('dialysisRecord', JSON.stringify(this.dialysisRecord));
    await this.configService.updateConfig(formData, {
      onError: (_) =>
      // reset
      this.dialysisRecord = Object.assign({}, AppConfig.config.dialysisRecord),
      onSuccess: () => {
        AppConfig.config.dialysisRecord = this.dialysisRecord;
      }
    });
  }

}
