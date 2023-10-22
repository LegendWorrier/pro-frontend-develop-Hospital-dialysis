import { DialysisPrescriptionSetting } from './../../IAppConfig';
import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/share/service/config.service';
import { AppConfig } from 'src/app/app.config';

@Component({
  selector: 'app-prescription-setting',
  templateUrl: './prescription-setting.page.html',
  styleUrls: ['./prescription-setting.page.scss'],
})
export class PrescriptionSettingPage implements OnInit {

  setting: DialysisPrescriptionSetting;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.setting = Object.assign({}, AppConfig.config.prescription);
  }

  async save() {
    const formData = new FormData();
    formData.append('prescription', JSON.stringify(this.setting));
    await this.configService.updateConfig(formData, {
      onError: (_) =>
      // reset
      this.setting = Object.assign({}, AppConfig.config.prescription),
      onSuccess: () => 
      AppConfig.config.prescription = this.setting
    });
  }

}
