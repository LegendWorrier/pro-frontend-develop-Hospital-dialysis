import { Component, OnInit } from '@angular/core';
import { Data } from '@angular/router';
import { IonNav } from '@ionic/angular';
import { Observable } from 'rxjs';
import { LabCategory, LabItemInfo } from 'src/app/masterdata/labItem';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { LabItemDetailPage } from './lab-item-detail/lab-item-detail.page';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-lab-item-setting',
  templateUrl: './lab-item-setting.page.html',
  styleUrls: ['./lab-item-setting.page.scss'],
})
export class LabItemSettingPage implements OnInit {
  getDataList: Observable<Data[]>;
  deleteData: (item: any) => Observable<void>;
  editPage = LabItemDetailPage;

  canEdit = false;

  get Categories() { return LabCategory; }

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getLabItemList();
    this.deleteData = (item) => this.master.deleteLabItem(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('lab-item');
  }

  get getParams() {
    return (item?: LabItemInfo) => {
      const param = { labItem: item, canEdit: this.canEdit };
      return param;
    };
  }

  get deleteCheck() {
    return (item: LabItemInfo) => !item.isSystemBound;
  }

}
