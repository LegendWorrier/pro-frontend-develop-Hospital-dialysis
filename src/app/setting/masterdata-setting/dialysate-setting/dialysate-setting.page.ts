import { Component, OnInit } from '@angular/core';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Dialysate } from 'src/app/masterdata/dialysate';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

@Component({
  selector: 'app-dialysate-setting',
  templateUrl: './dialysate-setting.page.html',
  styleUrls: ['./dialysate-setting.page.scss'],
})
export class DialysateSettingPage implements OnInit {

  getDataList: Observable<Dialysate[]>;
  addData: (item: any) => Observable<Data>;
  editData: (item: any) => Observable<void>;
  deleteData: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getDialysateList();
    this.addData = (item) => this.master.addDialysate(item);
    this.editData = (item) => this.master.editDialysate(item);
    this.deleteData = (item) => this.master.deleteDialysate(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('dialysate');
  }

}
