import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Ward } from 'src/app/masterdata/ward';

@Component({
  selector: 'app-ward-setting',
  templateUrl: './ward-setting.page.html',
  styleUrls: ['./ward-setting.page.scss'],
})
export class WardSettingPage  implements OnInit {

  getDataList: Observable<Ward[]>;
  addData: (item: any) => Observable<Ward>;
  editData: (item: any) => Observable<void>;
  deleteData: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getWardList();
    this.addData = (item) => this.master.addWard(item);
    this.editData = (item) => this.master.editWard(item);
    this.deleteData = (item) => this.master.deleteWard(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('ward');
  }

}
