import { addOrEdit, presentToast, ToastType } from 'src/app/utils';
import { ShiftsService } from './../../shifts/shifts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Component, OnInit, Injector } from '@angular/core';
import { ShiftHistorySetting } from 'src/app/shifts/shift-history-setting';

@Component({
  selector: 'app-shift-history-setting',
  templateUrl: './shift-history-setting.page.html',
  styleUrls: ['./shift-history-setting.page.scss'],
})
export class ShiftHistorySettingPage implements OnInit {

  canEdit: boolean = true;
  setting: ShiftHistorySetting;

  tmp: ShiftHistorySetting = null;

  limitOptions = [
    { v: '10Y', t: '10 years' },
    { v: '5Y', t: '5 years' },
    { v: '3Y', t: '3 years' },
    { v: '2Y', t: '2 years' },
    { v: '1Y', t: 'a year' },
    { v: '9M', t: '9 Months' },
    { v: '6M', t: '6 Months' },
    { v: '3M', t: '3 Months' },
    { v: '1M', t: 'a Month' }
  ];

  constructor(private auth: AuthService, private shift: ShiftsService, private injector: Injector) { }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('shift-history');
    this.shift.getHistorySetting().subscribe(data => {
      this.setting = data;
      this.tmp = Object.assign({}, this.setting) as ShiftHistorySetting;
    });
  }

  clear() {
    const call$ = this.shift.clearShiftHistory();
    addOrEdit(this.injector,
      {
        addOrEditCall: call$,
        successTxt: 'Cleared history.',
        stay: true,
        isModal: true,
        errorCallback: (err) => {
          presentToast(this.injector, { message: 'Cannot clear history. Please try again.', type: ToastType.alert});
        },
        successCallback: () => {
        }
      });
  }

  save() {
    const call$ = this.shift.setHistorySetting(this.tmp);
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
          Object.assign(this.setting, this.tmp);
        }
      });
  }

}
