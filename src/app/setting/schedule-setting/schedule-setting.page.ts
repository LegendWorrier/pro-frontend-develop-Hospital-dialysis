import { Component, Injector, OnInit } from '@angular/core';
import { ScheduleSetting } from 'src/app/schedule/schedule-setting';
import { ScheduleService } from 'src/app/schedule/schedule.service';
import { ToastType, addOrEdit, presentToast } from 'src/app/utils';

@Component({
  selector: 'app-schedule-setting',
  templateUrl: './schedule-setting.page.html',
  styleUrls: ['./schedule-setting.page.scss'],
})
export class ScheduleSettingPage implements OnInit {

  setting: ScheduleSetting;
  tmp: ScheduleSetting;

  constructor(private schedule: ScheduleService, private injector: Injector) { }

  ngOnInit() {
    this.schedule.getSetting().subscribe(data => {
      this.setting = data;
      this.tmp = Object.assign({}, data);
    });
  }

  save() {
    const call$ = this.schedule.setSetting(this.tmp);
    addOrEdit(this.injector,
      {
        addOrEditCall: call$,
        successTxt: 'Setting has been updated.',
        stay: true,
        isModal: true,
        errorCallback: (err) => {
          presentToast(this.injector, { message: 'Failed to update setting.', type: ToastType.alert});
          Object.assign(this.tmp, this.setting);
        },
        successCallback: () => {
          //Object.assign(this.setting, this.tmp);
        }
      });
  }

}
