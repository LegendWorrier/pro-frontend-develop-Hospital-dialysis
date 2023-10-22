import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ServiceURL } from 'src/app/service-url';
import { ServiceBase } from './service-base';
import { RoleInfo } from 'src/app/auth/role-info';
import { Cache } from 'src/app/share/cache';
import { of } from 'rxjs';
import { User } from 'src/app/auth/user';

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends ServiceBase {

  constructor(http: HttpClient) { super(http) }

  getAllPermissions(clearCache?: boolean) {
    if (clearCache || !Cache.allPermissions) {
      return this.http.get<{permissions: PermissionInfo[], groups: PermissionGroupInfo[]}>(this.API_URL + ServiceURL.permission_getall)
        .pipe(tap({
          next: (data) => {
            Cache.allPermissions = data;
          }
        }));
    }
    else {
      return of(Cache.allPermissions);
    }
  }

  getAllRoles() {
    return this.http.get<RoleInfo[]>(this.API_URL + ServiceURL.permission_role_getall);
  }

  getUserPermissions(user: User) {
    return this.http.get<{ permissions: string[], roles: string[]}>(this.API_URL + ServiceURL.permission_user_get.format(user.id));
  }

  editUserPermissions(user: User, roles: string[], permissions: string[]) {
    return this.http.post<void>(this.API_URL + ServiceURL.permission_user_edit.format(user.id), {
      permissions,
      roles
    });
  }

  addRole(role: RoleInfo) {
    return this.http.post<RoleInfo>(this.API_URL + ServiceURL.permission_role_add, {
      roleName: role.name,
      permissions: role.permissions
    });
  }

  editRole(role: RoleInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.permission_role_edit.format(role.id), {
      roleName: role.name,
      permissions: role.permissions
    });
    
  }

  deleteRole(role: RoleInfo) {
    return this.http.delete<void>(this.API_URL + ServiceURL.permission_role_delete.format(role.id));
  }

}

export interface PermissionInfo {
  name: string;
  description: string;
  groupId?: number;
  forAll: boolean;
}

export interface PermissionGroupInfo {
  id: number;
  name: string;
  description: string;
}
