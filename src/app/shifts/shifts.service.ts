import { ShiftHistorySetting } from './shift-history-setting';
import { Incharge } from './incharge';
import { Observable } from 'rxjs';
import { isDate } from 'date-fns';
import { ServiceURL } from 'src/app/service-url';
import { ShiftSlot } from './shift-slot';
import { ServiceBase } from './../share/service/service-base';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { UserShiftResult, UserShiftSuspend } from './user-shift';
import { ShiftInfo } from './shift-info';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService extends ServiceBase {

  constructor(http: HttpClient, private auth: AuthService, private master: MasterdataService) {
    super(http);
  }

  getHistoryList(): Observable<Date[]> {
    return this.http.get<Date[]>(this.API_URL + ServiceURL.shift_gethistory);
  }

  getAllShifts(month?: Date): Observable<UserShiftResult> {
    let params = new HttpParams;
    if (month) {
      params = params.set('month', month.toDateString());
    }
    return this.http.get<UserShiftResult>(this.API_URL + ServiceURL.shift_getall, { params });
  }

  getUnitShift(unitId: number, month?: Date): Observable<UserShiftResult> {
    let params = new HttpParams;
    if (month) {
      params = params.set('month', month.toDateString());
    }
    return this.http.get<UserShiftResult>(this.API_URL + ServiceURL.shift_getunit.format(unitId.toString()), { params });
  }

  createOrUpdateShifts(shifts: UserShiftResult, month?: Date) {
    const shiftSlots = ([] as ShiftSlot[]).concat(...shifts.users.map(x => x.shiftSlots.map(s => {
      s.date = new Date(s.date).toDateString();
      return s;
    })));
    const suspendedList = [];
    for (const user of shifts.users) {
      if (user.suspended || user.id) {
        const item = Object.assign({}, user);
        item.shiftSlots = [];
        item.month = new Date(item.month).toDateString();
        suspendedList.push(item as UserShiftSuspend);
      }
    }

    let params = new HttpParams;
    if (month) {
      params = params.set('month', month.toDateString());
    }

    return this.http.post<any>(this.API_URL + ServiceURL.shift_update, { shiftSlots, suspendedList, isSuspended: undefined }, { params });

  }

  createOrUpdateShiftsForSelf(month: Date, shifts: ShiftSlot[], isSuspended: boolean) {
    let params = new HttpParams({
      fromObject: {
        month: month.toDateString()
      }
    });

    const shiftSlots = shifts.map(s => {
      s.date = new Date(s.date).toDateString();
      return s;
    });
    
    return this.http.post<ShiftSlot[]>(this.API_URL + ServiceURL.shift_update_self, { shiftSlots, isSuspended }, { params });
  }

  startNext(unitId: number) {
    return this.http.put<boolean>(this.API_URL + ServiceURL.shift_start_next.format(unitId.toString()), null);
  }

  info(unitId: number) {
    return this.http.get<ShiftInfo>(this.API_URL + ServiceURL.shift_info.format(unitId.toString()));
  }

  isInCharge(unitId: number): Observable<boolean> {
    return this.http.get<boolean>(this.API_URL + ServiceURL.shift_incharge_check.format(unitId.toString()));
  }

  getIncharges(unitId: number) {
    return this.http.get<Incharge[]>(this.API_URL + ServiceURL.shift_incharge_get.format(unitId.toString()));
  }

  addOrUpdatIncharges(incharges: Incharge[]): Observable<boolean> {
    const request = [];
    incharges.forEach(item => {
      const incharge = Object.assign({}, item) as any;
      if (isDate(item.date)) {
        incharge.date = item.date.toDateString();
      }
      request.push(incharge);
    });
    return this.http.post<boolean>(this.API_URL + ServiceURL.shift_incharge_update, request);
  }

  clearShiftHistory(upperLimit: Date = null) {
    let params = new HttpParams;
    if (upperLimit) {
      params = params.set('upperLimit', upperLimit.toISOString());
    }
    return this.http.put(this.API_URL + ServiceURL.shift_clear_history, null, { params });
  }

  getHistorySetting() {
    return this.http.get<ShiftHistorySetting>(this.API_URL + ServiceURL.shift_history_setting);
  }

  setHistorySetting(setting: ShiftHistorySetting) {
    return this.http.put(this.API_URL + ServiceURL.shift_history_setting, setting);
  }

}
