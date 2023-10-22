import { GUID, emptyGuid } from 'src/app/share/guid';
import { getName, checkGuidNullOrEmpty } from 'src/app/utils';
import { UserService } from 'src/app/auth/user.service';
import { User } from 'src/app/auth/user';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Unit } from 'src/app/masterdata/unit';
import { AuthService } from 'src/app/auth/auth.service';
import { UnitDetailPage } from './unit-detail/unit-detail.page';

@Component({
  selector: 'app-unit-setting',
  templateUrl: './unit-setting.page.html',
  styleUrls: ['./unit-setting.page.scss']
})
export class UnitSettingPage implements OnInit {

  constructor(private master: MasterdataService, private user: UserService, private auth: AuthService) {
    this.getUnitList = this.master.getUnitList();
    this.deleteUnit = (item) => this.master.deleteUnit(item);
  }

  warning = 'Are you sure to delete this unit? (This may result in orphaned users and patients. You will need to re-assign the unit manually for each one of them.)';

  getUnitList: Observable<Data[]>;
  deleteUnit: (item: any) => Observable<void>;
  editPage = UnitDetailPage;
  get getParams() { return (unit: Unit) => ({ unit, canEdit: this.canEdit, canDelete: this.canDelete }); }

  canDelete = true;
  canEdit = false;

  allUser: User[] = [];
  headNurses: User[];

  ngOnInit(): void {
    this.user.getAllUser().subscribe(data => {
      this.allUser = data;
      this.headNurses = data.filter(x => x.isHeadNurse && !x.isPowerAdmin);
    });
    
    this.canEdit = this.auth.currentUser.checkPermission('unit');
  }

  // Save change
  onSave(unit: Unit) {
    if (!checkGuidNullOrEmpty(unit.headNurse)) {
      const headNurse = this.allUser.find(x => x.id === unit.headNurse);
      if (!headNurse.units.includes(unit.id)) {
        headNurse.units.push(unit.id);
        this.user.editUser(headNurse).subscribe({
          next: () => {
            console.log(`auto-assigned unit for ${getName(headNurse)}`, headNurse);
          },
          error: (err) => {
            console.log('auto-assign unit failed', err);
          }
        });
      }
    }
  }

  onUpdateList(list: Unit[]) {
    this.canDelete = list.length > 1;
  }

  headNurseName(id: string | GUID) {
    if (checkGuidNullOrEmpty(id)) {
      return null;
    }

    const user = this.allUser.find(x => x.id === id);
    if (user) {
      return getName(user);
    }

    return '??';
  }

  isHeadNurse(id: string | GUID) {
    if (checkGuidNullOrEmpty(id)) {
      return true;
    }

    return this.allUser.find(x => x.id === id)?.isHeadNurse || false;
  }

  isInUnit(id: string | GUID, unitId: number) {
    if (checkGuidNullOrEmpty(id)) {
      return true;
    }

    return this.allUser.find(x => x.id === id)?.units.includes(unitId) || false;
  }

}
