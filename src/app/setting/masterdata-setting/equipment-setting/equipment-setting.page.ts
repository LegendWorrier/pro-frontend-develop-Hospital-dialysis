import { Component, OnInit } from '@angular/core';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { StockableSettingPage } from '../stockable-base-setting/stockable-base-setting.page';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-equipment-setting',
  templateUrl: '../stockable-base-setting/stockable-base-setting.page.html',
  styleUrls: ['./equipment-setting.page.scss', '../stockable-base-setting/stockable-base-setting.page.scss'],
})
export class EquipmentSettingPage extends StockableSettingPage  implements OnInit {


  constructor(private master: MasterdataService, auth: AuthService) {
    super(auth);
    this.getCall = master.getEquipmentList();
    this.addCall = (item) => this.master.addEquipment(item);
    this.editCall = (item) => this.master.editEquipment(item);
    this.deleteCall = (item) => this.master.deleteEquipment(item);
    this.name = 'Equipment'
    this.canEdit = this.auth.currentUser.checkPermission('equipment');
  }

  ngOnInit() {}

}
