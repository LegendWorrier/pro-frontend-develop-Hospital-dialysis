import { Component, OnInit } from '@angular/core';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { StockableSettingPage } from '../stockable-base-setting/stockable-base-setting.page';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-med-supply-setting',
  templateUrl: '../stockable-base-setting/stockable-base-setting.page.html',
  styleUrls: ['./med-supply-setting.page.scss', '../stockable-base-setting/stockable-base-setting.page.scss'],
})
export class MedSupplySettingPage extends StockableSettingPage {

  constructor(private master: MasterdataService, auth: AuthService) {
    super(auth);
    this.getCall = master.getMedSupplyList();
    this.addCall = (item) => this.master.addMedSupply(item);
    this.editCall = (item) => this.master.editMedSupply(item);
    this.deleteCall = (item) => this.master.deleteMedSupply(item);
    this.name = 'Medical Supply';
    this.canEdit = this.auth.currentUser.checkPermission('med-supply');
  }

}
