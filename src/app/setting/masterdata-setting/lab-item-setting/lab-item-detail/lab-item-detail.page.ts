import { LabCategory, LabItemInfo } from './../../../../masterdata/labItem';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, IonNav, NavParams } from '@ionic/angular';
import { AppConfig } from 'src/app/app.config';
import { TRTMappingLab } from 'src/app/enums/trt-lab';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { addOrEdit, onLeavePage, presentToast, ToastType } from 'src/app/utils';

@Component({
  selector: 'app-lab-item-detail',
  templateUrl: './lab-item-detail.page.html',
  styleUrls: ['./lab-item-detail.page.scss'],
})
export class LabItemDetailPage implements OnInit {
  @Input() labItem: LabItemInfo;
  @Input() canEdit = false;

  tmp: LabItemInfo;

  trtEnable = AppConfig.config.enableTRTMap;

  categories: {t: string, v: number}[] = Object.keys(LabCategory).filter(key =>
    !isNaN(Number(LabCategory[key]))).map(x => ({ t: x, v: LabCategory[x] }));
  trtMaps: {t: string, v: number}[] = Object.keys(TRTMappingLab).filter(key =>
    !isNaN(Number(TRTMappingLab[key]))).map(x => ({ t: x, v: TRTMappingLab[x] }));
  editMode: boolean;

  markForUpdate: boolean;

  error: string;

  @ViewChild(IonContent) content: IonContent;

  constructor(private masterdata: MasterdataService, private injector: Injector, private nav: IonNav, private navParam: NavParams) { }

  ngOnInit() {
    if (this.labItem) {
      this.editMode = true;
      this.tmp = Object.assign({}, this.labItem);
    }
    else {
      this.tmp = { id: 0, unit: null, category: LabCategory.OneMonth } as LabItemInfo;
    }

    if (this.tmp.isYesNo === undefined) {
      this.tmp.isYesNo = false;
    }
  }

  save() {
    if (this.tmp.isYesNo) {
      this.tmp.lowerLimit = 0;
      this.tmp.upperLimit = 1;
      this.tmp.unit = '-';
    }

    const $callToServer = this.editMode ?
        this.masterdata.editLabItem(this.tmp) :
        this.masterdata.addLabItem(this.tmp);
    addOrEdit(this.injector, {
      addOrEditCall: $callToServer,
      successTxt: {
        name: 'Lab Item',
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
    this.masterdata.deleteLabItem(this.labItem).subscribe(() => {
      presentToast(this.injector, {
        header: 'Deleted',
        message: 'Lab Item deleted',
        type: ToastType.alert
      });
      this.markForUpdate = true;
      this.labItem.id = undefined;
      this.nav.pop();
    });
  }

  ionViewWillLeave(){
    let data = null;
    if (this.markForUpdate) {
      data = this.labItem;
    }
    onLeavePage(data, this.navParam);
  }

}
