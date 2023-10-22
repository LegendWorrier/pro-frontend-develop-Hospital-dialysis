import { firstValueFrom } from 'rxjs';
import { ConfigService } from './../../share/service/config.service';
import { AppConfig } from './../../app.config';
import { PatientSetting } from './../../IAppConfig';
import { Component, Injector, OnInit } from '@angular/core';
import { PatientRules } from 'src/app/patients/patient-rule';
import { PatientService } from 'src/app/patients/patient.service';
import { ToastType, addOrEdit, presentToast } from 'src/app/utils';

@Component({
  selector: 'app-patient-setting',
  templateUrl: './patient-setting.page.html',
  styleUrls: ['./patient-setting.page.scss'],
})
export class PatientSettingPage implements OnInit {

  setting: PatientSetting;

  rule: PatientRules;
  originalRule: PatientRules;

  constructor(private configService: ConfigService, private patientService: PatientService, private injector: Injector) { }

  async ngOnInit() {
    this.setting = Object.assign({}, AppConfig.config.patient);
    this.rule = Object.assign({}, this.originalRule = await firstValueFrom(this.patientService.getRule()));
  }

  async save() {
    const formData = new FormData();
    formData.append('patient', JSON.stringify(this.setting));
    await this.configService.updateConfig(formData, {
      onError: (_) =>
      // reset
      this.setting = Object.assign({}, AppConfig.config.patient),
      onSuccess: () => 
      AppConfig.config.patient = this.setting
    });
  }

  async saveRule() {
    const call$ = this.patientService.setRule(this.rule);
    addOrEdit(this.injector,
      {
        addOrEditCall: call$,
        successTxt: 'Rule has been updated.',
        stay: true,
        isModal: true,
        errorCallback: (err) => {
          presentToast(this.injector, { message: 'Failed to update rule.', type: ToastType.alert});
          Object.assign(this.rule, this.originalRule);
        },
        successCallback: () => {
          Object.assign(this.originalRule, this.rule);
        }
      });
  }

}
