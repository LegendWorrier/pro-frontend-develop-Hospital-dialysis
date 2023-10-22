import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

@Component({
  selector: 'app-underlying-setting',
  templateUrl: './underlying-setting.page.html',
  styleUrls: ['./underlying-setting.page.scss'],
})
export class UnderlyingSettingPage implements OnInit {

  getDataList: Observable<Data[]>;
  addData: (item: any) => Observable<Data>;
  editData: (item: any) => Observable<void>;
  deleteData: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getUnderlyingList();
    this.addData = (item) => this.master.addUnderlying(item);
    this.editData = (item) => this.master.editUnderlying(item);
    this.deleteData = (item) => this.master.deleteUnderlying(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('underlying');
  }

}
