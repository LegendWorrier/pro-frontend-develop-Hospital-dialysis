import { Data } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Needle } from 'src/app/masterdata/needle';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-needle-setting',
  templateUrl: './needle-setting.page.html',
  styleUrls: ['./needle-setting.page.scss'],
})
export class NeedleSettingPage implements OnInit {

  getDataList: Observable<Needle[]>;
  addData: (item: any) => Observable<Data>;
  editData: (item: any) => Observable<void>;
  deleteData: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getNeedleList();
    this.addData = (item) => this.master.addNeedle(item);
    this.editData = (item) => this.master.editNeedle(item);
    this.deleteData = (item) => this.master.deleteNeedle(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('needle');
  }

}
