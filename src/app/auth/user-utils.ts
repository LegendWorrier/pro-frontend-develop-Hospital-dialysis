
import { map } from "rxjs/internal/operators/map";
import { User } from "./user";
import differenceInMinutes from "date-fns/differenceInMinutes";
import { Observable } from "rxjs/internal/Observable";
import { UserService } from "./user.service";
import { Cache } from "../share/cache";

export namespace UserUtil {
    /**
   * Get doctor list, either from cache or newly fetched, then cache it for later use.
   * @param clear if set to 'true', will discard current cache and fetch new data instead.
   */
  export function getDoctorListFromCache(userService: UserService, clear?: boolean) {

    return new Promise<User[]>((resolve, reject) => {
      if (clear || !Cache.doctorListCache || Cache.doctorListCache.length === 0) {
        userService.getDoctorList().subscribe({
          next: (data) => {
            resolve(data);
          },
          error: (err) => {
            reject(err);
            throw err;
          }
        });
      }
      else {
        resolve(Cache.doctorListCache);
      }
    });
  }

  // =========================== Get All Nurses By Unit =========================
  // =========== temporary caches : mainly to prevent potentially too frequent calls to server =========
  // These caches will be cleared when Window is reloaded, or App is closed and re-openned.
  let forceReloadNurseList: boolean = false;
  const cacheTime = 20;

  export function forceRefreshCache() {
    forceReloadNurseList = true;
  }

  export function getLastCacheUpdate(unitId: number) { return Cache.allNursesCache[unitId]?.lastUpdate; }

  export function getNurseByUnit(unitId: number, userService: UserService) {
    return new Observable<User[]>((sub) => {
      const cached = Cache.allNursesCache[unitId];
      if (forceReloadNurseList || !cached || differenceInMinutes(new Date(), cached.lastUpdate) >= cacheTime) {
        forceReloadNurseList = false;
        userService.getNurseList(unitId === 0? undefined : unitId)
          .pipe(map(list => {
            const newCache = {
              list,
              lastUpdate: new Date()
            };
            Cache.allNursesCache[unitId] = newCache;
            return newCache.list;
          })).subscribe(data => sub.next(data));
      }
      else {
        sub.next(cached.list);
      }
    });
  }

  // special shortcut : use unitId = 0 as currentUser
  export function getNursesForCurrentUser(userService: UserService) {
    return getNurseByUnit(0, userService);
  }

}
