import { firstValueFrom } from 'rxjs';
import differenceInMinutes from "date-fns/differenceInMinutes";
import { Unit } from "../masterdata/unit";
import { ShiftsService } from "../shifts/shifts.service";
import { User } from "./user";
import { Cache } from '../share/cache';
import { AuthService } from './auth.service';
import { MasterdataService } from '../masterdata/masterdata.service';

export namespace Auth {

  export function getUserUnits(allUnitList: Unit[], auth: AuthService) {
    if (auth.currentUser.isPowerAdmin) {
      return allUnitList.map(x => x.id);
    }
    return auth.currentUser.units;
  }

  export async function getUserUnitsFromCache(auth: AuthService, master: MasterdataService) {
    if (auth.currentUser.isPowerAdmin) {
        return (await master.getUnitListFromCache()).map(x => x.id);
    }
    return auth.currentUser.units;
  }
  
  export function checkPermission(item: User, auth: AuthService) {
    const thisUser = auth.currentUser;
    if (thisUser.isPowerAdmin) {
      return true;
    }
    if (item.isPowerAdmin || item.isAdmin) {
      return false;
    }

    return true;
  }
  
  export async function checkIsUnitHeadByUnitId(unitId: number, auth: AuthService, master: MasterdataService) {
    const unitList = await master.getUnitListFromCache();
    return checkIsUnitHead(unitList.find(x => x.id === unitId), auth);
  }
  
  export function checkIsUnitHead(unit: Unit, auth: AuthService) {
    if (!unit) {
      return false;
    }

    const thisUser = auth.currentUser;
    if (thisUser.id === unit.headNurse) {
      return true;
    }
  }
    
  export async function checkIsUnitHeadOrInCharge(unit: Unit, auth: AuthService, shiftService: ShiftsService) {
    if (checkIsUnitHead(unit, auth)) {
      return true;
    }

    if (!Cache.inchargeCache[unit.id] || differenceInMinutes(new Date(), Cache.inchargeCache[unit.id].lastUpdate) > Cache.cacheInterval) {
      const isInCharge = await firstValueFrom(shiftService.isInCharge(unit.id));
      Cache.inchargeCache[unit.id] = { lastUpdate: new Date(), isincharge: isInCharge};
    }
    if (Cache.inchargeCache[unit.id].isincharge) {
      return true;
    }

    return false;
  }
    
  export async function checkIsUnitHeadOrInChargeByUnitId(unitId: number, auth: AuthService, shiftService: ShiftsService, master: MasterdataService) {
    if (!unitId) {
      return false;
    }

    const unitList = await master.getListFromCache('unit') as Unit[];
    return await checkIsUnitHeadOrInCharge(unitList.find(x => x.id === unitId), auth, shiftService);
  }
 
}

