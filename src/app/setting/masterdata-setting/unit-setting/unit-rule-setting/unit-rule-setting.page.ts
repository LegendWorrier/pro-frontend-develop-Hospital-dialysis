import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, Injector } from '@angular/core';
import { Platform } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { ServiceURL } from 'src/app/service-url';
import { UnitSettingService } from 'src/app/share/service/unit-setting.service';
import { UnitSetting } from 'src/app/share/unit-setting';
import { addOrEdit } from 'src/app/utils';

@Component({
  selector: 'app-unit-rule-setting',
  templateUrl: './unit-rule-setting.page.html',
  styleUrls: ['./unit-rule-setting.page.scss'],
})
export class UnitRuleSettingPage implements OnInit {

  @Input() unitName: string;
  @Input() unitId: number;

  setting: UnitSetting;

  hasPermission: boolean;

  get width() { return this.plt.width(); }

  constructor(
    private service: UnitSettingService,
    private auth: AuthService,
    private plt: Platform,
    private injector: Injector) { }

  ngOnInit() {
    this.hasPermission = this.auth.currentUser.checkPermission('unit-setting');
    this.service.getUnitSetting(this.unitId).subscribe(data => this.setting = data);
  }

  save() {
    addOrEdit(this.injector, {
      addOrEditCall: this.service.setUnitSetting(this.unitId, this.setting),
      successTxt: 'Update unit rules and settings successfully.'
    });
  }

}


