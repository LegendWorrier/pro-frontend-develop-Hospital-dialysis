import { Component, OnInit } from '@angular/core';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { StatusCategories } from 'src/app/enums/status-categories';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-status-setting',
  templateUrl: './status-setting.page.html',
  styleUrls: ['./status-setting.page.scss'],
})
export class StatusSettingPage implements OnInit {

  getStatusList: Observable<Data[]>;
  addStatus: (item: any) => Observable<Data>;
  editStatus: (item: any) => Observable<void>;
  deleteStatus: (item: any) => Observable<void>;

  canEdit = false;
  categories: StatusCategories[];

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getStatusList = this.master.getStatusList();
    this.addStatus = (item) => this.master.addStatus(item);
    this.editStatus = (item) => this.master.editStatus(item);
    this.deleteStatus = (item) => this.master.deleteStatus(item);

    this.categories = Object.values(StatusCategories);
  }

  ngOnInit() {
    
    this.canEdit = this.auth.currentUser.checkPermission('status');
  }

}
