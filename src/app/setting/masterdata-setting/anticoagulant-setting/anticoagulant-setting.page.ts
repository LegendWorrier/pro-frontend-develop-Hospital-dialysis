import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

@Component({
  selector: 'app-antocoagulant-setting',
  templateUrl: './anticoagulant-setting.page.html',
  styleUrls: ['./anticoagulant-setting.page.scss'],
})
export class AnticoagulantSettingPage implements OnInit {

  getDataList: Observable<Data[]>;
  addData: (item: any) => Observable<Data>;
  editData: (item: any) => Observable<void>;
  deleteData: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDataList = this.master.getAnticoagulantList();
    this.addData = (item) => this.master.addAnticoagulant(item);
    this.editData = (item) => this.master.editAnticoagulant(item);
    this.deleteData = (item) => this.master.deleteAnticoagulant(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('ac');
  }

}
