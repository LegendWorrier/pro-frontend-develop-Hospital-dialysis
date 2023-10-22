import { GUID } from '../share/guid';
import { ServiceBase } from './../share/service/service-base';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { AdminRole } from '../enums/admin-roles';
import { ServiceURL } from '../service-url';
import { User } from './user';
import { UserInfo } from './user-info';
import { Roles } from '../enums/roles';
import { Cache } from '../share/cache';
import { deepCopy } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ServiceBase {

  constructor(private httpClient: HttpClient) {
    super(httpClient);
  }

  private static ADMIN_ROLES: string[];

  private userUpdate = new EventEmitter<{data: User, type: 'edit'|'del'}>();
  get onUserUpdate() { return this.userUpdate.asObservable(); }

  private static transformUserData(data: UserResult) {
    const user = Object.assign(new User, data.user);
    user.isPowerAdmin = data.roles.includes(AdminRole.PowerAdmin);
    user.isAdmin = user.isPowerAdmin || data.roles.includes(AdminRole.Admin);
    if (!user.isPowerAdmin) {
      user.role = <Roles>data.roles.find((x: string) => !UserService.getAdminRoles().includes(x));
    }
    return user;
  }

  private static getAdminRoles(): string[] {
    if (!this.ADMIN_ROLES) {
      this.ADMIN_ROLES = Object.keys(AdminRole).map(k => AdminRole[k]);
    }
    return this.ADMIN_ROLES;
  }

  getUser(id: GUID): Observable<User> {
    console.log(`userId: ${id}`);
    return this.httpClient.get<UserResult>(this.API_URL + ServiceURL.user_get.format(`${id}`))
    .pipe(map(UserService.transformUserData));
  }

  /**
   * Get all the users. Only includes users that are in current user's units.
   * (This API is already filtered from the server side.)
   *
   * @return {*}  {Observable<User[]>}
   * @memberof UserService
   */
  getAllUser(): Observable<User[]> {
    return this.httpClient.get<UserResult[]>(this.API_URL + ServiceURL.user_getall)
      .pipe(map(arr => arr.map(UserService.transformUserData)));
  }

  getDoctorList(unitId?: number): Observable<User[]> {
    let params = new HttpParams;
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    return this.httpClient.get<User[]>(this.API_URL + ServiceURL.user_doctor, { params })
      .pipe(
        map(data => {
          if (!unitId || unitId === 0) {
            // cache latest fetching
            Cache.doctorListCache = data;
          }
          return data;
        }));
  }

  getNurseList(unitId?: number): Observable<User[]> {
    let params = new HttpParams;
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    return this.httpClient.get<UserResult[]>(this.API_URL + ServiceURL.user_nurse, { params })
        .pipe(map(arr => arr.map(UserService.transformUserData)));
  }

  editUser(user: User, signature: Blob = null, profileEdit: boolean = false) {
    const tmp = Object.assign({}, user);
    const roles: string[] = [];
    if (!profileEdit) {
      if (user.role) {
        roles.push(user.role);
      }
      if (user.isAdmin) {
        roles.push(AdminRole.Admin);
      }
    }
    else {
      tmp.userName = undefined;
    }

    let body;
    if (signature) {
      const formData = new FormData();
      formData.append('application/json', JSON.stringify(tmp));
      formData.append('signature', signature, 'signature.' + signature.type.split('/').pop());
      body = formData;
    }
    else {
      body = tmp;
    }

    let request$ = this.httpClient.post<any>(this.API_URL + ServiceURL.user_edit.format(user.id as string), body);
    if (!user.isPowerAdmin && user.userName && roles.length > 0) {
      request$ = request$.pipe(
        mergeMap((data) =>
          this.httpClient.post<any>(this.API_URL + ServiceURL.user_changerole.format(user.id as string), roles).pipe(map(_ => data))
        )
      );
    }

    return request$.pipe(tap((data) => {
      if (data?.signature) {
        user.signature = data.signature;
      }
      this.userUpdate.emit({ data: user, type: 'edit' });
    }));
  }

  changePassword(user: User, oldPassword: string, newPassword: string) {
    const body = {
      id: user.id,
      oldPassword,
      newPassword
    };
    return this.httpClient.post(this.API_URL + ServiceURL.user_changepassword.format(user.id as string), body);
  }

  deleteUser(user: User) {
    return this.httpClient.delete<any>(this.API_URL + ServiceURL.user_delete.format(user.id as string))
      .pipe(tap(() => this.userUpdate.emit({ data: user, type: 'del' })));
  }

}

export interface UserResult {
  user: UserInfo;
  roles: string[]
}