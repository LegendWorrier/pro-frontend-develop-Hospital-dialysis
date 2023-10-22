import { HemoSetting } from 'src/app/dialysis/hemo-setting';
import { LabHemosheetSettingPage } from './lab-hemosheet-setting/lab-hemosheet-setting.page';
import { IonNav } from '@ionic/angular';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { Component, OnInit, Injector } from '@angular/core';
import { presentToast, addOrEdit, ToastType } from 'src/app/utils';

@Component({
  selector: 'app-hemosheet-setting',
  templateUrl: './hemosheet-setting.page.html',
  styleUrls: ['./hemosheet-setting.page.scss'],
})
export class HemosheetSettingPage implements OnInit {

  autoCompleteOptions = [
    { txt: 'Don\'t Auto Complete', v: 'none'},
    { txt: 'On Dialysis Duration', v: 'duration'},
    { txt: 'On the End of The Day', v: 'eod'} // end of day
  ];

  delayOptions = [
    { txt: 'None', v: ''},
    { txt: '5 minutes', v: '5m'},
    { txt: '10 minutes', v: '10m'},
    { txt: '15 minutes', v: '15m'},
    { txt: '20 minutes', v: '20m'},
    { txt: '25 minutes', v: '25m'},
    { txt: '30 minutes', v: '30m'},
    { txt: '45 minutes', v: '45m'},
    { txt: '1 hour', v: '1h'},
    { txt: '2 hours', v: '2h'},
    { txt: '3 hours', v: '3h'},
    { txt: '4 hours', v: '4h'},
    { txt: '5 hours', v: '5h'},
    { txt: '6 hours', v: '6h'},
    { txt: '12 hours', v: '12h'}
  ];

  intervalOptions = [
    { txt: 'None', v: ''},
    { txt: 'every 5 minutes', v: '5m'},
    { txt: 'every 10 minutes', v: '10m'},
    { txt: 'every 15 minutes', v: '15m'},
    { txt: 'every 20 minutes', v: '20m'},
    { txt: 'every 25 minutes', v: '25m'},
    { txt: 'every 30 minutes', v: '30m'},
    { txt: 'every 45 minutes', v: '45m'},
    { txt: 'every 1 hour', v: '1h'}
  ];

  setting: HemoSetting.All;
  tmp: HemoSetting.All;

  constructor(private hemo: HemoDialysisService, private nav: IonNav, private injector: Injector) { }

  ngOnInit() {
    this.hemo.getSetting().subscribe(data => {
      this.setting = data;
      this.tmp = Object.assign({}, data);
    });

  }

  labSetting() {
    this.nav.push(LabHemosheetSettingPage);
  }

  private save(model: HemoSetting.All) {
    const call$ = this.hemo.setSetting(model);
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

  updateBasic() {
    const save = { basic: Object.assign({}, this.tmp.basic) } as HemoSetting.All;
    this.save(save)
  }

  updateRules() {
    const save = { rules: Object.assign({}, this.tmp.rules) } as HemoSetting.All;
    this.save(save);
  }

}
