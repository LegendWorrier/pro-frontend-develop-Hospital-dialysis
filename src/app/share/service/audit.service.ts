import { GUID } from 'src/app/share/guid';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { UserService } from 'src/app/auth/user.service';
import { checkGuidEmpty, getName } from 'src/app/utils';
import { Audit, AuditInfo } from '../audit';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  /**
   * The objective of this table is, to provide short-term life time of cache for audit name
   * It is not intended to provide the life-long caching.
   */
  private static cacheNameTable: { [id: string]: string; } = {};
  private static fecthingList: { [id: string]: Observable<string>; } = {};

  constructor(private user: UserService) { }

  get CacheNameTable() {
    return AuditService.cacheNameTable;
  }

  async getAuditInfo(auditObject: Audit): Promise<AuditInfo> {

    const createdName = await this.getOrAddCacheName(auditObject.createdBy).toPromise();
    const updatedName = await this.getOrAddCacheName(auditObject.updatedBy).toPromise();

    return {
      createdName,
      updatedName,

      createdTime: auditObject.created,
      updatedTime: auditObject.updated
    };
  }

  getAuditFullName(userId: GUID) {
    return this.getOrAddCacheName(userId);
  }

  private getOrAddCacheName(userId: GUID): Observable<string> {
    const name = checkGuidEmpty(userId) ? 'System' : AuditService.cacheNameTable[`${userId}`];
    if (name) {
      return of(name);
    }

    let fetching = AuditService.fecthingList[`${userId}`];
    if (fetching) {
      return fetching;
    }

    fetching = this.user.getUser(userId).pipe(
      map(user => getName(user)),
      tap(x => {
        AuditService.cacheNameTable[`${userId}`] = x;
        AuditService.fecthingList[`${userId}`] = undefined;
      })
    );
    AuditService.fecthingList[`${userId}`] = fetching;
    return fetching;
  }

}
