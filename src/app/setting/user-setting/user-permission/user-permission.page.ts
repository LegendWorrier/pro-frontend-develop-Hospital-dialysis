import { Component, OnInit, Input, ViewChild, Injector } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { finalize, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { RoleInfo } from 'src/app/auth/role-info';
import { User } from 'src/app/auth/user';
import { Roles } from 'src/app/enums/roles';
import { PermissionService } from 'src/app/share/service/permission.service';
import { addOrEdit, getName } from 'src/app/utils';

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.page.html',
  styleUrls: ['./user-permission.page.scss'],
})
export class UserPermissionPage implements OnInit {

  @Input() user: User;
  @Input() allRoles: RoleInfo[];

  permissions: string[];
  roles: string[];

  fixedPermissions: string[];

  loading: boolean = true;
  error: string;

  isPowerAdmin: boolean;

  getName = getName;

  @ViewChild('addRoleSelect') roleSelect: IonSelect;

  constructor(
    private auth: AuthService,
    private permissionService: PermissionService,
    private injector: Injector) { }

  ngOnInit() {
    this.isPowerAdmin = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.hasGlobalPermission();
    this.permissionService.getUserPermissions(this.user)
    .pipe(
      tap({
        next: data => {
          this.permissions = data.permissions;
          this.roles = data.roles;
          if (this.allRoles) {
            this.updateFixedPermissionFromRoles();
          }
        }
      }))
      .subscribe();

    if (!this.allRoles) {
      this.permissionService.getAllRoles()
        .subscribe(data => {
          this.allRoles = data;
          if (this.roles) {
            this.updateFixedPermissionFromRoles();
          }
        });
    }
    
  }

  getSelectableRoles() {
    return (!this.allRoles || !this.roles) ? [] : this.allRoles.filter(x => x.name !== 'Administrator' && !this.roles.includes(x.name));
  }

  removeRole(role: string) {
    this.roles.splice(this.roles.findIndex(x => x === role), 1);
    this.updateFixedPermissionFromRoles();
  }

  addRole(role: string) {
    this.roles.push(role);
    this.updateFixedPermissionFromRoles();
    this.roleSelect.value = undefined;
  }

  updateFixedPermissionFromRoles() {
    this.fixedPermissions = [];
    this.roles.forEach(item => {
      const role = this.allRoles.find(x => x.name === item);
      this.fixedPermissions.push(...role.permissions);
    });
    if (this.user.isAdmin) {
      const admin = this.allRoles.find(x => x.name === 'Administrator');
      this.fixedPermissions.push(...admin.permissions);
    }
    this.fixedPermissions = [...new Set(this.fixedPermissions)];
  }

  save() {
    const call$ = this.permissionService.editUserPermissions(this.user, this.roles, this.permissions);

    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Update permissions successfully',
      isModal: true,
      errorCallback: (err) => this.error = err
    })
  }

}
