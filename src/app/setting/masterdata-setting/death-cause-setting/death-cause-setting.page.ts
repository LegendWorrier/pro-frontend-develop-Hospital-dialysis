import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

@Component({
  selector: 'app-death-cause-setting',
  templateUrl: './death-cause-setting.page.html',
  styleUrls: ['./death-cause-setting.page.scss'],
})
export class DeathCauseSettingPage implements OnInit {

  getDeathCauseList: Observable<Data[]>;
  addDeathCause: (item: any) => Observable<Data>;
  editDeathCause: (item: any) => Observable<void>;
  deleteDeathCause: (item: any) => Observable<void>;

  canEdit = false;

  constructor(private master: MasterdataService, private auth: AuthService) {
    this.getDeathCauseList = this.master.getDeathCauseList();
    this.addDeathCause = (item) => this.master.addDeathCause(item);
    this.editDeathCause = (item) => this.master.editDeathCause(item);
    this.deleteDeathCause = (item) => this.master.deleteDeathCause(item);
  }

  ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermission('death-cause');
  }

}
