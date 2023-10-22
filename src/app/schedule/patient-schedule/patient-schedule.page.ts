import { firstValueFrom } from 'rxjs';
import { AuthService } from './../../auth/auth.service';
import { addOrEdit } from 'src/app/utils';
import { Unit } from 'src/app/masterdata/unit';
import { PatientScheduleMenuComponent } from './../slot-menu/patient-schedule-menu/patient-schedule-menu.component';
import { PopoverController, AlertController, LoadingController } from '@ionic/angular';
import { ScheduleView, SlotView } from './../schedule-view';
import { addHours, compareAsc, format, isSameDay, addDays, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { MatCalendar } from '@angular/material/datepicker';
import { ScheduleService } from './../schedule.service';
import { PatientInfo } from './../../patients/patient-info';
import { Component, Input, OnInit, ViewChild, AfterViewInit, Renderer2, ElementRef, ChangeDetectorRef, Injector } from '@angular/core';
import { Schedule } from '../schedule';
import { ModalSearchListComponent, ModalSearchParams } from 'src/app/share/components/modal-search-list/modal-search-list.component';
import { ScheduleSection } from '../section';
import { getScheduleRangeLimit, convertDateToSectionSlot, convertDateToStartTime, convertStartTimeToDate } from '../schedule-utils';

@Component({
  selector: 'app-patient-schedule',
  templateUrl: './patient-schedule.page.html',
  styleUrls: ['./patient-schedule.page.scss'],
})
export class PatientSchedulePage implements OnInit, AfterViewInit {

  @Input() patient: PatientInfo;
  @Input() schedule: ScheduleView;

  @Input() currentUnit: number;
  @Input() unitList: Unit[];
  @Input() authorized: boolean;

  @ViewChild(MatCalendar) calendar: MatCalendar<Date>;
  @ViewChild(MatCalendar, { read: ElementRef }) calendarEl: ElementRef;

  private event: any;
  private selectedDate: Date;
  private lastSelectedDate: Date;
  currentSelected: SlotView | Schedule;
  mode: 'reschedule' | 'transfer' | 'swap';

  crossUnit: number;
  crossSchedule: ScheduleView;

  lastView: string;
  limit: Date;

  isPowerAdmin: boolean;

  constructor(
    private scheduleService: ScheduleService,
    private auth: AuthService,
    private popCtl: PopoverController,
    private alertCtl: AlertController,
    private loadCtl: LoadingController,
    private renderer: Renderer2,
    private injector: Injector,
    private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    this.calendar.viewChanged.subscribe(view => {
      // console.log(view);
      this.lastView = view;
    });
    this.renderer.listen(this.calendarEl.nativeElement, 'click', (event) => {
      // console.log(event);
      // console.log('current', this.calendar.currentView);
      // console.log('last', this.lastView);
      if ((this.lastView !== 'month' && this.lastView !== undefined) || this.calendar.currentView === 'multi-year') {
        return;
      }
      console.log('date click');
      if (event.target.classList.contains('mat-calendar-body-cell-content')
        && !event.target.parentElement.classList.contains('mat-calendar-body-disabled')) {
        this.event = event;
        this.onSelect(this.selectedDate);
      }
    });
  }

  async ngOnInit() {
    this.limit = getScheduleRangeLimit(new Date());
    this.isPowerAdmin = this.auth.currentUser.isPowerAdmin;
  }

  getUnitLabel(unitId: number) { return this.unitList.find(x => x.id === unitId)?.name ?? 'Unknown Unit'; }

  dateFilter = (date) => {
    if (!this.currentSelected) {
      return true;
    }
    return this.isActive(date);
  }

  dateClass = (date, view) => {
    if (view !== 'month') {
      return '';
    }
    const classes = [];
    const slotDay = convertDateToSectionSlot(date);

    if (this.crossUnit) {
      const crossCache = this.scheduleService.getProcessCache(this.crossUnit);
      const crossScheduleExisted = crossCache.patientSchedule[this.patient.id]
        ?.some(s => s.schedule.some(x => isSameDay(new Date(x.date), date)));
      if (crossScheduleExisted) {
        classes.push('schedule');
        return classes;
      }
    }

    const cache = this.scheduleService.getProcessCache(this.currentUnit);
    const cross = cache.crossUnit[this.patient.id];
    const crossExisted = Object.keys(cross).map(x => cross[x]).some(x => x.some(s => isSameDay(new Date(s.date), date)));
    if (crossExisted) {
      classes.push('cross');
      if (this.crossUnit) {
        classes.push('fade');
      }
      return classes;
    }

    const patientSlots = cache.patientSchedule[this.patient.id];
    const scheduleExisted = patientSlots.some(x => x.schedule.some(s => isSameDay(new Date(s.date), date)));

    if (scheduleExisted) {
      classes.push('schedule');
      if (this.crossUnit) {
        classes.push('fade');
      }
      return classes;
    }

    const slotExisted = this.schedule.sections.some(x =>
      x.slots[slotDay].patientList.some(p => p.patientId === this.patient.id));
    const hasOtherSchedule = this.schedule.reschedules.some(x => x.patientId === this.patient.id &&
        x.originalDate && isSameDay(new Date(x.originalDate), date));

    if (slotExisted && !hasOtherSchedule) {
      classes.push('slot');
      if (this.crossUnit) {
        classes.push('fade');
      }
      return classes;
    }

    return classes;
  }

  saveSelectDate(date: Date) {
    this.selectedDate = date;
  }

  isActive(date: Date) {
    const today = setMilliseconds(setSeconds(setMinutes(setHours(new Date(), 0), 0), 0), 0);
    const isPast = compareAsc(date, today) < 0;
    const offLimit = compareAsc(date, this.limit) > 0;
    return !isPast && !offLimit;
  }

  async onSelect(date: Date) {
    const cache = this.scheduleService.getProcessCache(this.currentUnit);
    const patientSlots = cache.patientSchedule[this.patient.id];
    const crossList = ([] as Schedule[]).concat(
      ...Object.keys(cache.crossUnit[this.patient.id]).map(x => cache.crossUnit[this.patient.id][x]));
    let schedules = ([] as Schedule[]).concat(...patientSlots.map(x => x.schedule)).filter(s => isSameDay(new Date(s.date), date));
    schedules = schedules.concat(crossList.filter(x => isSameDay(new Date(x.date), date)));
    const hasOtherSchedule = this.schedule.reschedules.some(x => x.patientId === this.patient.id &&
      x.originalDate && isSameDay(new Date(x.originalDate), date));

    const slotDay = convertDateToSectionSlot(date);
    const slot = hasOtherSchedule ? null : this.schedule.sections.find(x =>
        x.slots[slotDay].patientList.some(p => p.patientId === this.patient.id))?.slots[slotDay];

    if (schedules.length > 0 || slot) {
      // second select (process phrase)
      if (this.currentSelected) {
        const alert = await this.alertCtl.create({
          header: 'Already existed',
          subHeader: `${format(date, 'dd MMM yyyy')}`,
          message: 'The selected date already has patient\'s schedule. Are you sure to continue?',
          buttons: [{text: 'Cancel'}, {text: 'Confirm', role: 'ok'}]
        });
        alert.present();
        if ((await alert.onWillDismiss()).role !== 'ok') {
          return;
        }

        switch (this.mode) {
          case 'reschedule':
            this.onReschedule(date);
            break;
          case 'transfer':
            this.onTransfer(date);
            break;
          default:
            break;
        }
      }
      // first select (init phrase)
      else {
        const popup = await this.popCtl.create({
          component: PatientScheduleMenuComponent,
          componentProps: {
            patient: this.patient,
            date,
            slot,
            schedules,
            currentUnit: this.currentUnit,
            unitList: this.unitList,
            authorized: this.authorized,
            readOnly: !this.isActive(date)
          },
          event: this.event
        });
        popup.present();

        const result = await popup.onWillDismiss();
        if (result.data) {
          console.log(result.data);
          if (result.role === 'del') {
            if ((result.data as Schedule).date) {
              const schedule = (result.data as Schedule);
              const targetStarTime = convertDateToStartTime(schedule.date);
              const targetSlot = schedule.overrideUnitId ? { sectionId: 0, slot: 0 } as SlotView :
                this.schedule.sections.find(x => x.section.startTime === targetStarTime).slots[slotDay];
              console.log(targetSlot);
              this.scheduleService.removeFromAllCache(schedule, targetSlot, this.currentUnit);
            }
            else {
              const patientSlot = slot.patientList.find(x => x.patientId === this.patient.id);
              this.scheduleService.removeFromAllCache(patientSlot, slot, this.currentUnit);
            }
            this.cancel();
            return;
          }

          this.mode = result.role as 'reschedule' | 'transfer';
          this.lastSelectedDate = this.selectedDate;
          this.currentSelected = result.data;
          this.calendar.selected = this.selectedDate;
          this.calendar.updateTodaysDate();

          if (this.mode === 'transfer') {
            this.crossUnit = (await this.selectUnit())?.id;
            if (this.crossUnit) {
              // load cache
              const outdated = this.scheduleService.isScheduleOutdated(this.crossUnit);
              const loading = outdated ? await this.loadCtl.create() : null;
              loading?.present();
              this.crossSchedule = (await firstValueFrom(this.scheduleService.getScheduleFromCache(this.crossUnit, true))
                .finally(() => loading?.dismiss())).schedule;
              if (!this.crossSchedule) {
                this.crossUnit = null;
                this.cancel();
                return;
              }
              const sections = this.crossSchedule.sections.map(x => x.section);
              if (sections.length === 0) {
                const alert = await this.alertCtl.create({
                  buttons:[{text: 'Ok'}],
                  header: 'No rounds',
                  message: 'The target unit has no any rounds yet. Please let the admin setup rounds first.'
                });
                alert.present();
                this.crossUnit = null;
                this.cancel();
                return;
              }
              this.calendar.updateTodaysDate();
            }
            else {
              this.cancel();
            }
          }
        }
        else {
          this.selectedDate = this.lastSelectedDate;
        }
      }
    }
    // process phrase
    else if (this.currentSelected) {
      switch (this.mode) {
        case 'reschedule':
          this.onReschedule(date);
          break;
        case 'transfer':
          this.onTransfer(date);
          break;
        default:
          break;
      }
    }
  }

  async selectSection(): Promise<ScheduleSection> {
    const slotDay = convertDateToSectionSlot(this.selectedDate);
    const originSchedule = this.schedule;
    const schedule = this.crossUnit ? this.crossSchedule : originSchedule;
    const occupiedSections = originSchedule.sections.filter(x => x.slots[slotDay].patientList.some(p =>
      p.patientId === this.patient.id)).map(x => x.section);
    const occupiedSchedules = schedule.reschedules.filter(x =>
      x.patientId === this.patient.id && isSameDay(new Date(x.date), this.selectedDate));
    const maxPerSlot = await this.scheduleService.ensureMaxPerSlotCache(this.crossUnit ?? this.currentUnit);
    // choose section
    const popup = await this.popCtl.create({
      component: ModalSearchListComponent,
      componentProps: {
        title: 'Choose Time',
        simpleMode: true,
        data: schedule.sections.map(x => x.section),
        getSearchKey: (x: ScheduleSection) => {
          const d = convertStartTimeToDate(x.startTime);
          const txt = format(d, 'hh:mm a') + ' - ' + format(addHours(d, 4), 'hh:mm a');
          return txt;
        },
        hasReload: false,
        disabledItem: (item: ScheduleSection) => {
          // is past
          if (convertStartTimeToDate(item.startTime, this.selectedDate) <= new Date()) {
            return true;
          }

          const hasOtherSchedule = originSchedule.reschedules.some(x => x.patientId === this.patient.id
            && x.originalDate && isSameDay(new Date(x.originalDate), this.selectedDate)
            && convertDateToStartTime(x.originalDate) === item.startTime);
          // slot
          if (!hasOtherSchedule && occupiedSections.find(x => this.scheduleService.isOverlapped(x.startTime, item.startTime))) {
            return true;
          }
          // schedule
          if (occupiedSchedules.some(x =>
            this.scheduleService.isOverlapped(convertDateToStartTime(x.date), item.startTime))) {
            return true;
          }
          // original schedule
          if (schedule !== originSchedule) {
            const hasOriginalSchedule = originSchedule.reschedules.some(x => {
              const wrap = new Date(x.date);
              const startTime = convertDateToStartTime(wrap);
              return x.patientId === this.patient.id && isSameDay(wrap, this.selectedDate)
                && this.scheduleService.isOverlapped(startTime, item.startTime);
            });

            if (hasOriginalSchedule) {
              return true;
            }
          }

          const slot = schedule.sections.find(x => x.section.id === item.id).slots[slotDay];
          const isFull = this.scheduleService.checkMaxPerSlot(slot, schedule.reschedules, maxPerSlot, this.selectedDate);

          return isFull;
        }
      } as ModalSearchParams<ScheduleSection>
    });
    popup.present();
    const targetSection = (await popup.onWillDismiss()).data as ScheduleSection;
    return targetSection;
  }

  async selectUnit(): Promise<Unit> {
    // choose unit
    const units = this.unitList.filter(x => x.id !== this.currentUnit);
    const popup = await this.popCtl.create({
      component: ModalSearchListComponent,
      componentProps: {
        title: 'Select Unit',
        simpleMode: true,
        data: units,
        getSearchKey: (x) => x.name,
        hasReload: false
      },
      id: 'unit'
    });
    popup.present();
    const targetUnit = (await popup.onWillDismiss()).data as Unit;
    return targetUnit;
  }

  async onReschedule(date: Date) {
    if (await this.checkDayFull(this.schedule, date)) {
      const alert = await this.alertCtl.create({
        header: 'Day Full',
        subHeader: `${format(date, 'dd MMM yyyy')}`,
        message: 'The selected date is all full. Please choose some another date.',
        buttons: [{text: 'Ok'}]
      });
      alert.present();
      this.selectedDate = this.lastSelectedDate;
      return;
    }

    const targetSection = await this.selectSection();
    if (targetSection) {
      console.log(targetSection);
      const target = convertStartTimeToDate(targetSection.startTime, date);
      if (!await this.confirmation(target)) {
        this.selectedDate = this.lastSelectedDate;
        return;
      }
      this.saveToServer(target);
    }
    else {
      this.selectedDate = this.lastSelectedDate;
    }
  }

  async onTransfer(date: Date) {
    console.log(this.crossUnit);
    if (await this.checkDayFull(this.crossSchedule, date)) {
      const alert = await this.alertCtl.create({
        header: 'Day Full',
        subHeader: `${format(date, 'dd MMM yyyy')}`,
        message: 'The selected date is all full. Please choose some another date.',
        buttons: [{text: 'Ok'}]
      });
      alert.present();
      this.selectedDate = this.lastSelectedDate;
      return;
    }

    const targetSection = await this.selectSection();
    if (targetSection) {
      console.log(targetSection);
      const target = convertStartTimeToDate(targetSection.startTime, date);
      if (!await this.confirmation(target)) {
        this.selectedDate = this.lastSelectedDate;
        return;
      }

      if (this.isPowerAdmin || this.auth.currentUser.units.some(x => x === this.crossUnit)) {
        this.saveToServer(target);
      }
      else {
        // TODO: request transfer
      }
    }
    else {
      this.selectedDate = this.lastSelectedDate;
    }
  }

  async checkDayFull(schedule: ScheduleView, targetDate: Date) {
    const unitId = schedule.unitId;
    const slot = convertDateToSectionSlot(targetDate);
    let max = this.scheduleService.getMaxPerSlotFromCache(unitId);
    if (!max) {
      const loading = await this.loadCtl.create();
      loading.present();
      max = await this.scheduleService.ensureMaxPerSlotCache(unitId).finally(() => loading.dismiss());
    }
    if (!max) {
      console.log('get max failed.');
      return false;
    }
    const dayFull = schedule.sections.every(s => {
      const full = this.scheduleService.checkMaxPerSlot(s.slots[slot],
        schedule.reschedules,
        max,
        targetDate);
      return full;
    });
    return dayFull;
  }

  async confirmation(date: Date): Promise<boolean> {
    console.log(this.crossUnit);
    const originalDate = (this.currentSelected as Schedule).date ??
      convertStartTimeToDate((this.currentSelected as SlotView).sectionStartTime, this.lastSelectedDate);
    const original = `original: ${format(originalDate, 'eee, dd MMM hh:mm a')} ${this.crossUnit ? this.unitList.find(x => x.id === this.currentUnit).name : ''}`;
    const target = `${format(date, 'eee, dd MMM hh:mm a ')} ${this.crossUnit ? this.unitList.find(x => x.id === this.crossUnit).name : ''}`;
    const alert = await this.alertCtl.create({
      header: 'Confirmation',
      subHeader: original,
      message: `Reschedule to target date/time:<br><br>[${target}]<br><br>Are you sure to continue?`,
      buttons: [{ text: 'Cancel'}, { text: 'Confirm', role: 'ok' }]
    });
    alert.present();
    const result = await alert.onWillDismiss();
    if (result.role === 'ok') {
      return true;
    }
    return false;
  }

  cancel() {
    this.crossUnit = null;
    this.selectedDate = null;
    this.currentSelected = null;
    this.calendar.selected = null;
    this.calendar.updateTodaysDate();
  }

  async findNearest(event) {
    const options = await this.popCtl.create({
      component: ModalSearchListComponent,
      componentProps: {
        data: [ { label: 'Before', val: 'backward' }, { label: 'After', val: 'forward' } ],
        getSearchKey: x => x.label,
        title: null,
        simpleMode: true
      } as ModalSearchParams<any>,
      event
    });
    options.present();

    const result = await options.onWillDismiss();
    console.log(result);
    if (result.data) {
      const forward = result.data.val === 'forward';
      const originalDate = (this.currentSelected as Schedule).date ??
        convertStartTimeToDate((this.currentSelected as SlotView).sectionStartTime, this.lastSelectedDate);
      const date = await this.scheduleService.findNearest(
        originalDate,
        forward,
        false,
        this.crossUnit ?? this.currentUnit,
        this.patient.id,
        false);

      this.calendar.selected = date;
      this.selectedDate = date;
      this.calendar.updateTodaysDate();
      if (await this.confirmation(date)) {
        if (this.isPowerAdmin || !this.crossUnit || this.auth.currentUser.units.some(x => x === this.crossUnit)) {
          this.saveToServer(date);
        }
        else {
          // TODO: request transfer
        }
      }
      else {
        this.selectedDate = this.lastSelectedDate;
        this.calendar.selected = this.selectedDate;
        this.calendar.updateTodaysDate();
      }
    }
  }

  saveToServer(targetDate: Date) {
    const originalDate = convertStartTimeToDate(
      (this.currentSelected as SlotView).sectionStartTime, this.lastSelectedDate);
    const overrideDate = targetDate;
    const overrideUnit = this.crossUnit;
    const patient = this.patient;
    console.log('override date/time', overrideDate);
    const call$ = this.scheduleService.reschedule(
      patient,
      this.currentSelected as SlotView,
      overrideDate,
      overrideUnit,
      originalDate);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: `Successfully re-scheduled a patient slot on ${format(overrideDate, 'dd MMM yyyy HH:mm a')}`,
      isModal: true,
      stay: true,
      successCallback: async (ids) => {
        console.log('server response', ids);
        const timestamp = new Date;
        const userId = this.auth.currentUser.id;
        const id = ids[0];

        const rescheduleItem = {
          id,
          date: overrideDate,
          originalDate,
          patientId: this.patient.id,
          sectionId: (this.currentSelected as SlotView).sectionId,
          slot: (this.currentSelected as SlotView).slot,
          overrideUnitId: overrideUnit,
          created: timestamp,
          updated: timestamp,
          createdBy: userId,
          updatedBy: userId
        } as Schedule;

        const unit = this.currentUnit;

        this.scheduleService.updateAllCache(rescheduleItem, null, unit, patient);
        if (this.crossUnit) {
          this.scheduleService.updateAllCache(rescheduleItem, null, this.crossUnit, patient);
        }

        this.cancel();
      },
      customErrorHandling: (err) => {
        this.selectedDate = this.lastSelectedDate;
        const result =  this.scheduleService.ErrorHandle(err, this.injector);
        return result;
      },
    });
  }

}
