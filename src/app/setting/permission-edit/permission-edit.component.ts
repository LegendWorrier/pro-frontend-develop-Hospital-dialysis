import { finalize } from 'rxjs';
import { PermissionGroupInfo, PermissionInfo, PermissionService } from './../../share/service/permission.service';
import { Component, Input, OnInit } from '@angular/core';
import { Permission } from './../../share/permission';

@Component({
  selector: 'app-permission-edit',
  templateUrl: './permission-edit.component.html',
  styleUrls: ['./permission-edit.component.scss'],
})
export class PermissionEditComponent  implements OnInit {

  @Input() permissions: string[];

  @Input() fixed: string[];

  loading = true;

  all: {
    permissions: PermissionInfo[],
    groups: PermissionGroupInfo[]
  };

  groupHead: { [groupId: number]: string } = {};

  global = Permission.GLOBAL;

  constructor(private service: PermissionService) { }

  ngOnInit() {
    this.service.getAllPermissions()
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => {
        this.all = data;
        console.log(this.all);
        this.all.permissions.forEach(item => {
          if (item.groupId && item.forAll) {
            this.groupHead[item.groupId] = item.name;
          }
        });
      });
  }

  individualPermissions() {
    return this.all.permissions.filter(x => !x.groupId);
  }

  permissionsInGroup(group: PermissionGroupInfo) {
    return this.all.permissions.filter(x => x.groupId === group.id);
  }

  checkParentPermission(permission: PermissionInfo) {
    if (!permission.groupId || !this.groupHead[permission.groupId]) {
      return false;
    }
    if (permission.name === this.groupHead[permission.groupId] ) {
      return false;
    }
    return this.hasPermission(this.groupHead[permission.groupId]);
  }

  checkDisable(permission: PermissionInfo) {
    if (this.hasGlobal(this.fixed) || this.hasGlobal(this.permissions)) {
      return true;
    }
    if (this.fixed?.length > 0 && this.fixed.findIndex(x => x === permission.name) > -1) {
      return true;
    }
    return this.checkParentPermission(permission);
  }

  hasPermission(name: string) {
    if (!name) {
      return false;
    }
    if (this.hasGlobal(this.fixed) || this.hasGlobal(this.permissions)) {
      return true;
    }
    if (this.fixed?.findIndex(x => x === name) > -1) {
      return true;
    }
    return this.permissions.findIndex(x => x === name) > -1;
  }

  setPermission(name: string) {
    if (this.hasPermission(name)) {
      this.permissions.splice(this.permissions.findIndex(x => x === name), 1);
    }
    else {
      this.permissions.push(name);
    }
  }

  private hasGlobal(list: string[]): boolean {
    return list?.findIndex(x => x === Permission.GLOBAL) > -1 ?? false;
  }

}
