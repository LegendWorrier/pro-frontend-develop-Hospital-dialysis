import { ShiftsService } from './../shifts/shifts.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AuthService } from 'src/app/auth/auth.service';
import { GUID } from 'src/app/share/guid';
import { PatientInfo } from './../patients/patient-info';
import { Observable, Subscription } from 'rxjs';
import { ServiceURL } from './../service-url';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, EventEmitter, Injector } from '@angular/core';
import { ServiceBase } from '../share/service/service-base';
import { ScheduleView, SlotView, SlotPatientView, SectionView } from './schedule-view';
import { ScheduleSection } from './section';
import { SectionSlots } from '../enums/section-slots';
import { SchedulePatient } from './schedule-patient';
import { Permissions } from '../enums/Permissions';
import { Unit } from '../masterdata/unit';
import { addDays, compareAsc, isSameDay, differenceInMinutes } from 'date-fns';
import { Schedule } from './schedule';
import { map, take, tap } from 'rxjs/operators';
import { presentToast, ToastType } from '../utils';
import { ScheduleSetting } from './schedule-setting';
import { Auth } from '../auth/auth-utils';
import { convertDateToSectionSlot, convertDateToStartTime, convertStartTimeToDate, endTime, getDateFromDay, getScheduleRangeLimit } from './schedule-utils';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService extends ServiceBase {

  get onScheduleUpdate() { return this._scheduleUpdate.asObservable(); }
  private _scheduleUpdate = new EventEmitter<ScheduleView>();

  get onNewPatientAdd() { return this._newPatientAdd.asObservable(); }
  private _newPatientAdd = new EventEmitter<PatientInfo>();

  private readonly cachedTime = 20; // minutes

  constructor(http: HttpClient, private auth: AuthService, private shiftService: ShiftsService, private master: MasterdataService) {
    super(http);
  }

  getTodayPatient(unitId?: number): Observable<PatientInfo[]> {
    let params = new HttpParams();
    if (unitId) {
      params = params.set('unitId', unitId);
    }

    return this.http.get<PatientInfo[]>(this.API_URL + ServiceURL.schedule_today, { params });
  }

  getSchedule(unitId: number, originUnit?: number): Observable<ScheduleView> {
    let params = new HttpParams();
    if (originUnit) {
      params = params.set('originUnit', originUnit);
    }
    return this.http.get<ScheduleView>(this.API_URL + ServiceURL.schedule_get.format(unitId.toString()),
    {
      params
    }).pipe(map(data => {
      const schedule = data;
      schedule.sections.forEach(x => x.section.start = convertStartTimeToDate(x.section.startTime).toISOString());
      this.schedulesCaches[unitId] = { schedule, lastUpdate: new Date() };
      this.processCaches[unitId] = this.processReschedule(schedule);
      this._scheduleUpdate.emit(schedule);
      console.log(data);

      return data;
    }));
  }

  getSection(sectionId: number): Observable<ScheduleSection> {
    return this.http.get<ScheduleSection>(this.API_URL + ServiceURL.schedule_section_get.format(sectionId.toString()));
  }

  getSections(unitId: number): Observable<ScheduleSection[]> {
    return this.getSectionView(unitId, true).pipe(map(x => x.sections));
  }

  getSectionView(unitId: number, noPending: boolean = false): Observable<{sections: ScheduleSection[], pendings: ScheduleSection[]}> {
    const params = { pendingChange: !noPending };
    return this.http.get<{sections: ScheduleSection[], pendings: ScheduleSection[]}>(
      this.API_URL + ServiceURL.schedule_section_getlist.format(unitId.toString()), { params });
  }

  getPendingOnly(unitId: number) {
    return this.http.get<ScheduleSection[]>(this.API_URL + ServiceURL.schedule_section_pending_get.format(unitId.toString()));
  }

  updateSections(unitId: number, sections: ScheduleSection[], deletes?: number[], targetDate?: Date): Observable<ScheduleSection[]> {
    const body = {
      sectionList: sections,
      deleteList: deletes,
      targetEffectiveDate: targetDate
    };
    return this.http.post<ScheduleSection[]>(this.API_URL + ServiceURL.schedule_section_update.format(unitId.toString()), body);
  }

  clearSectionsPending(unitId: number) {
    return this.http.put<any>(this.API_URL + ServiceURL.schedule_section_clear_pending.format(unitId.toString()), null);
  }

  slot(patient: PatientInfo, section: ScheduleSection, slot: SectionSlots) {
    const body = {
      sectionId: section.id,
      patientId: patient.id,
      slot
    };
    return this.http.post<any>(this.API_URL + ServiceURL.schedule_slot.format(section.unitId.toString()), body);
  }

  swapSlot(first: SlotView, firstPatient: string, second: SlotView, secondPatient: string = null) {
    const body = {
      first: { patientId: firstPatient, sectionId: first.sectionId, slot: first.slot },
      second: { patientId: secondPatient, sectionId: second.sectionId, slot: second.slot }
    };
    return this.http.post<any>(this.API_URL + ServiceURL.schedule_slot_swap, body);
  }

  deleteSlot(patient: PatientInfo, slotView: SlotView) {
    return this.http.delete(this.API_URL + ServiceURL.schedule_slot_delete.format(
      encodeURIComponent(patient.id),
      slotView.sectionId.toString(),
      slotView.slot.toString()));
  }

  reschedule(patient: PatientInfo, slotView: SlotView, date: Date, overrideUnitId?: number, originalDate?: Date, targetPatientId?: string)
  : Observable<(string|GUID)[]> {
    const body = {
      date,
      overrideUnitId,
      originalDate,
      targetPatientId
    };
    return this.http.post<(string|GUID)[]>
    (this.API_URL + ServiceURL.schedule_reschedule.format(encodeURIComponent(patient.id), slotView.sectionId.toString(), slotView.slot.toString())
    , body);
  }

  deleteReschedule(schedule: Schedule) {
    return this.http.delete(this.API_URL + ServiceURL.schedule_reschedule_delete.format(`${schedule.id}`));
  }

  getActiveSchedule(unitId: number): Observable<SchedulePatient[]> {
    return this.http.get<SchedulePatient[]>(this.API_URL + ServiceURL.schedule_active.format(unitId.toString()))
      .pipe(map(data => {
        this.activeScheduleCaches[unitId] = { schedules: data, lastUpdate: new Date() };
        return data;
      }));
  }
  checkScheduleEmpty(unitId: number): Observable<boolean> {
    return this.http.get<boolean>(this.API_URL + ServiceURL.schedule_isEmpty.format(`${unitId}`));
  }

  getMaxPerSlot(unitId: number): Observable<number> {
    return this.http.get<number>(this.API_URL + ServiceURL.schedule_max_get.format(unitId.toString()));
  }

  setMaxPerSlot(unitId: number, value: number) {
    return this.http.put<any>(this.API_URL + ServiceURL.schedule_max_set.format(unitId.toString(), value.toString()), null);
  }

  getSetting() {
    return this.http.get<ScheduleSetting>(this.API_URL + ServiceURL.schedule_setting);
  }

  setSetting(request: ScheduleSetting) {
    return this.http.put<void>(this.API_URL + ServiceURL.schedule_setting, request);
  }

  // ============================= Utils ================================

  /**
   * Check current user for permission to setting the target unit's schedule.
   *
   * Can also pass pre-calculated isUnitHeadOrInCharge to reduce redundant work load.
   *
   * @param {number} unitId
   * @param {boolean} [isUnitHeadOrInCharge]
   * @return {*} 
   * @memberof ScheduleService
   */
  async checkAuthorizedByUnitId(unitId: number, isUnitHead?: boolean) {
    const unitList = await this.master.getListFromCache('unit') as Unit[];
    const unit = unitList.find(x => x.id === unitId);

    return this._checkAuthorized(unit, isUnitHead);
  }

  /**
   * Check current user for permission to setting the target unit's schedule.
   * This variant accept the pre-fetched unit to reduce server call.
   *
   * Can also pass pre-calculated isUnitHeadOrInCharge to reduce redundant work load.
   *
   * @param {Unit} unit
   * @param {boolean} [isUnitHead]
   * @return {*} 
   * @memberof ScheduleService
   */
  async checkAuthorized(unit: Unit, isUnitHead?: boolean) {
    return this._checkAuthorized(unit, isUnitHead);
  }

  private async _checkAuthorized(unit: Unit, isUnitHead: boolean) {
    const isHeadNurse = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseOnly);
    const hasUnitPermission = this.auth.currentUser.units.find(x => x === unit.id);

    const isAuthorized = this.auth.currentUser.isPowerAdmin || (isHeadNurse && hasUnitPermission);
    if (isAuthorized) {
      return true;
    }

    isUnitHead = isUnitHead ?? Auth.checkIsUnitHead(unit, this.auth);
    if (isUnitHead) {
      return true;
    }
    return false;
  }

  /**
   * Util function for checking start time overlapping.
   *
   * @param {number} firstStart
   * @param {number} secondStart
   * @return {*} 
   * @memberof ScheduleService
   */
  isOverlapped(firstStart: number, secondStart: number) {
    const firstEnd = firstStart + 240;
    const secondEnd = secondStart + 240;

    return (firstStart <= secondStart && firstEnd > secondStart) || (firstStart < secondEnd && firstEnd >= secondEnd);
  }

  // ============ Error Handler ============
  ErrorHandle(err: any, injector: Injector): boolean
  {
    if (err instanceof HttpErrorResponse && err.status === 409) {
      const code = err.error.code as string;
      switch (code) {
        case 'MAX_NUMBER':
          presentToast(injector, {
            header: 'Limit exceeded',
            message: 'Max number of regular patients has been reached for the target schedule slot.',
            type: ToastType.alert
          });
          break;
        case 'OVER_MAX':
          presentToast(injector, {
            header: 'Too many schedules',
            message: 'The target schedule slot has too many occupied schedules.',
            type: ToastType.alert
          });
          break;
        case 'OCCUPIED_SLOT':
          presentToast(injector, {
            header: 'Schedule(s) existed',
            message: 'The patient has existing schedule(s) on this day. (remove existing schedule(s) first)',
            type: ToastType.alert
          });
          break;
        case 'DUP_SCHEDULE':
          presentToast(injector, {
            header: 'Duplicated schedule',
            message: 'The patient has already been scheduled on this day. (duplicated target date/time)',
            type: ToastType.alert
          });
          break;
        case 'PAST':
          presentToast(injector, {
            header: 'Invalid',
            message: 'Cannot target the past date.',
            type: ToastType.alert
          });
          break;
        case 'HISTORY':
          presentToast(injector, {
            header: 'Invalid',
            message: 'Cannot reschedule the past.',
            type: ToastType.alert
          });
          break;
        case 'SECTION_NULL':
          presentToast(injector, {
            header: 'Invalid',
            message: 'Invalid target time. (Please try refresh the app to update to latest meta data)',
            type: ToastType.alert
          });
          break;
        default:
          throw err;
      }
      return true;
    }
    return false;
  }

  // =========================================== Global main functionality ========================

  /**
   * Check max per slot for specific slot globally or specific target date individually.
   * Developer is responsible for making sure that all input data are from the same unit,
   * and slot and targetDate params are the exact matched.
   *
   * @param {SlotView} slot
   * @param {Schedule[]} reschedules
   * @param {RescheduleCache} cache
   * @param {number} max
   * @param {Date} [targetDate=null]
   * @return {*} 
   * @memberof ScheduleService
   */
  checkMaxPerSlot(slot: SlotView, reschedules: Schedule[], max: number, targetDate: Date = null) {
    const startOfThisWeek = getDateFromDay(SectionSlots.Mon);
    const isActive = (x: Schedule) => (!x.originalDate && new Date(x.date) >= startOfThisWeek)
          || (x.originalDate && new Date(x.originalDate) >= startOfThisWeek);

    if (targetDate) { // individual day | temporary mode
      const otherSchedulesCount = reschedules.filter(x => isActive(x) && x.sectionId === slot.sectionId && x.slot === slot.slot
        && x.originalDate && isSameDay(new Date(x.originalDate), targetDate)).length;
      const schedulesCount = reschedules.filter(x => isActive(x)
        && isSameDay(new Date(x.date), targetDate)
        && convertDateToStartTime(new Date(x.date)) === slot.sectionStartTime).length;
      const patientSlotsCount = slot.patientList.length;

      return patientSlotsCount + schedulesCount - otherSchedulesCount >= max;
    }
    else { // slot | permanent mode
      // occupied schedule(s) that would prevent slotting a patient
      const schedules = reschedules.filter(x => isActive(x)
        && convertDateToSectionSlot(new Date(x.date)) === slot.slot
        && convertDateToStartTime(new Date(x.date)) >= slot.sectionStartTime
        && convertDateToStartTime(new Date(x.date)) < slot.sectionStartTime + 240);
      const getKey = (s: Schedule) => new Date(s.date).getDate();
      const schedulesPerDay = schedules.groupBy(getKey);
      // console.log(Object.keys(schedulesPerDay));
      const maxSchedulesPerDay = Math.max(...Object.keys(schedulesPerDay).map(x => schedulesPerDay[x].length), 0);
      // console.log('max per day', maxSchedulesPerDay);
      return slot.patientList.length + maxSchedulesPerDay >= max;
    }
  }

  /**
   * Find nearest available point of time for target date/time,
   * on specific unit.
   *
   * If forward, find nearest in later time than target. Otherwise, find nearest in earlier than target.
   *
   * @param {Date} target
   * @param {boolean} forward
   * @param {boolean} [isPermanent=false]
   * @param {number} targetUnitId
   * @param {string} targetPatientId
   * @param {boolean} [isCross=false]
   * @return {*} 
   * @memberof ScheduleService
   */
  async findNearest(target: Date, forward: boolean, isPermanent: boolean = false,
                    targetUnitId: number, targetPatientId: string, isCross: boolean = false) {
    const cached = await this.getScheduleFromCache(targetUnitId, isCross).toPromise();
    const allSections = cached.schedule.sections;
    const sectionCount = allSections.length;
    if (sectionCount === 0) {
      return null;
    }
    const minStartTime = allSections[0].section.startTime;
    const maxStartTime = endTime(allSections[sectionCount - 1].section);
    const startTime = convertDateToStartTime(target);
    console.log('startTime', startTime);
    let currentDate: Date;
    let currentSlotDay = convertDateToSectionSlot(target);
    let sectionIndex;
    let currentSection: SectionView;
    let startOutsideRange = false;
    if (startTime < minStartTime) {
      startOutsideRange = true;
      sectionIndex = forward ? 0 : sectionCount - 1;
      currentSection = allSections[sectionIndex];
      currentDate = forward ? target : addDays(target, 1);
      console.log('earlier');
    }
    else if (startTime > maxStartTime) {
      startOutsideRange = true;
      sectionIndex = forward ? 0 : sectionCount - 1;
      currentSection = allSections[sectionIndex];
      currentDate = forward ? addDays(target, 1) : target;
      console.log('later');
    }
    else {
      currentDate = target;
      currentSection = allSections.find((x, i) => {
        const current = startTime >= x.section.startTime && startTime < endTime(x.section);
        if (current) { sectionIndex = i; }
        return current;
      });

      if (!currentSection) {
        console.log('cannot find section for the target date', target);
        throw new Error('cannot find section for the target date');
      }
    }

    const increment = () => {
      sectionIndex = (forward ? (++sectionIndex) : (--sectionIndex + sectionCount)) % sectionCount;
      currentSection = allSections[sectionIndex];
      if (forward && sectionIndex === 0) {
        currentSlotDay = SectionSlots.after(currentSlotDay);
        currentDate = addDays(currentDate, 1);
      }
      else if (!forward && sectionIndex === sectionCount - 1) {
        currentSlotDay = SectionSlots.before(currentSlotDay);
        currentDate = addDays(currentDate, -1);
      }
    };
    let lowerLimit: Date;
    let upperLimit: Date;
    if (isPermanent) {
      const targetDay = convertDateToSectionSlot(target);
      lowerLimit = addDays(target, -targetDay); // start of week
      upperLimit = addDays(target, SectionSlots.Sun - targetDay); // end of week
    }
    else {
      lowerLimit = new Date();
      upperLimit = getScheduleRangeLimit(lowerLimit);
    }

    // cross case, no pre-increment (check current section also)
    if (!startOutsideRange && !isCross) {
      increment();
    }

    const rescheduleList = cached.schedule.reschedules;
    const processCache = this.getProcessCache(targetUnitId);
    const max = await this.ensureMaxPerSlotCache(targetUnitId);
    const now = new Date();
    while (forward ? compareAsc(currentDate, upperLimit) <= 0 : compareAsc(currentDate, lowerLimit) >= 0) {
      currentDate = convertStartTimeToDate(currentSection.section.startTime, currentDate);
      if (!isPermanent && currentDate < now) {
        increment();
        continue;
      }
      const hasSchedule = processCache.patientSchedule[targetPatientId]
        ?.some(x => x.slot.sectionStartTime === currentSection.section.startTime && x.slot.slot === currentSlotDay
          && x.schedule.some(s => isSameDay(new Date(s.date), currentDate)));
      if (hasSchedule) {
        increment();
        continue;
      }
      const isFull = this.checkMaxPerSlot(
        currentSection.slots[currentSlotDay],
        rescheduleList,
        max,
        isPermanent ? null : currentDate);
      if (!isFull) {
        return currentDate;
      }
      increment();
    }

    return null;

  }

  /**
   * Find corresponding slot from schedule's date/time on specific unit (identified by scheduleView).
   *
   * @param {Schedule} schedule
   * @param {ScheduleView} scheduleView
   * @return {*} 
   * @memberof ScheduleService
   */
  getSlotForSchedule(schedule: Schedule, scheduleView: ScheduleView) {
    const date = new Date(schedule.date);
    const startTime = convertDateToStartTime(date);
    const section = scheduleView.sections.find(x => x.section.startTime <= startTime && endTime(x.section) > startTime);
    console.log(section);
    if (!section) {
      return null;
    }

    const slot = convertDateToSectionSlot(date);
    return section.slots[slot];
  }

  processReschedule(scheduleView: ScheduleView): RescheduleCache
  {
    const rescheduleSlots: RescheduleCache = { crossUnit: {}, patientSchedule: {}, orphaned: [] };
    if (scheduleView.sections.length === 0) {
      return rescheduleSlots;
    }
    else {
      scheduleView.sections.forEach(section => {
        const cached = rescheduleSlots[section.section.id] = {};
        section.slots.forEach(slotView => {
          cached[slotView.slot] = new Array(...slotView.patientList);
        });
      });
      scheduleView.patients.forEach(patient => {
        this.initPatientCache(patient, rescheduleSlots);
      });
    }
    scheduleView.reschedules.forEach(schedule => {
      this.updateCache(schedule, scheduleView, rescheduleSlots);
    });

    return rescheduleSlots;
  }

  initPatientCache(patient: PatientInfo, cache: RescheduleCache) {
    cache.crossUnit[patient.id] = {};
    cache.patientSchedule[patient.id] = [];
  }

  updateCache(item: Schedule, scheduleView: ScheduleView, cache: RescheduleCache) {
    const unitId = scheduleView.unitId;

    const schedule = item as Schedule;
    const slot = this.getSlotForSchedule(schedule, scheduleView);

    if (schedule.overrideUnitId && schedule.overrideUnitId !== unitId) {
      const cross = cache.crossUnit[schedule.patientId][`${schedule.sectionId}-${schedule.slot}`] =
      (cache.crossUnit[schedule.patientId][`${schedule.sectionId}-${schedule.slot}`] ?? []);
      cross.push(schedule);
    }
    else {
      if (!slot) {
        console.log('orphaned schedule detected', schedule);
        cache.orphaned.push(schedule);
        return;
      }
      const scheduleList = cache[slot.sectionId][slot.slot];
      scheduleList.push(schedule);
      const patientSchedule = cache.patientSchedule[schedule.patientId].find(x => x.slot === slot) ?? { slot, schedule: [] };
      if (!cache.patientSchedule[schedule.patientId].find(x => x.slot === slot)) {
        cache.patientSchedule[schedule.patientId].push(patientSchedule);
      }
      patientSchedule.schedule.push(schedule);
    }
  }

  updateAllCache(item: SlotPatientView | Schedule, slotView: SlotView, unitId: number, patient: PatientInfo) {
    const schedule = this.schedulesCaches[unitId].schedule;
    const processCache = this.processCaches[unitId];
    const isSchedule = (item as Schedule).date;

    if (!schedule.patients.some(x => x.id === patient.id)) {
      schedule.patients.push(patient);
      this.initPatientCache(patient, processCache);
      this._newPatientAdd.emit(patient);
    }

    if (!isSchedule) {
      slotView.patientList.push(item);
      processCache[slotView.sectionId][slotView.slot].push(item);

      let existingSlotPatient;
      const existingSlotPatientList = schedule.sections
        .filter(x => x.section.id !== slotView.sectionId)
        .map(x => x.slots[slotView.slot].patientList)
        .find(patientList => existingSlotPatient = patientList.find(s => s.patientId === patient.id));
      existingSlotPatientList?.splice(existingSlotPatientList.indexOf(existingSlotPatient), 1);
    }
    else {
      schedule.reschedules.push(item as Schedule);
      this.updateCache(item as Schedule, schedule, processCache);
    }
  }

  removeFromCache(slotPatient: SlotPatientView | Schedule, slotView: SlotView, cache: RescheduleCache) {
    console.log(slotView);
    console.log(cache);
    if (!cache[slotView.sectionId]) { // cross case
      const schedule = slotPatient as Schedule;
      const crossSlotCached = cache.crossUnit[slotPatient.patientId][`${schedule.sectionId}-${schedule.slot}`];
      if (crossSlotCached) {
        crossSlotCached.splice(crossSlotCached.indexOf(schedule), 1);
      }
      return;
    }
    const scheduleList = cache[slotView.sectionId][slotView.slot];
    scheduleList.splice(scheduleList.indexOf(slotPatient), 1);
    const patientSlotCached = cache.patientSchedule[slotPatient.patientId]
      .find(x => x.slot.sectionId === slotView.sectionId && x.slot.slot === slotView.slot);
    if (patientSlotCached) {
      cache.patientSchedule[slotPatient.patientId].splice(cache.patientSchedule[slotPatient.patientId].indexOf(patientSlotCached), 1);
    }
  }

  removeFromAllCache(item: SlotPatientView | Schedule, slotView: SlotView, unitId: number) {
    const isSchedule = (item as Schedule).date;
    if (!isSchedule) {
      slotView.patientList.splice(slotView.patientList.indexOf(item), 1);
    }
    const schedule = this.schedulesCaches[unitId].schedule;
    const processCache = this.processCaches[unitId];
    schedule.reschedules.splice(schedule.reschedules.indexOf(item as Schedule), 1);
    this.removeFromCache(item, slotView, processCache);
    // update UI
    if (isSchedule && (item as Schedule).overrideUnitId
        && (item as Schedule).overrideUnitId === unitId) {
      const sectionId = (item as Schedule).sectionId;
      // console.log('original section id', sectionId);
      const originalSection = ([] as ScheduleSection[])
        .concat(...Object.keys(this.schedulesCaches).map(key => this.schedulesCaches[key].schedule.sections.map(s => s.section)))
        .find(x => x?.id === sectionId);
      // console.log('original section', originalSection);
      if (originalSection) {
        this.removeFromCache(item, slotView, this.processCaches[originalSection.unitId]);
      }
    }
  }

  activeScheduleCount(patientId: string, slotView: SlotView, cache: RescheduleCache, limit: Date = null): {
    crossCount: number;
    scheduleCount: number;
    otherScheduleCount: number;
    otherSchedules: Schedule[];
    crossSchedules: Schedule[];
  } {
    const startOfThisWeek = getDateFromDay(SectionSlots.Mon);
    const isActive = (x: Schedule) => (!x.originalDate && new Date(x.date) >= startOfThisWeek)
          || (x.originalDate && new Date(x.originalDate) >= startOfThisWeek);

    const crossSchedules = cache.crossUnit[patientId][`${slotView.sectionId}-${slotView.slot}`]?.filter(isActive) ?? [];
    const crossCount = limit ? crossSchedules.filter(x => !x.originalDate
      || (x.originalDate && compareAsc(new Date(x.originalDate), limit) < 0)).length : crossSchedules.length;
    const patientSchedules = ([] as Schedule[]).concat(...cache.patientSchedule[patientId].map(x => x.schedule)).filter(isActive);

    const scheduleCount = patientSchedules.filter(s => !s.originalDate
      && s.sectionId === slotView.sectionId && s.slot === slotView.slot).length;
    const otherSchedules = patientSchedules.filter(x => x.originalDate
        && convertDateToSectionSlot(x.originalDate) === slotView.slot
        && convertDateToStartTime(x.originalDate) === slotView.sectionStartTime);
    const otherScheduleCount = limit ? otherSchedules.filter(x =>
      compareAsc(new Date(x.originalDate), limit) < 0).length : otherSchedules.length;

    return {
      crossCount,
      scheduleCount,
      otherScheduleCount,
      otherSchedules,
      crossSchedules
    };
  }

  getScheduleFromCache(unitId: number, useOriginalUnit: boolean = false, useLastUpdated: boolean = false): Observable<ScheduleCache> {
    return new Observable(sub => {
      const cached = this.schedulesCaches[unitId];
      if (useLastUpdated || !this.isCacheOutdated(cached)) {
        sub.next(cached);
        sub.complete();
      }
      else {
        const multiUnit = this.auth.currentUser.units.length > 0 || this.auth.currentUser.isPowerAdmin;
        const originalUnit = multiUnit || !useOriginalUnit ? null : this.auth.currentUser.units[0];
        this.getSchedule(unitId, originalUnit)
          .subscribe({
            next: () => {
              sub.next(this.schedulesCaches[unitId]);
              sub.complete();
            },
            error: (err) => {
              sub.error(err);
            }
          });
      }
    });
  }

  getLastScheduleCache(unitId: number) {
    const cached = this.schedulesCaches[unitId];
    return cached;
  }

  getProcessCache(unitId: number) {
    const cached = this.processCaches[unitId];
    return cached;
  }

  isScheduleOutdated(unitId: number): boolean {
    const check = this.schedulesCaches[unitId];
    return this.isCacheOutdated(check);
  }

  isCacheOutdated(cached: ScheduleCache | ActiveScheduleCache) {
    const outdated = !cached || differenceInMinutes(new Date(), cached.lastUpdate) >= this.cachedTime;
    return outdated;
  }

  getMaxPerSlotFromCache(unitId: number) {
    return this.schedulesCaches[unitId].maxPerSlot;
  }

  ensureMaxPerSlotCache(unitId: number): Promise<number> {
    return new Promise((resolve) => {
      if (!this.schedulesCaches[unitId].maxPerSlot) {
        if (this.getMaxPerSlot$) {
          this.getMaxPerSlot$.add(() => {
            resolve(this.schedulesCaches[unitId].maxPerSlot);
          });
        }
        else {
          this.getMaxPerSlot$ = this.getMaxPerSlot(unitId)
          .pipe(tap((data) => {
            this.schedulesCaches[unitId].maxPerSlot = data;
            this.getMaxPerSlot$ = null;
          }),
          take(1))
          .subscribe((data) => {
            resolve(data);
          });
        }
      }
      else {
        resolve(this.schedulesCaches[unitId].maxPerSlot);
      }
    });
  }

  getActiveScheduleFromCache(unitId: number, forceUpdated: boolean = false): Observable<ActiveScheduleCache> {
    return new Observable<ActiveScheduleCache>(sub => {
      const cached = this.activeScheduleCaches[unitId];
      if (forceUpdated || this.isCacheOutdated(cached)) {
        this.getActiveSchedule(unitId)
          .subscribe({
            next: () => {
              sub.next(this.activeScheduleCaches[unitId]);
              sub.complete();
            },
            error: (err) => {
              sub.error(err);
            }
          });
      }
      else {
        sub.next(cached);
        sub.complete();
      }
    });
  }

// tslint:disable-next-line: member-ordering
  private getMaxPerSlot$: Subscription;
// tslint:disable-next-line: member-ordering
  schedulesCaches: { [unitId: number]: ScheduleCache } = {};
// tslint:disable-next-line: member-ordering
  processCaches: { [unitId: number]: RescheduleCache } = {};
// tslint:disable-next-line: member-ordering
  activeScheduleCaches: { [unitId: number]: ActiveScheduleCache } = {};

}

export interface ScheduleCache {
  schedule: ScheduleView;
  lastUpdate: Date;
  maxPerSlot?: number;
}

export interface RescheduleCache {
  [sectionId: number]: { [slot: number]: (SlotPatientView | Schedule)[]; };
  crossUnit: { [patientId: string]: { [slot: string]: Schedule[] } };
  patientSchedule: { [patientId: string]: { slot: SlotView, schedule: Schedule[] }[] };
  orphaned: Schedule[];
}

export interface ActiveScheduleCache {
  schedules: SchedulePatient[];
  lastUpdate: Date;
}


