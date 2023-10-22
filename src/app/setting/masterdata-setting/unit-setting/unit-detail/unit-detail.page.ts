import { Component, Input, OnInit, Injector, ViewChild } from '@angular/core';
import { IonContent, IonNav, NavParams } from '@ionic/angular';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Unit } from 'src/app/masterdata/unit';
import { emptyGuid } from 'src/app/share/guid';
import { ToastType, addOrEdit, checkGuidNullOrEmpty, getName, onLeavePage, presentToast } from 'src/app/utils';
import { UnitRuleSettingPage } from '../unit-rule-setting/unit-rule-setting.page';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-unit-detail',
  templateUrl: './unit-detail.page.html',
  styleUrls: ['./unit-detail.page.scss'],
})
export class UnitDetailPage implements OnInit {
  @Input() unit: Unit;
  @Input() canEdit: boolean;
  @Input() canDelete: boolean;

  allUser: User[] = [];
  headNurses: User[];

  tmp: Unit;

  editMode: boolean;
  error: string;

  markForUpdate: boolean;

  @ViewChild('content') content: IonContent;

  constructor(
    private user: UserService,
    private masterdata: MasterdataService,
    private nav: IonNav,
    private navParam: NavParams,
    private injector: Injector) { }

  ngOnInit() {
    if (this.unit) {
      this.editMode = true;
      this.tmp = Object.assign({}, this.unit);
    }
    else {
      this.tmp = { id: 0, name: null, code: null, headNurse: null };
    }

    this.user.getAllUser().subscribe(data => {
      this.allUser = data;
      this.headNurses = data.filter(x => x.isHeadNurse && !x.isPowerAdmin);
    });
  }

  getName = getName;

  getSelectableHeadNurses() {
    if (checkGuidNullOrEmpty(this.tmp.headNurse)) {
      return this.headNurses;
    }

    // reset option
    const none = new User;
    none.id = emptyGuid();
    none.userName = 'None';

    return this.headNurses.concat([none]);
  }

  ionViewWillLeave() {
    let passing = null;
    if (this.markForUpdate) {
      passing = this.tmp;
    }
    onLeavePage(passing, this.navParam);
  }

  save() {
    if (this.tmp.isYesNo) {
      this.tmp.lowerLimit = 0;
      this.tmp.upperLimit = 1;
      this.tmp.unit = '-';
    }

    const $callToServer = this.editMode ?
        this.masterdata.editUnit(this.tmp) :
        this.masterdata.addUnit(this.tmp);
    addOrEdit(this.injector, {
      addOrEditCall: $callToServer,
      successTxt: {
        name: 'Unit',
        editMode: this.editMode
      },
      isModal: true,
      errorCallback: (err) => {
        this.error = err;
      },
      content: this.content,
      successCallback: (data) => {
        if (data) {
          this.tmp = data;
        }
        this.masterdata.setTmp(this.tmp);
      },
      completeCallback: () => this.error = null
    });
  }

  delete() {
    this.masterdata.deleteUnit(this.unit).subscribe(() => {
      presentToast(this.injector, {
        header: 'Deleted',
        message: 'The Unit has been deleted',
        type: ToastType.alert
      });
      this.markForUpdate = true;
      this.unit.id = undefined;
      this.nav.pop();
    });
  }

  settings() {
    this.nav.push(UnitRuleSettingPage, { unitId: this.unit.id, unitName: this.unit.name })
  }

}
