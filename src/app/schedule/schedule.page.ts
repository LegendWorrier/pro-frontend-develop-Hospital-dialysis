import { RequestService } from './../share/service/request.service';
import { PatientSchedulePage } from './patient-schedule/patient-schedule.page';
import { SwapMenuComponent } from './slot-menu/swap-menu/swap-menu.component';
import { MatLoadingComponent } from './components/mat-loading/mat-loading.component';
import { FindOptionComponent } from './components/find-option/find-option.component';
import { SectionSlots } from './../enums/section-slots';
import { MatAlertComponent } from './components/mat-alert/mat-alert.component';
import { SectionSelectData, SectionSelectComponent } from './components/section-select/section-select.component';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { UnitSelectComponent, UnitSelectData } from './components/unit-select/unit-select.component';
import { SlotMenuComponent } from './slot-menu/slot-menu.component';
import { ModalService } from './../share/service/modal.service';
import { map, mergeMap, take, finalize } from 'rxjs/operators';
import { forkJoin, Observable, firstValueFrom, from } from 'rxjs';
import { PatientService } from './../patients/patient.service';
import { Patient } from './../patients/patient';
import { addOrEdit, presentToast, isDesktopOrLaptop } from 'src/app/utils';
import { formatDistanceToNow, addDays, format, addHours, isSameDay, compareAsc } from 'date-fns';
import { ScheduleSection } from './section';
import { Unit } from './../masterdata/unit';
import { NavController, PopoverController, AlertController, Platform, LoadingController } from '@ionic/angular';
import { MasterdataService } from './../masterdata/masterdata.service';
import { AuthService } from './../auth/auth.service';
import { Component, OnInit, EventEmitter, Injector, Renderer2, ChangeDetectorRef } from '@angular/core';
import { ScheduleService, RescheduleCache } from './schedule.service';
import { Permissions } from '../enums/Permissions';
import { ScheduleView, SlotView, SlotPatientView, SectionView } from './schedule-view';
import { ActivatedRoute } from '@angular/router';
import { ModalSearchListComponent } from '../share/components/modal-search-list/modal-search-list.component';
import { MatCalendar, MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Schedule } from './schedule';
import { PatientInfo } from '../patients/patient-info';
import { ScheduleConst, convertDateToSectionSlot, convertDateToStartTime, convertStartTimeToDate, endTimeAsDate, getDateFromDay, getScheduleRangeLimit } from './schedule-utils';
import { ExcelService } from '../share/service/excel.service';

@Component({
  selector: 'app-schedule',
  templateUrl: 'schedule.page.html',
  styleUrls: ['schedule.page.scss'],
})
export class SchedulePage implements OnInit {

  get unitName() { return this.getUnitName(this.selectedUnit); }

  constructor(
    private auth: AuthService,
    private master: MasterdataService,
    private scheduleService: ScheduleService,
    private patientService: PatientService,
    private request: RequestService,
    private excelService: ExcelService,
    private navCtl: NavController,
    private modalService: ModalService,
    private popCtl: PopoverController,
    private alertCtl: AlertController,
    private loadCtl: LoadingController,
    private route: ActivatedRoute,
    private plt: Platform,
    private matDialog: MatDialog,
    private injector: Injector,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef) { }

  get selectableUnits(): Unit[] {
    return this.auth.currentUser.isPowerAdmin ? this.unitList : this.unitList.filter(x => this.auth.currentUser.units.includes(x.id));
  }
  get lastUpdateText() {
    return this._lastUpdateText;
  }

  private _lastUpdateText: string;
  isCalendarOverflow: boolean;
  menuOpening = false;
  scheduleOpening = false;

  unitList: Unit[] = [];
  selectedUnit: number;

  multiUnit = false;
  isEditable = false;
  authorized = false;
  showCount = true;
  weekMode = true;

  useTouchMode = false;

  schedule: ScheduleView;
  lastUpdate: Date;

  week = 0; // control which point of time the current main schedule represent
  get weekLimit() { return ScheduleConst.WeekLimit; } // limit of the weeks available for peeking

  isLoading = false;

  // ===== caches =========
  private patientMap: { [id: string]: PatientInfo } = {};
  private weekModeCache = this.weekMode;
  // =============================== Schedule Functions =======================================
  isRequest = false;
  isRescheduleMode = false;
  isSwapMode = false;
  isClearMode = false;
  rescheduleData: { patient: SlotPatientView, slot: SlotView, unitId: number, originalDate?: Date };
  calendarContainer: Element;
  header = CalendarHeaderComponent;
  isDateSelected = false;
  currentCalendar: MatCalendar<Date>;
  currentSelectedSlot: SlotView;
  lastSelectedDate: Date;
  getDateFromDay = getDateFromDay;

  async ngOnInit() {
    this.useTouchMode = !isDesktopOrLaptop(this.plt);
    this.multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;
    this.isEditable = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp);

    // Keep unit list up-to-date without manually refresh app
    this.master.onDataUpdate.subscribe(info => {
      if (info.type === 'unit') {
        switch (info.eventType) {
          case 'add':
            this.unitList.push(info.data);
            break;
          case 'edit':
            console.log(info.data);
            const unit = this.unitList.find(x => x.id === info.data.id);
            Object.assign(unit, info.data);
            break;
          case 'del':
            this.unitList = this.unitList.filter(x => x.id !== info.data.id);
            break;
        }
      }
    });

    this.plt.resize.subscribe(() => {
      this.checkCalendarOverflow();
    });

    setInterval(() => this.updateText(), 10000);
    
    // update patient map
    this.scheduleService.onScheduleUpdate.subscribe(schedule => {
      this.updatePatientMap(schedule);
    });
    this.scheduleService.onNewPatientAdd.subscribe(patient => {
      this.patientMap[patient.id] = patient;
    });

    await this.initSchedule();
  }

  async initSchedule() {
    return new Promise<void>((resolve) => {
      this.isLoading = true;
      from(this.master.getUnitListFromCache()).pipe(
        mergeMap((data) => {
          this.unitList = data;
          return from(this.changeActiveSchedule(this.auth.currentUser.units[0] ?? this.unitList[0].id));
        }),
        finalize(() => this.isLoading = false)
      ).subscribe(() => resolve());
    });
  }

  updateText() {
    if (!this.lastUpdate) {
      return;
    }
    this._lastUpdateText = formatDistanceToNow(this.lastUpdate, { addSuffix: true, includeSeconds: true });
    this.cdr.detectChanges();
  }

  getUnitName(unitId: number) { return this.unitList.find(x => x.id === unitId)?.name ?? '-'; }

  get weekName() { return this.week === 0 ? 'This Week' : (this.week === 1 ? 'Next Week' : `Next ${this.week} Week`); }

  next() {
    if (this.week < this.weekLimit) {
      this.week++;
    }
  }

  prev() {
    if (this.week > 0) {
      this.week--;
    }
  }

  getSlotPatients(slot: SlotView) {
    if (!this.weekMode) {
      return slot.patientList;
    }
    const processCached = this.scheduleService.getProcessCache(this.selectedUnit);
    return processCached[slot.sectionId][slot.slot].filter(p => {
      const targetDate = this.getDateFromDay(slot.slot, this.week);
      const upperLimit = addDays(targetDate, 1);

      const date = (p as Schedule).date;
      if (date) { // is schedule
        const scheduleDate = new Date(date);
        if (scheduleDate < targetDate || scheduleDate >= upperLimit) {
          return false;
        }
        else {
          return true;
        }
      }

      const counts = this.scheduleService.activeScheduleCount(
        p.patientId,
        slot,
        processCached,
        targetDate);

      const hasCross = counts.crossSchedules.some(s => s.originalDate && isSameDay(new Date(s.originalDate), targetDate));
      const hasOther = counts.otherSchedules.some(s => isSameDay(new Date(s.originalDate), targetDate));
      return !hasOther && !hasCross;
    });
  }

  async onUnitChange(event) {
    const unitId = event.detail.value;
    await this.changeActiveSchedule(unitId);
  }

  async changeActiveSchedule(unitId: number) {
    this.selectedUnit = unitId;
    this.schedule = null;
    this.isLoading = true;
    const cached = await firstValueFrom(this.scheduleService.getScheduleFromCache(this.selectedUnit, false))
      .finally(() => this.isLoading = false);
    this.schedule = cached.schedule;
    this.lastUpdate = cached.lastUpdate;
    this.updateText();

    const unit = this.unitList.find(x => x.id === this.selectedUnit);
    this.authorized = await this.scheduleService.checkAuthorized(unit);
  }

  updatePatientMap(schedule: ScheduleView) {
    schedule.patients.forEach(p => {
      this.patientMap[p.id] = p;
    });
  }

  async setting() {
    this.scheduleService.setTmp(this.schedule.sections.map(x => x.section));
    this.master.setTmp(this.unitList);
    this.navCtl.navigateForward(['setting', this.selectedUnit],
    {
      relativeTo: this.route,
      state:
      {
        isEmpty: await this.isEmpty(this.selectedUnit)
      }
    });
  }

  ionViewWillEnter(){
    if (this.isLoading) return;
    const sections = this.scheduleService.getTmp() as ScheduleSection[]; // mark for update
    if (sections && this.schedule) {
      this.reload();
    }
    else if (this.selectedUnit && this.scheduleService.isScheduleOutdated(this.selectedUnit)) {
      this.reload();
    }

  }

  async reload() {
    this.schedule = null;
    if (this.unitList?.length === 0) {
      this.initSchedule();
    }
    else {
      this.isLoading = true;
      this.scheduleService.getSchedule(this.selectedUnit)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe((data) => {
          this.schedule = data;
          this.lastUpdate = new Date();
          this.updateText();
        });
    }
  }

  endTime(section: ScheduleSection) {
    return endTimeAsDate(section);
  }

  getName(patient: SlotPatientView) {
    return this.patientMap[patient.patientId].name;
  }

  private async isEmpty(unitId: number) {
    const cache = await firstValueFrom(this.scheduleService.getScheduleFromCache(unitId));
    const hasSchedule = cache.schedule.reschedules.filter(x => compareAsc(new Date(x.date), new Date()) > 0).length > 0;
    const hasSlot = cache.schedule.sections.some(x => x.slots.some(s => s.patientList.length > 0));
    return !hasSchedule && !hasSlot;
  }

  // ======================= Patient Schedule =======================
  async patientSchedule(patientId?: string) {
    let patient: PatientInfo;
    if (this.scheduleOpening) { return; }
    this.scheduleOpening = true;
    if (!patientId) {
      const modal = await this.modalService.openModal(ModalSearchListComponent,
        {
          title: `Patient Schedule`,
          searchText: 'Search by name',
          data: this.schedule.patients.filter(x => x.unitId === this.selectedUnit),
          getSearchKey: (p: PatientInfo) => p.name,
          hasReload: false
        });
      this.scheduleOpening = false;
      const result = await modal.onWillDismiss();
      console.log(result);
      if (result.role !== 'ok') {
        return;
      }
      patient = result.data;
    }
    else {
      patient = this.patientMap[patientId];
    }

    await this.modalService.openModal(PatientSchedulePage,
    {
      patient,
      schedule: this.schedule,
      currentUnit: this.selectedUnit,
      unitList: this.unitList,
      authorized: this.authorized
    }, ['calendar-modal']);
    this.scheduleOpening = false;
  }

  // ======================= Schedule Slot ====================
  async slotAdd(slot: SlotView) {
    const section = this.schedule.sections.find(x => x.section.id === slot.sectionId).section;
    const onReload = new EventEmitter<any>();
    onReload.subscribe(() => this.patientService.forceRefreshCache());
    const onSelect = async (item: PatientInfo) => {
      const call$ = this.scheduleService.slot(item, section, slot.slot);
      let success: boolean;
      await addOrEdit(this.injector, {
        addOrEditCall: call$,
        successTxt: 'Successfully schedule a patient treatment.',
        isModal: true,
        stay: true,
        successCallback: async () => {
          const timestamp = new Date;
          const userId = this.auth.currentUser.id;
          const newItem = {
            patientId: item.id,
            created: timestamp,
            updated: timestamp,
            createdBy: userId,
            updatedBy: userId
          } as SlotPatientView;
          this.scheduleService.updateAllCache(newItem, slot, this.selectedUnit, item);
          modal.dismiss();
          success = true;
          await modal.onDidDismiss();
        },
        customErrorHandling: async err => {
          success = false;
          const result = this.scheduleService.ErrorHandle(err, this.injector);
          if (result) {
            modal.dismiss();
            await modal.onDidDismiss();
          }
          return result;
        }
      });
      return success;
    };

    const modal = await this.modalService.openModal(ModalSearchListComponent,
      {
        title: 'Patient Select',
        searchText: 'Search by name',
        data: this.getPatientList(slot),
        getSearchKey: (p: PatientInfo) => p.name,
        closeOnSelect: false,
        hasReload: true,
        lastUpdate: () => this.patientService.getLastCacheUpdate(this.selectedUnit),
        onReload,
        onItemSelect: onSelect
      });
  }

  async slotClear(slot: SlotView) {
    if (!slot.patientList || slot.patientList.length === 0) {
      return;
    }

    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      subHeader: `Clear all patient in this slot`,
      message: `Are you sure you want to delete all patient in this slot?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Confirm',
          role: 'ok'
        }
      ]
    });
    alert.present();

    const result = await alert.onWillDismiss();
    if (result.role === 'ok') {
      const loading = await this.loadCtl.create();
      loading.present();

      const call$ = forkJoin(slot.patientList.map(x => this.scheduleService.deleteSlot(this.patientMap[x.patientId], slot)));
      call$
        .pipe(finalize(() => loading.dismiss()))
        .subscribe({
          next: () =>  {
            Object.assign([], slot.patientList).forEach(item => {
              this.scheduleService.removeFromAllCache(item, slot, this.selectedUnit);
            });
          }
        });
    }
    
  }

  // =============== Get Patient List for Schedule Slot =====================
  getPatientList(slot: SlotView): Observable<PatientInfo[]> {
    const noDuplicate = (patient: PatientInfo, cache: RescheduleCache) => {
      const sectionSlot = slot.slot;
      return !this.schedule.sections.some(section =>  {
        const tmp = section.slots[sectionSlot];
        return tmp.patientList.some(s => s.patientId === patient.id) ||
          cache.patientSchedule[patient.id]?.find(s => s.slot === slot);
      });
    };

    return new Observable((sub) => {
      const processCache = this.scheduleService.getProcessCache(this.selectedUnit);
      this.patientService.getAccumulatedPatientByUnit(this.selectedUnit)
        .pipe(map(data => data.filter(p => noDuplicate(p, processCache))))
        .subscribe(data => sub.next(data));
    });
  }
  
  // =============== End of Get Patient List for Schedule Slot =====================
  // ========================================== Slot Select =================================================

  async onSlotSelect(slotView: SlotView, slotPatient: SlotPatientView | Schedule, event, picker: MatDatepicker<Date>) {
    if (this.menuOpening) {  return; }
    if (this.isRescheduleMode) { return; }
    this.menuOpening = true;
    if (this.isSwapMode) {
      if (slotPatient.patientId === this.rescheduleData.patient.patientId) {
        return;
      }
      if (this.weekMode) {
        const popup = await this.popCtl.create({
          component: SwapMenuComponent,
          event
        });
        popup.present();
        this.menuOpening = false;
        const result = await popup.onWillDismiss();
        console.log(result);
        if (!result?.data) {
          return;
        }
        if (result.data === 'temporary') {
          this.currentSelectedSlot = slotView;
          console.log(this.currentSelectedSlot);
          const targetDate = convertStartTimeToDate(slotView.sectionStartTime,
            getDateFromDay(slotView.slot, this.week));
          this._reschedule(targetDate, slotPatient.patientId);

          this.isSwapMode = false;
          this.weekMode = this.weekModeCache;
          return;
        }
      }
      const call$ = this.scheduleService.swapSlot(
        this.rescheduleData.slot,
        this.rescheduleData.patient.patientId,
        slotView,
        slotPatient.patientId);
      addOrEdit(this.injector, {
        addOrEditCall: call$,
        successTxt: `Successfully swap two patients.`,
        isModal: true,
        stay: true,
        successCallback: () => {
          const timestamp = new Date;
          const userId = this.auth.currentUser.id;
          slotPatient.created = timestamp;
          slotPatient.updated = timestamp;
          slotPatient.createdBy = userId;
          slotPatient.updatedBy = userId;
          const targetPatientId = slotPatient.patientId;
          slotPatient.patientId = this.rescheduleData.patient.patientId;

          const firstSlot = this.rescheduleData.patient;
          firstSlot.patientId = targetPatientId;
          firstSlot.created = timestamp;
          firstSlot.updated = timestamp;
          firstSlot.createdBy = userId;
          firstSlot.updatedBy = userId;

          this.isSwapMode = false;
          this.weekMode = this.weekModeCache;
        },
        customErrorHandling: (err) => this.scheduleService.ErrorHandle(err, this.injector),
      });
      this.menuOpening = false;
    }
    else {
      const patient = this.patientMap[slotPatient.patientId];
      const menu = await this.popCtl.create({
        component: SlotMenuComponent,
        backdropDismiss: true,
        componentProps: {
          patient,
          slotInfo: slotPatient,
          slotView,
          currentUnit: this.selectedUnit,
          unitList: this.unitList,
          multiUnit: this.multiUnit,
          authorized: this.authorized
        },
        event,
        id: 'schedule-menu'
      });
      await menu.present();

      this.menuOpening = false;
      const result = await menu.onWillDismiss();
      console.log('result:', result);
      if (result.role === 'del') {
        this.scheduleService.removeFromAllCache(slotPatient, slotView, this.selectedUnit);
      }
      else if (result.role === 'reschedule') {
        console.log('reschedule', result.data);
        this.rescheduleInit(slotPatient, slotView, !result.data ? picker : null);
      }
      else if (result.role === 'transfer') {
        console.log('transfer');
        this.transferRequestInit(slotPatient, slotView, picker, result.data);
      }
      else if (result.role === 'swap') {
        console.log('swap');
        const originalDate = this.weekMode ?
        convertStartTimeToDate(slotView.sectionStartTime, this.getDateFromDay(slotView.slot, this.week)) : null;
        this.rescheduleData = { patient: slotPatient, slot: slotView, unitId: this.selectedUnit, originalDate };
        this.isSwapMode = true;
        this.weekModeCache = this.weekMode;

      }
      else if (result.role === 'schedules') {
        console.log('patient schedule');
        this.patientSchedule(slotPatient.patientId);
      }
    }
  }

  isSelected(slotPatient: SlotPatientView | Schedule, slot: SlotView) {
    if (!this.rescheduleData || (!this.isSwapMode && !this.isRescheduleMode)) {
      return false;
    }
    return slot === this.rescheduleData.slot && slotPatient.patientId === this.rescheduleData.patient.patientId
      && (!this.weekMode || isSameDay(this.rescheduleData.originalDate, getDateFromDay(slot.slot, this.week)));
  }
  isSameOrSchedule(slotPatient: SlotPatientView | Schedule) {
    if (!this.isSwapMode && !this.isRescheduleMode) {
      return false;
    }
    return slotPatient.patientId === this.rescheduleData.patient.patientId || (slotPatient as Schedule).date;
  }

  cancel() {
    this.isRescheduleMode = false;
    this.isSwapMode = false;
    this.weekMode = this.weekModeCache;
  }

  isFullOrOccupied(slot: SlotView) {
    this.scheduleService.ensureMaxPerSlotCache(this.selectedUnit);

    if (this.rescheduleData?.patient && slot.slot !== this.rescheduleData.slot.slot) {
      // occupied case (any slotDay other than current)
      const patientId = this.rescheduleData.patient.patientId;
      if (this.schedule.sections.some(x => x.slots[slot.slot].patientList.some(s => s.patientId === patientId))) {
        return true;
      }
    }

    // current slotDay case: check full for each slot
    const max = this.scheduleService.getMaxPerSlotFromCache(this.selectedUnit);
    const full = this.scheduleService.checkMaxPerSlot(slot, this.schedule.reschedules, max);
    return full;
  }

  // =================== Schedule Functions =====================================
  async rescheduleInit(patient: SlotPatientView, slot: SlotView, picker: MatDatepicker<Date> = null) {
    // in case permanent, selectedUnit = target unit, and rescheduleData.unitId = the original unit.
    this.rescheduleData = { patient, slot, unitId: this.selectedUnit };
    this.isRequest = false;

    if (picker) {
      const originalDate = this.weekMode ?
        convertStartTimeToDate(slot.sectionStartTime, this.getDateFromDay(slot.slot, this.week)) : null;
      this.rescheduleData.originalDate = originalDate;
      this.openCalendar(picker);
    }
    else {
      this.isRescheduleMode = true;
      this.weekModeCache = this.weekMode;
      this.weekMode = false;
    }
  }

  async transferRequestInit(patient: SlotPatientView, slot: SlotView, picker: MatDatepicker<Date>, permanent: boolean) {
    if (this.unitList.length === 1) {
      presentToast(this.injector, {
        message: 'There is no any other unit to transfer to',
        native: true
      });
      return;
    }
    // in case transfer request, selectedUnit = the current unit/original unit, and rescheduleData.unitId = target unit.
    this.rescheduleData = { patient, slot, unitId: this.unitList.filter(x => x.id !== this.selectedUnit)[0].id };
    this.isRequest = true;

    if (!permanent) {
      const originalDate = this.weekMode ?
        convertStartTimeToDate(slot.sectionStartTime, this.getDateFromDay(slot.slot, this.week)) : null;
      this.rescheduleData.originalDate = originalDate;

      const loading = await this.loadCtl.create();
      loading.present();
      if (!await this.scheduleService.getScheduleFromCache(this.rescheduleData.unitId, true).toPromise()
        .finally(() => loading.dismiss())) {
          return;
        }
      this.openCalendar(picker);
    }
    else {
      // choose unit
      const units = this.unitList.filter(x => x.id !== this.selectedUnit);
      let popup = await this.popCtl.create({
        component: ModalSearchListComponent,
        componentProps: {
          title: 'Select Unit',
          simpleMode: true,
          data: units,
          getSearchKey: (x) => x.name,
          hasReload: false
        }
      });
      popup.present();
      const targetUnit = (await popup.onWillDismiss()).data as Unit;
      if (!targetUnit) {
        return;
      }
      // load cache
      const outdated = this.scheduleService.isScheduleOutdated(targetUnit.id);
      const loading = outdated ? await this.loadCtl.create() : null;
      loading?.present();
      const cached = await this.scheduleService.getScheduleFromCache(targetUnit.id, this.isRequest).toPromise()
        .finally(() => loading?.dismiss());
      if (!cached) {
        return;
      }
      const sections = cached.schedule.sections.map(x => x.section);
      if (sections.length === 0) {
        const alert = await this.alertCtl.create({
          buttons:[{text: 'Ok'}],
          header: 'No rounds',
          message: 'The target unit has no any rounds yet. Please let the admin setup rounds first.'
        });
        alert.present();
        return;
      }
      // find nearest
      const options = [
        {txt: 'Manually pick', v: 'pick'},
        {txt: 'Auto pick nearest (before)', v: 'before'},
        {txt: 'Auto pick nearest (after)', v: 'after'}
      ];
      popup = await this.popCtl.create({
        component: ModalSearchListComponent,
        componentProps: {
          title: 'Choose option',
          simpleMode: true,
          data: options,
          getSearchKey: (x: { txt: any; }) => x.txt,
          hasReload: false
        }
      });
      popup.present();
      const result = (await popup.onWillDismiss()).data?.v;
      if (!result) {
        return;
      }
      if (result !== 'pick') {
        const forward = result === 'after';
        const targetDate = convertStartTimeToDate(slot.sectionStartTime, getDateFromDay(slot.slot));
        const date = await this.scheduleService.findNearest(targetDate, forward, true, targetUnit.id, patient.patientId, true);
        if (!date) {
          const notFound = await this.alertCtl.create({
            header: 'All Full',
            message: `Cannot find any available ${forward ? 'later' : 'prior'} slot day/time in the target unit`,
            buttons: [ {text: 'OK', role: 'ok'} ]
          });
          notFound.present();
          return;
        }
        const confirm = await this.alertCtl.create({
          header: 'Result',
          subHeader: format(date, 'eee, hh:mm a'),
          message: `The target day and time is<br>[${format(date, 'eee, hh:mm a')}]<br>Do you confirm to continue?`,
          buttons: [ {text: 'Cancel'}, {text: 'Confirm', role: 'ok'} ]
        });
        confirm.present();
        if ((await confirm.onWillDismiss()).role === 'ok') {
          const targetDay = convertDateToSectionSlot(date);
          const startTime = convertDateToStartTime(date);
          const targetSection = sections.find(x => x.startTime === startTime);

          console.log('selected target', targetUnit.name, SectionSlots[targetDay], targetSection);
          const call$ = this.request.requestTransfer(patient.patientId, slot, targetSection, targetDay);
          addOrEdit(this.injector, {
            addOrEditCall: call$,
            successTxt: `The transfer request has been issued.`,
            isModal: true,
            stay: true,
            customErrorHandling: (err) => this.scheduleService.ErrorHandle(err, this.injector)
          });
        }

        return;
      }

      // choose target day
      const days = [
        {txt: 'Mon', v: SectionSlots.Mon},
        {txt: 'Tue', v: SectionSlots.Tue},
        {txt: 'Wed', v: SectionSlots.Wed},
        {txt: 'Thu', v: SectionSlots.Thu},
        {txt: 'Fri', v: SectionSlots.Fri},
        {txt: 'Sat', v: SectionSlots.Sat},
        {txt: 'Sun', v: SectionSlots.Sun}
      ];
      popup = await this.popCtl.create({
        component: ModalSearchListComponent,
        componentProps: {
          title: 'Select Day',
          simpleMode: true,
          data: days,
          getSearchKey: (x) => x.txt,
          hasReload: false
        }
      });
      popup.present();
      const targetDay = (await popup.onWillDismiss()).data?.v as SectionSlots;
      if (targetDay == null) {
        return;
      }
      // choose section
      popup = await this.popCtl.create({
        component: ModalSearchListComponent,
        componentProps: {
          title: 'Select Time',
          simpleMode: true,
          data: sections,
          getSearchKey: (x: ScheduleSection) => {
            const d = convertStartTimeToDate(x.startTime);
            const txt = format(d, 'hh:mm a') + ' - ' + format(addHours(d, 4), 'hh:mm a');
            return txt;
          },
          hasReload: false
        }
      });
      popup.present();
      const targetSection = (await popup.onWillDismiss()).data as ScheduleSection;
      if (!targetSection) {
        return;
      }

      console.log('selected target', targetUnit.name, SectionSlots[targetDay], targetSection);
      const call$ = this.request.requestTransfer(patient.patientId, slot, targetSection, targetDay);
      addOrEdit(this.injector, {
        addOrEditCall: call$,
        successTxt: `The transfer request has been issued.`,
        isModal: true,
        stay: true,
        customErrorHandling: (err) => this.scheduleService.ErrorHandle(err, this.injector)
      });
    }
  }

  async openCalendar(picker: MatDatepicker<Date>) {
    const today = new Date();
    picker.datepickerInput.min = today;
    picker.datepickerInput.max = getScheduleRangeLimit(today);
    console.log('limit', picker.datepickerInput.max);
    // setup calendar css
    picker.panelClass = ['hemo-calendar'];
    if (!this.useTouchMode) {
      picker.panelClass.push('compact');
    }

    const loading = this.scheduleService.isScheduleOutdated(this.selectedUnit) ? await this.loadCtl.create() : null;
    loading?.present();
    const originCache = await this.scheduleService.getScheduleFromCache(this.selectedUnit, this.isRequest, false).toPromise()
      .finally(() => loading?.dismiss());
    if (!originCache) {
      return;
    }
    const originProcessCache = this.scheduleService.getProcessCache(this.selectedUnit);
    picker.dateClass = (date: Date) => {
      const classes = [];
      const processCache = this.scheduleService.getProcessCache(this.rescheduleData.unitId);
      if (!processCache) {
        console.log('short-circuit');
        return classes;
      }

      const isCross = this.rescheduleData.unitId !== this.selectedUnit;
      const patientId = this.rescheduleData.patient.patientId;

      let scheduleExisted = processCache.patientSchedule[patientId]
        ?.some(x => x.schedule.some( s => isSameDay(new Date(s.date), date)));
      if (scheduleExisted) {
        classes.push('schedule');
        return classes;
      }

      const cross = originProcessCache.crossUnit[patientId];
      const crossExisted = cross && Object.keys(cross).map(key => cross[key]).some(x => x.some(s => isSameDay(new Date(s.date), date)));
      if (crossExisted) {
        classes.push('cross');
        if (isCross) {
          classes.push('fade');
        }
        return classes;
      }

      if (isCross) { // re-check original schedule
        scheduleExisted = originProcessCache.patientSchedule[patientId]
          .some(x => x.schedule.some(s => isSameDay(new Date(s.date), date)));
        if (scheduleExisted) {
          classes.push('schedule');
          classes.push('fade');
          return classes;
        }
      }

      const slotDay = convertDateToSectionSlot(date);
      const slotExisted = originCache.schedule.sections.some(x =>
        x.slots[slotDay].patientList.some(p => p.patientId === patientId));
      const hasOtherSchedule = originCache.schedule.reschedules
        .some(x => x.patientId === patientId &&
            x.originalDate && isSameDay(new Date(x.originalDate), date));

      if (slotExisted && !hasOtherSchedule) {
        classes.push('slot');
        if (isCross) {
          classes.push('fade');
        }
        return classes;
      }
      return classes;
    };
    // setup handler before opening calendar
    this.isDateSelected = false;
    CalendarHeaderComponent.currentHeaderChange
      .pipe(take(1))
      .subscribe(header => {
        // console.log(header);
        if (header) {
          this.currentCalendar = header.getCalendar();
          console.log(this.currentCalendar);
          this.currentCalendar.selectedChange.subscribe((x: Date) => {
            console.log('select', x);
            this.isDateSelected = !!x;
            if (x) {
              this.onDateSelect(x);
            }
          });
        }
      });
    // open calendar
    this.lastSelectedDate = null;
    picker.open();
    // get calendar container element and handle UI scroll indicator
    this.calendarContainer = document.querySelector('mat-datepicker-content');
    setTimeout(() => {
      this.checkCalendarOverflow();
    }, 450);
    this.renderer.listen(this.calendarContainer, 'scroll', () => {
      const isBottom = this.checkCalendarScrollBottom();
      this.isCalendarOverflow = !isBottom;
    });
  }

  checkCalendarScrollBottom(): boolean {
    if (!this.calendarContainer) {
      return;
    }
    const currentPos = this.calendarContainer.clientHeight + this.calendarContainer.scrollTop;
    const bottom = this.calendarContainer.scrollHeight;
    const isBottom = (bottom - currentPos) < 1;
    return isBottom;
  }
  checkCalendarOverflow() {
    if (!this.calendarContainer) {
      return;
    }
    const isOverflowing = this.calendarContainer.clientHeight < this.calendarContainer.scrollHeight;
    this.isCalendarOverflow = isOverflowing;
    this.cdr.detectChanges();
  }

  async onChooseUnit() {
    const unitDialog = this.matDialog.open(UnitSelectComponent, {
      data: {
        unitList: !this.isRequest ? this.unitList : this.unitList.filter(x => x.id !== this.selectedUnit),
        current: this.rescheduleData.unitId
      } as UnitSelectData,
      panelClass: 'select-modal'
    });

    const result = await unitDialog.afterClosed().toPromise();

    if (result) {
      this.rescheduleData.unitId = result.id;
      const isOutdated = this.scheduleService.isScheduleOutdated(this.rescheduleData.unitId);
      const loading = isOutdated ? this.matDialog.open(MatLoadingComponent, { disableClose: true }) : null;
      this.scheduleService.getScheduleFromCache(this.rescheduleData.unitId)
        .pipe(finalize(() => loading?.close()))
        .subscribe(cached => {
          console.log('update schedule', cached);
          // update calendar state
          this.currentCalendar.selected = null;
          this.currentSelectedSlot = null;
          this.isDateSelected = false;
          this.currentCalendar.updateTodaysDate();
          this.lastSelectedDate = null;
      });
    }
  }

  async onFindButton(event) {
    let forward = true;
    let targetDate;
    if (this.weekMode) {
      const pos = { bottom: `${window.innerHeight - event.y + event.offsetY}px`, left: `${event.x - event.offsetX}px`, right: null };
      const option = this.matDialog.open(FindOptionComponent, {
        panelClass: 'mat-popup',
        position: pos
      });
      const result = await option.afterClosed().toPromise();
      if (!result) {
        return;
      }
      forward = result === 'forward';

      targetDate = getDateFromDay(this.rescheduleData.slot.slot, this.week);
      targetDate = convertStartTimeToDate(this.rescheduleData.slot.sectionStartTime, targetDate);
    }
    else {
      targetDate = new Date();
    }

    const isCross = this.rescheduleData.unitId !== this.selectedUnit;
    const date = await this.scheduleService.findNearest(
      targetDate, forward, false, this.rescheduleData.unitId, this.rescheduleData.patient.patientId, isCross);
    if (date) {
      this.currentCalendar.selected = date;
      this.lastSelectedDate = date;
      this.isDateSelected = true;
      this.currentSelectedSlot = {
        patientList: [],
        sectionStartTime: convertDateToStartTime(date),
        slot: convertDateToSectionSlot(date),
        sectionId: -1
      };
    }
    else {
      this.currentCalendar.selected = null;
      this.lastSelectedDate = null;
      this.isDateSelected = false;
    }
    this.currentCalendar.updateTodaysDate();
  }

  async onDateSelect(date: Date) {
    const slot = convertDateToSectionSlot(date);
    const outdated = this.scheduleService.isScheduleOutdated(this.rescheduleData.unitId);
    let loading = outdated ? this.matDialog.open(MatLoadingComponent, { disableClose: true }) : null;
    const cached = await firstValueFrom(this.scheduleService.getScheduleFromCache(this.rescheduleData.unitId, this.isRequest))
      .finally(() => loading?.close());

    if (!cached) {
      this.popCtl.dismiss(null, null, 'schedule-menu');
      return;
    }

    const cancel = () => {
      this.currentCalendar.selected = this.lastSelectedDate;
      this.isDateSelected = !!this.currentCalendar.selected;
      this.currentCalendar.updateTodaysDate();
    };
    // for un-init case
    if (cached.schedule.sections.length === 0) {
      const alert = this.matDialog.open(MatAlertComponent, {
        data: {
          header: 'Rounds not set',
          message: 'This unit has no any rounds yet. Please let admin setup the rounds first.',
          buttons: [{text: 'Ok'}]
        }
      });
      await firstValueFrom(alert.afterClosed());

      cancel();
      return;
    }
    // check day full or not
    if (!cached.maxPerSlot) {
      loading = this.matDialog.open(MatLoadingComponent, { disableClose: true });
      cached.maxPerSlot = await firstValueFrom(this.scheduleService.getMaxPerSlot(this.rescheduleData.unitId))
        .finally(() => loading.close());
    }
    const dayFull = cached.schedule.sections.every(s => {
      const full = this.scheduleService.checkMaxPerSlot(s.slots[slot],
        cached.schedule.reschedules,
        cached.maxPerSlot,
        date);
      return full;
    });
    if (dayFull) {
      const alert = this.matDialog.open(MatAlertComponent, {
        data: {
          header: 'Day Full',
          subheader: `${format(date, 'dd MMM yyyy')}`,
          message: 'The selected date is all full. Please choose some another date.',
          buttons: [{text: 'Ok'}]
        }
      });
      await alert.afterClosed().toPromise();

      cancel();
      return;
    }
    const patientId = this.rescheduleData.patient.patientId;
    const originCache = this.scheduleService.getLastScheduleCache(this.selectedUnit);
    const originProcessCache = this.scheduleService.getProcessCache(this.selectedUnit);
    const scheduleExisted = (this.scheduleService.getProcessCache(this.rescheduleData.unitId))?.
      patientSchedule[patientId]?.some(x => x.schedule.some(s => isSameDay(new Date(s.date), date)))
      || originProcessCache.patientSchedule[patientId].some(x => x.schedule.some(s => isSameDay(new Date(s.date), date)));
    const slotExisted = originCache.schedule.sections
      .some(x => x.slots[slot].patientList.some(p => p.patientId === patientId));
    const hasOtherSchedule = originCache.schedule.reschedules
      .some(x => x.patientId === this.rescheduleData.patient.patientId &&
        x.originalDate && isSameDay(new Date(x.originalDate), date));
    const cross = originProcessCache.crossUnit[patientId];
    const crossExisted = cross && Object.keys(cross).map(x => cross[x]).some(x => x.some(s => isSameDay(new Date(s.date), date)));
    if (scheduleExisted || crossExisted || (slotExisted && !hasOtherSchedule)) {
      const alert = this.matDialog.open(MatAlertComponent, {
        data: {
          header: 'Already existed',
          subheader: `${format(date, 'dd MMM yyyy')}`,
          message: 'The selected date already has patient\'s schedule. Are you sure to continue?',
          buttons: [{text: 'Cancel'}, {text: 'Confirm', role: 'ok'}]
        }
      });
      const result = await firstValueFrom(alert.afterClosed());
      if (result !== 'ok') {
        cancel();
        return;
      }
    }

    const sectionDialog = this.matDialog.open(SectionSelectComponent, {
      data: {
        date,
        patientId,
        origin: this.rescheduleData.slot,
        originDate: this.rescheduleData.originalDate,
        cached,
        currentUnit: this.selectedUnit
      } as SectionSelectData,
      panelClass: 'select-modal'
    });

    const section = await firstValueFrom(sectionDialog.afterClosed()) as SectionView;
    if (!section) {
      this.currentCalendar.selected = this.lastSelectedDate;
      this.isDateSelected = !!this.currentCalendar.selected;
    }
    else {
      this.lastSelectedDate = convertStartTimeToDate(section.section.startTime, this.currentCalendar.selected as Date);
      this.currentSelectedSlot = {
        sectionId: section.section.id,
        slot,
        patientList: section.slots[slot].patientList,
        sectionStartTime: section.section.startTime
      };
      console.log(this.currentSelectedSlot);
    }
    this.currentCalendar.updateTodaysDate();
  }


  // Temporary
  onDateConfirm(event) {
    console.log(event);
    console.log(this.currentCalendar.selected);
    const value = (event.value ?? this.currentCalendar.selected) as Date;
    const target = event.target as MatDatepickerInput<Date>;

    if (!value || !this.currentSelectedSlot) {
      return;
    }

    if (this.isRequest) {
      // Transfer Request
      const overrideDate = convertStartTimeToDate(this.currentSelectedSlot.sectionStartTime, value);
      const overrideUnit = (this.selectedUnit !== this.rescheduleData.unitId) ? this.rescheduleData.unitId : null;
      const patient = this.patientMap[this.rescheduleData.patient.patientId];
      console.log('override date/time', overrideDate);
      const call$ = this.request.requestTemporaryTransfer(
        patient,
        this.rescheduleData.slot,
        overrideDate,
        overrideUnit,
        this.rescheduleData.originalDate);
      addOrEdit(this.injector, {
        addOrEditCall: call$,
        successTxt: `The transfer request has been issued.`,
        isModal: true,
        stay: true,
        customErrorHandling: (err) => this.scheduleService.ErrorHandle(err, this.injector)
      });
    }
    else {
      // Reschedule
      this._reschedule(value);
    }

    setTimeout(() => {
      if (target) {
        target.value = null;
      }
    }, 300);
  }

  isCurrentSlot(slot: SlotView) {
    return slot.sectionId === this.rescheduleData.slot.sectionId && slot.slot === this.rescheduleData.slot.slot;
  }

  onRescheduleCancel() {
    this.isRescheduleMode = false;
    this.rescheduleData = null;
    this.weekMode = this.weekModeCache;
  }

  private _reschedule(targetDate: Date, targetPatientId?: string) {
    const overrideDate = convertStartTimeToDate(this.currentSelectedSlot.sectionStartTime, targetDate);
    const overrideUnit = (this.selectedUnit !== this.rescheduleData.unitId) ? this.rescheduleData.unitId : null;
    const patient = this.patientMap[this.rescheduleData.patient.patientId];
    console.log('override date/time', overrideDate);
    const call$ = this.scheduleService.reschedule(
      patient,
      this.rescheduleData.slot,
      overrideDate,
      overrideUnit,
      this.rescheduleData.originalDate,
      targetPatientId);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: targetPatientId ? `Successfully swap both patient's schedules.`
        : `Successfully re-scheduled a patient slot on ${format(overrideDate, 'dd MMM yyyy HH:mm a')}`,
      isModal: true,
      stay: true,
      successCallback: async (ids) => {
        console.log('server response', ids);
        const timestamp = new Date;
        const userId = this.auth.currentUser.id;
        const id = ids[0];
        await update(id, timestamp, userId);
        if (targetPatientId) {
          const secondPatient = this.patientMap[targetPatientId];
          const secondId = ids[1];
          await update(secondId, timestamp, userId, secondPatient);
        }
        this.currentSelectedSlot = null;
      },
      customErrorHandling: (err) => this.scheduleService.ErrorHandle(err, this.injector),
    });

    const update = async (id, timestamp, userId, alternatePatient?: PatientInfo) => {
      const unit = alternatePatient ? (overrideUnit ?? this.rescheduleData.unitId) : this.rescheduleData.unitId;
      const thisPatient = alternatePatient ?? patient;
      const rescheduleItem = {
        id,
        date: alternatePatient ? this.rescheduleData.originalDate : overrideDate,
        originalDate: alternatePatient ? overrideDate : this.rescheduleData.originalDate,
        patientId: alternatePatient?.id ?? this.rescheduleData.patient.patientId,
        sectionId: alternatePatient ? this.currentSelectedSlot.sectionId : this.rescheduleData.slot.sectionId,
        slot: alternatePatient ? this.currentSelectedSlot.slot : this.rescheduleData.slot.slot,
        overrideUnitId: alternatePatient && overrideUnit ? this.rescheduleData.unitId : overrideUnit,
        created: timestamp,
        updated: timestamp,
        createdBy: userId,
        updatedBy: userId
      } as Schedule;

      this.scheduleService.updateAllCache(rescheduleItem, null, unit, thisPatient);
      if (this.rescheduleData.unitId !== this.selectedUnit) {
        this.scheduleService.updateAllCache(rescheduleItem, null, alternatePatient ? overrideUnit : this.selectedUnit, thisPatient);
      }
    };
  }

  // Permanent
  async reschedule(slot: SlotView) {
    const isTransfer = this.selectedUnit !== this.rescheduleData.unitId;
    if (isTransfer) {
      const alert = await this.alertCtl.create({
        header: 'Confirmation',
        subHeader: 'Patient Transferring',
        message: 'You are transferring the patient to different unit. Are you sure you want to proceed?' +
        '<br>(All other existing schedule(s) will be auto-erased)',
        buttons: [
          { text: 'Cancel' },
          { text: 'Confirm', role: 'ok' }
        ]
      });
      alert.present();
      const result = await alert.onWillDismiss();
      if (result.role !== 'ok') {
        return;
      }
    }
    const patient = this.patientMap[this.rescheduleData.patient.patientId];
    let call$ = this.scheduleService.swapSlot(this.rescheduleData.slot, patient.id, slot);
    if (isTransfer) {
      patient.unitId = this.selectedUnit;
      const transferCall$ = this.patientService.updatePatient(patient.id, patient as Patient);
      call$ = call$.pipe(mergeMap(() => transferCall$));
    }
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Successfully re-scheduled a patient slot.',
      isModal: true,
      stay: true,
      successCallback: () => {
        const timestamp = new Date;
        const userId = this.auth.currentUser.id;
        const slotItem = {
          patientId: patient.id,
          created: timestamp,
          updated: timestamp,
          createdBy: userId,
          updatedBy: userId
        };
        this.scheduleService.updateAllCache(slotItem, slot, this.selectedUnit, patient);

      },
      customErrorHandling: (err) => {
        const result = this.scheduleService.ErrorHandle(err, this.injector);
        if (isTransfer) {
          patient.unitId = this.rescheduleData.unitId; // reverse patient unit
        }
        return result;
      }
    });

    this.isRescheduleMode = false;
    this.weekMode = this.weekModeCache;
  }

  excel() {
    this.excelService.exportSchedule(this.schedule, this.patientMap, this.unitList);
  }

}
