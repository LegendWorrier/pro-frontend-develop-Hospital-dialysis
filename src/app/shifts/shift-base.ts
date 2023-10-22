import { finalize, mergeMap } from 'rxjs/operators';
import { ModalService } from './../share/service/modal.service';
import { Permissions } from '../enums/Permissions';
import { ShiftMenuComponent } from './components/shift-menu/shift-menu.component';
import { UserService } from '../auth/user.service';
import { deepCopy, addOrEdit } from 'src/app/utils';
import { PopoverController, AlertController } from '@ionic/angular';
import { ScheduleService } from '../schedule/schedule.service';
import { forkJoin, from, Observable, of } from 'rxjs';
import { MasterdataService } from '../masterdata/masterdata.service';
import { Unit } from '../masterdata/unit';
import { ShiftsService } from './shifts.service';
import { AuthService } from '../auth/auth.service';
import { Injector, ElementRef, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { setDate, addMonths } from 'date-fns';
import { ShiftInfo } from './shift-info';
import { UserShift, UserShiftResult } from './user-shift';
import { ShiftData, ShiftSlot } from './shift-slot';
import { User } from '../auth/user';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { isOfflimit, isOtherUnit } from './shift-utils';
import { Auth } from '../auth/auth-utils';
import { ExcelService } from '../share/service/excel.service';

export abstract class ShiftsBase {

  static FILTERLIST = [
    "All",
    "RN", // normal nurse & head nurse
    "PN", // assistant nurse / pratice nurse
    "PartTime" // only part time
  ]

  selectedSheet: 'Main' | 'Sub' = 'Main';
  filter: 'All'|'RN'|'PN'|'PartTime' = "All";

  sheet: UserShiftResult;
  original: UserShiftResult;

  multiUnit = false;
  isLoading = true;
  isAuthorized = false;

  unitList: Unit[];
  info: ShiftInfo[] = [];

  days: number[];
  month: Date;

  allNurseUsers: User[];
  protected units: number[];

  userShifts: UserShift[] = [];

  error: string;

  get IsCurrent() { return this.isCurrent; }
  private isCurrent = false;
  private isHistory = false;

  constructor(
    protected auth: AuthService,
    protected userService: UserService,
    protected shiftService: ShiftsService,
    protected scheduleService: ScheduleService,
    protected master: MasterdataService,
    protected excelService: ExcelService,
    protected pop: PopoverController,
    protected alert: AlertController,
    protected modal: ModalService,
    protected injector: Injector,
    protected el: ElementRef,
    protected renderer: Renderer2) {
  }

  initBase() {
    return new Promise<void>((resolve) => {
      this.multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;
      if (!this.month) {
        this.month = new Date();
        this.isCurrent = true;
      }

      from(this.master.getUnitListFromCache()).pipe(
        mergeMap((data) => {
          this.unitList = data;
          this.units = Auth.getUserUnits(this.unitList, this.auth);
          this.isAuthorized = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseOnly);
          this.isHistory = this.month.getMonth() < new Date().getMonth();
  
          return from(this.initShiftSheets());
        }),
        finalize(() => this.isLoading = false)
      ).subscribe(() => resolve());
    });
  }

  get isEditable() { return this.isAuthorized && !this.isHistory; }

  get isMain() { return this.selectedSheet === 'Main'; }

  onSheetChange(value: 'Main' | 'Sub') {
    this.selectedSheet = value;
  }

  initShiftSheets() {
    const numberOfDays = setDate(addMonths(this.month, 1), 0).getDate();
    this.days = Array.from(Array(numberOfDays), (_, i) => i + 1);
    
    return new Promise<void>((resolve) => {
      this.isLoading = true;
      let call$: Observable<UserShiftResult>;
      if (this.multiUnit) {
        call$ = this.shiftService.getAllShifts(this.month);
      }
      else {
        call$ = this.shiftService.getUnitShift(this.units[0], this.month);
      }
      const allUser$ = this.allNurseUsers ? of(this.allNurseUsers) : this.userService.getAllUser();
      const result$ = forkJoin([call$, allUser$]);
      result$.pipe(finalize(() => this.isLoading = false)).subscribe(([data, users]) => {
        this.allNurseUsers = users.filter(x => x.checkPermissionLevel(Permissions.NotDoctor));

        this.sheet = data;
        // front end safe-gaurd : just in case
        this.sheet.users = this.sheet.users.filter(x => !!this.allNurseUsers.find(u => x.userId === u.id));
        this.userShifts = this.sheet.users;
        this.original = deepCopy(this.sheet);

        setTimeout(() => {
          const numberOfDays = this.days.length;
          const shiftContainer = (this.el.nativeElement as HTMLElement).querySelector('.shift-container');
          this.renderer.setStyle(shiftContainer, '--ion-grid-columns', numberOfDays + 3, RendererStyleFlags2.DashCase);

          if (this.afterShiftSheetInit) { this.afterShiftSheetInit(); }
          resolve();
        }, 0);
      });
    });
  }

  protected updateFilter(newFilter: 'All'|'RN'|'PN'|'PartTime') {
    this.filter = newFilter;
    switch (newFilter) {
      case 'All':
        this.userShifts = this.sheet.users;
        break;
      case 'RN':
        this.userShifts = this.sheet.users.filter(x => !this.allNurseUsers.find(u => x.userId === u.id).isPN);
        break;
      case 'PN':
        this.userShifts = this.sheet.users.filter(x => this.allNurseUsers.find(u => x.userId === u.id).isPN);
        break;
      case 'PartTime':
        this.userShifts = this.sheet.users.filter(x => this.allNurseUsers.find(u => x.userId === u.id).isPartTime);
        break;
    
      default:
        break;
    }
  }

  protected afterShiftSheetInit?();

  async slotSelect(userShift: UserShift, day: number, slot: ShiftSlot, event) {
    if (!this.isEditable) {
      return;
    }
    if (slot && this.isCurrent && !this.auth.currentUser.isPowerAdmin) {
      if (isOfflimit(slot)) {
        const alert = await this.alert.create({
          header: 'Off-limits',
          subHeader: 'Edit is not allowed.',
          message: 'This shift slot is set to off-limit and cannot be edited.',
          buttons: [ { text: 'Ok' } ]
        });
        alert.present();
        return;
      }
      if (isOtherUnit(slot)) {
        const alert = await this.alert.create({
          header: 'On Another Unit',
          subHeader: 'Edit is not allowed.',
          message: 'This shift slot is set for another unit and cannot be edited by you.',
          buttons: [ { text: 'Ok' } ]
        });
        alert.present();
        return;
      }
    }
    const menu = await this.pop.create({
      component: ShiftMenuComponent,
      componentProps: {
        user: this.allNurseUsers.find(x => x.id === userShift.userId),
        infoList: this.info,
        unitList: this.units.map(x => this.unitList.find(u => u.id === x)),
        unitId: this.multiUnit ? null : this.units[0],
        day
      },
      event,
      id: 'shift-menu'
    });
    menu.present();
    const result = await menu.onWillDismiss();
    switch (result.role) {
      case 'shift':
        const unitId = result.data.unitId;
        const shifts = result.data.shifts;
        this.shift(shifts, unitId, { slot, userShift, day });
        break;
      case 'reserve':
        this.reserve({ slot, userShift, day });
        break;
      case 'offlimit':
        this.offlimit({ slot, userShift, day });
        break;
      default:
        return;
    }

    if (userShift.suspended) {
      userShift.suspended = false;
    }
  }

  async globalSelect(userShift: UserShift, event) {
    if (!this.isEditable) {
      return;
    }
    if (this.isCurrent && !this.auth.currentUser.isPowerAdmin) {
      const alert = await this.alert.create({
        header: 'Not Allowed',
        message: 'Globally edit user shift is not allowed on the current ongoing month.',
        buttons: [ { text: 'Ok' } ]
      });
      alert.present();
      return;
    }
    const menu = await this.pop.create({
      component: ShiftMenuComponent,
      componentProps: {
        infoList: this.info,
        unitList: this.units.map(x => this.unitList.find(u => u.id === x)),
        unitId: this.multiUnit ? null : this.units[0],
        globalMode: true,
        user: this.allNurseUsers.find(x => x.id === userShift.userId)
      },
      event,
      id: 'shift-menu'
    });
    menu.present();
    const result = await menu.onWillDismiss();
    switch (result.role) {
      case 'shift':
        const unitId = result.data.unitId;
        const shifts = result.data.shifts;
        this.days.forEach(day => {
          this.shift(shifts, unitId, { slot: userShift.shiftSlots.find(x => new Date(x.date).getDate() === day), userShift, day });
        });
        break;
      case 'reserve':
        this.days.forEach(day => {
          this.reserve({ slot: userShift.shiftSlots.find(x => new Date(x.date).getDate() === day), userShift, day });
        });
        break;
      case 'offlimit':
        this.days.forEach(day => {
          this.offlimit({ slot: userShift.shiftSlots.find(x => new Date(x.date).getDate() === day), userShift, day });
        });
        break;
      case 'suspend':
        userShift.suspended = true;
        break;
      case 'info':
        this.modal.openModal(UserInfoComponent, { user: this.allNurseUsers.find(x => x.id === userShift.userId), unitList: this.unitList });
        break;
      default:
        return;
    }
  }

  shift(shifts: ShiftData, unitId: number, target: { slot?: ShiftSlot, userShift?: UserShift, day?: number }) {
    if (!target.slot) {
      const slot = {
        date: setDate(new Date(this.month), target.day),
        shiftData: shifts,
        userId: target.userShift.userId,
        unitId
      } as ShiftSlot;
      target.userShift.shiftSlots.push(slot);
    }
    else {
      target.slot.shiftData = shifts;
      target.slot.unitId = unitId;
    }
  }

  reserve(target: { slot?: ShiftSlot, userShift?: UserShift, day?: number }) {
    if (!target.slot) {
      const slot = {
        date: setDate(new Date(this.month), target.day),
        shiftData: ShiftData.Reserved,
        userId: target.userShift.userId,
      } as ShiftSlot;
      target.userShift.shiftSlots.push(slot);
    }
    else {
      target.slot.shiftData = ShiftData.Reserved;
      target.slot.unitId = null;
    }
  }

  offlimit(target: { slot?: ShiftSlot, userShift?: UserShift, day?: number }) {
    if (!target.slot) {
      const slot = {
        date: setDate(new Date(this.month), target.day),
        shiftData: ShiftData.OffLimit,
        userId: target.userShift.userId,
      } as ShiftSlot;
      target.userShift.shiftSlots.push(slot);
    }
    else {
      target.slot.shiftData = ShiftData.OffLimit;
      target.slot.unitId = null;
    }
  }


  private isEqual(...objects: any[]) { return objects.every(obj => JSON.stringify(obj) === JSON.stringify(objects[0])); }

  get isChanged() {
    return this.sheet.users.length > 0 &&
    !this.sheet.users.every((x, i) => this.isEqual(x, this.original.users[i]));
  }

  save() {
    const call$ = this.shiftService.createOrUpdateShifts(this.sheet, this.month);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Successfully saved all the shifts.',
      isModal: false,
      stay: true,
      errorCallback: err => this.error = err,
      successCallback: _ => {
        this.initShiftSheets();
      },
      completeCallback: () => this.error = null
    });
  }

  cancel() {
    this.sheet = deepCopy(this.original);
    this.updateFilter(this.filter);
  }

  excel() {
    this.excelService.exportShiftSheet(this.sheet, this.info, this.unitList, this.allNurseUsers);
  }

}
