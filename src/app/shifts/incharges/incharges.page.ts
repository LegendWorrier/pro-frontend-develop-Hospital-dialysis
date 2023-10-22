import { ControlHelperComponent } from './../../share/components/control-helper/control-helper.component';
import { TextBoxInputComponent } from './../components/text-box-input/text-box-input.component';
import { UserInfoComponent } from './../components/user-info/user-info.component';
import { IonNav, PopoverController } from '@ionic/angular';
import { ModalSearchListComponent, ModalSearchParams } from 'src/app/share/components/modal-search-list/modal-search-list.component';
import { ModalService } from 'src/app/share/service/modal.service';
import { Incharge, InchargeSection } from './../incharge';
import { forkJoin } from 'rxjs';
import { ShiftsService } from './../shifts.service';
import { ScheduleSection } from './../../schedule/section';
import { Unit } from 'src/app/masterdata/unit';
import { addMonths, isSameMonth, setDate, format, startOfDay } from 'date-fns';
import { User } from 'src/app/auth/user';
import { ShiftInfo } from './../shift-info';
import { Component, Input, OnInit, ElementRef, Renderer2, RendererStyleFlags2, ViewChild, ChangeDetectorRef, TemplateRef, Injector } from '@angular/core';
import { getName, addOrEdit, deepCopy, pushOrModal } from 'src/app/utils';
import { convertStartTimeToDate } from 'src/app/schedule/schedule-utils';

@Component({
  selector: 'app-incharges',
  templateUrl: './incharges.page.html',
  styleUrls: ['./incharges.page.scss', '../components/shifts-table/shifts-table.component.scss'],
})
export class InchargesPage implements OnInit {

  @Input() info: ShiftInfo[];
  @Input() allNurseUsers: User[];
  @Input() unitList: Unit[];

  month: Date;
  days: number[];
  nextMonth = false;

  incharges: Incharge[][] = [];
  inchargesNext: Incharge[][] = [];
  current: Incharge[][];

  originals: Incharge[][];
  originalsNext: Incharge[][];

  private repeatDays: number[];

  @ViewChild('container', { read: ElementRef, static: true }) container: ElementRef;
  @ViewChild('menuItem') menuItemT: TemplateRef<any>;
  @ViewChild('control', { static: true }) control: ControlHelperComponent;

  constructor(
    private shiftService: ShiftsService,
    private modal: ModalService,
    private nav: IonNav,
    private pop: PopoverController,
    private el: ElementRef,
    private renderer: Renderer2,
    private injector: Injector
  )
  {}

  ngOnInit() {
    this.NextMonth = false;
    const calls$ = this.info.map(x => this.shiftService.getIncharges(x.unitId));
    forkJoin(calls$).subscribe((data) => {
      const thisMonth = new Date();
      const nextMonth = addMonths(new Date(), 1);
      this.incharges = data.map(incharge => incharge.filter(x => isSameMonth(thisMonth, new Date(x.date))));
      this.originals = deepCopy(this.incharges);
      this.inchargesNext = data.map(incharge => incharge.filter(x => isSameMonth(nextMonth, new Date(x.date))));
      this.originalsNext = deepCopy(this.inchargesNext);

      this.current = this.nextMonth ? this.inchargesNext : this.incharges;
      console.log(this.current);
    });
    this.control.target = this.container;
  }

  set NextMonth(value: boolean) {
    this.nextMonth = value;

    this.month = startOfDay(this.nextMonth ? addMonths(new Date(), 1) : new Date());
    const numberOfDays = setDate(addMonths(this.month, 1), 0).getDate();
    this.days = Array.from(Array(numberOfDays), (_, i) => i + 1);
    this.renderer.setStyle(this.container.nativeElement, '--ion-grid-columns', numberOfDays + 2, RendererStyleFlags2.DashCase);
    this.current = this.nextMonth ? this.inchargesNext : this.incharges;
  }

  getName(user) { return getName(user); }

  getUnit(unitId: number) {
    return this.unitList.find(x => x.id === unitId);
  }

  startTime(section: ScheduleSection) {
    return convertStartTimeToDate(section.startTime);
  }

  endTime(section: ScheduleSection) {
    return convertStartTimeToDate(section.startTime + 240);
  }

  getIncharge(i: number, day: number) {
    return this.current[i]?.find(x => new Date(x.date).getDate() === day);
  }

  getInchargeUser(incharge: Incharge, sectionId?: number) {
    const userId = incharge.sections.find(x => x.sectionId === sectionId)?.userId ?? incharge.userId;
    if (!userId) {
      return null;
    }
    return this.allNurseUsers.find(x => x.id === userId);
  }

  async onSelect(i: number, day: number, section: ScheduleSection, event, incharge?: Incharge, inchargeUser?: User) {
    console.log(day);
    const info = this.info[i];
    if (incharge && inchargeUser) {
      const cmd = await this.menu(event, { user: inchargeUser });
      switch (cmd) {
        case 'sel':
          const user = await this.selectUser(info.unitId, { currentUser: inchargeUser });
          if (user) {
            this.putIncharge(user, info.unitId, day, { incharge, section });
          }
          break;
        case 'info':
          pushOrModal(UserInfoComponent, { user: inchargeUser, unitList: this.unitList }, this.modal);
          break;
        case 'del':
          this.remove(incharge, section);
          if (incharge.userId) {
            const excludes = incharge.sections.map(x => x.sectionId);
            const newSections = info.sections.filter(x => !excludes.includes(x.id) && x.id !== section.id)
              .map(x => ({ sectionId: x.id, userId: incharge.userId } as InchargeSection));
            incharge.userId = null;
            incharge.sections.push(...newSections);
          }
          break;
      }
    }
    else {
      const list = this.current[i];
      const user = await this.selectUser(info.unitId);
      if (user) {
        this.putIncharge(user, info.unitId, day, { section, incharge, list });
      }
    }
  }

  async sectionSelect(i: number, section: ScheduleSection) {
    console.log(section);
    const info = this.info[i];

    const user = await this.selectUser(info.unitId, { section, i: info.sections.indexOf(section) });
    if (user) {
      const list = this.current[i];
      this.days.forEach(day => {
        const incharge = this.getIncharge(i, day);
        this.putIncharge(user, info.unitId, day, { incharge, list, section });
      });
    }
  }

  async daySelect(i: number, day: number, event) {
    const info = this.info[i];
    if (info.sections.length === 0) {
      return;
    }
    console.log(this.current[i]);
    const incharge = this.getIncharge(i, day);
    const anyUser = incharge && (incharge.userId || incharge.sections.length > 0);
    if (anyUser) {
      const cmd = await this.menu(event, { day });
      switch (cmd) {
        case 'sel':
          const user = await this.selectUser(info.unitId, { day });
          if (user) {
            this.putIncharge(user, info.unitId, day, { incharge });
          }
          break;
        case 'del':
          this.removeAll(incharge);
          break;
        default:
          if (cmd && cmd.startsWith('repeat')) {
            const arg = cmd.split('-', 2)[1];
            if (arg) {
              const list = this.current[i];
              switch (arg) {
                case 'a': // After
                  this.repeatDays = Array.from(Array(this.days.length - day), (_, index) => index + day + 1);
                  console.log(this.repeatDays);
                  break;
                case 'b': // Before
                  this.repeatDays = Array.from(Array(day - 1), (_, index) => index + 1);
                  console.log(this.repeatDays);
                  break;
                case 'c': // Custom
                  // no need to do anything.
                  break;
              }
              this.repeatDays.forEach(n => {
                const newIncharge = deepCopy(incharge) as Incharge;
                newIncharge.date = setDate(this.month, n);
                const old = list.find(x => new Date(x.date).getDate() === n);
                if (old) {
                  Object.assign(old, newIncharge);
                }
                else {
                  list.push(newIncharge);
                }
              });
            }
            else { // All
              const list = this.current[i] = [];
              this.days.forEach(n => {
                const newIncharge = deepCopy(incharge) as Incharge;
                newIncharge.date = setDate(this.month, n);
                list.push(newIncharge);
              });
            }
            console.log(this.current[i]);
          }
          break;
      }
    }
    else {
      const user = await this.selectUser(info.unitId, { day });
      if (user) {
        const list = this.current[i];
        this.putIncharge(user, info.unitId, day, { incharge, list });
      }
    }
  }

  async menu(event, arg: { day?: number, user?: User }): Promise<string> {
    // If day is provided, means this menu is for day select case.
    const options = arg.day ? [
      { txt: 'Replace all users', value: 'sel' },
      { txt: 'Remove All', value: 'del' },
      { txt: 'Repeat for...', value: 'repeat' }
    ]
    : [
      { txt: 'Replace User', value: 'sel' },
      { txt: 'Remove', value: 'del' },
      { txt: 'User Detail', value: 'info' }
    ];
    const select = await this.pop.create({
      component: ModalSearchListComponent,
      componentProps: {
        data: options,
        getSearchKey: (item) => item.txt,
        simpleMode: true,
        title: arg.day ? `${format(setDate(new Date(this.month), arg.day), 'dd MMM yyyy')}`
                : `${getName(arg.user)} (${arg.user.isHeadNurse ? 'Head Nurse' : 'Nurse'})`,
        templateOverride: this.menuItemT
      } as ModalSearchParams<any>,
      event
    });
    select.present();
    const result = await select.onWillDismiss();
    if (result.data) {
      if (result.data.value === 'repeat') {
        const repeatResult = await this.repeatMenu(event);
        return repeatResult;
      }
      else {
        return result.data.value;
      }
    }

    return null;
  }

  async repeatMenu(event): Promise<string> {
    const repeatOptions = [
      { txt: 'All (The whole month)', value: 'm' },
      { txt: 'Before (Every days before)', value: 'b' },
      { txt: 'After (Every days afterward)', value: 'a' },
      { txt: 'Custom..', value: 'c' }
    ];
    const repeatSelect = await this.pop.create({
      component: ModalSearchListComponent,
      componentProps: {
        data: repeatOptions,
        getSearchKey: (item) => item.txt,
        simpleMode: true,
      } as ModalSearchParams<any>,
      event
    });
    repeatSelect.present();
    const repeat = await repeatSelect.onWillDismiss();
    if (repeat.data) {
      if (repeat.data.value === 'm') {
        return 'repeat';
      }
      else if (repeat.data.value === 'c') {
        return await this.customRepeat(event, this.days.length);
      }
      else {
        return `repeat-${repeat.data.value}`;
      }
    }

    return null;
  }

  async customRepeat(event, limit: number) {
    let days: number[];
    const pattern = '([0-9]{1,2}\\s*[,-]\\s*)*[0-9]{1,2}';
    const reg = new RegExp(`^${pattern}$`);
    const checkAndProcess = (value: string) => {
      if (!value) {
        return 'Please input the value first.';
      }
      if (!reg.test(value)) {
        return 'Wrong input. Please use only number and format as the example.';
      }

      const tmp: number[] = [];
      const numbers = value.split(',');
      const invalidDate = `Please input only valid date for ${this.nextMonth ? 'the target month' : 'current month'} (1-${limit}).`;
      const checkDate = (n: number) => n >= 1 && n <= limit;
      for (const n of numbers) {
        const range = n.split('-', 2);
        if (range.length > 1) {
          const first = parseInt(range[0].trim(), 10);
          const second = parseInt(range[1].trim(), 10);
          if (second <= first) {
            return 'Please input a valid range.';
          }
          if (!checkDate(first) || !checkDate(second)) {
            return invalidDate;
          }
          const len = (second - first) + 1;
          Array.from(Array(len), (_, i) => i + first).forEach(day => {
            if (!tmp.includes(day)) {
              tmp.push(day);
            }
          });
        }
        else {
          const num = parseInt(n.trim(), 10);
          if (!checkDate(num)) {
            return invalidDate;
          }
          if (!tmp.includes(num)) {
            tmp.push(num);
          }
        }
      }

      // at this point, the input value has passed all checks.
      days = tmp;
      return null;
    };
    const inputPop = await this.pop.create({
      component: TextBoxInputComponent,
      componentProps: {
        placeholder: 'Enter day(s)',
        hint: 'Ex: 1, 2, 5-10',
        pattern,
        checkInput: checkAndProcess
      },
      event
    });
    inputPop.present();
    const result = await inputPop.onWillDismiss();
    if (result.role === 'ok') {
      this.repeatDays = days;
      return 'repeat-c';
    }

    return null;
  }

  selectUser(unitId: number, arg?: { section?: ScheduleSection, i?: number, day?: number, currentUser?: User }): Promise<User> {
    return new Promise(async (resolve) => {
      const result = await pushOrModal(ModalSearchListComponent, 
        {
          data: this.allNurseUsers.filter(x => x.units.includes(unitId) && x.id !== arg?.currentUser?.id),
          getSearchKey: (user) => getName(user),
          title: `Select ${arg?.section || arg?.day ? ' Default ' : ''}User` + (arg?.section ?
            ` for ${this.getUnit(unitId).name} at round ${arg.i + 1} (${format(convertStartTimeToDate(arg.section.startTime), 'hh:mm a')})`
            : arg?.day ?
            ` for ${this.getUnit(unitId).name} on ${format(setDate(new Date(this.month), arg.day), 'do MMM yyyy')}`
            : ''),
          nav: this.nav
        } as ModalSearchParams<User>, this.modal);

      resolve(result);
    });
  }

  /**
   * For target arguments: Need either list or incharge at least. Section is optional.
   *
   * @param {User} user
   * @param {number} unitId
   * @param {number} day
   * @param {{ incharge?: Incharge, list?: Incharge[], section?: ScheduleSection }} target
   * @memberof InchargesPage
   */
  putIncharge(user: User, unitId: number, day: number, target: { incharge?: Incharge, list?: Incharge[], section?: ScheduleSection }) {
    if (!target.incharge) {
      const incharge = {
        date: setDate(this.month, day),
        userId: target.section ? null : user.id,
        unitId,
        sections: target.section ? [ { userId: user.id, sectionId: target.section.id } as InchargeSection ] : []
      } as Incharge;
      target.list.push(incharge);
    }
    else {
      if (target.section) {
        const sections = target.incharge.sections;
        const section = sections.find(x => x.sectionId === target.section.id);
        if (section) {
          section.userId = user.id;
        }
        else {
          sections.push({ sectionId: target.section.id, userId: user.id } as InchargeSection);
        }
      }
      else {
        target.incharge.sections = [];
        target.incharge.userId = user.id;
      }
    }
  }

  remove(incharge: Incharge, section: ScheduleSection) {
    const inchargeSection = incharge.sections.find(x => x.sectionId === section.id);
    if (!inchargeSection) {
      return false;
    }
    incharge.sections.splice(incharge.sections.indexOf(inchargeSection), 1);
    return true;
  }

  removeAll(incharge: Incharge) {
    incharge.sections = [];
    incharge.userId = null;
  }

  save(i: number) {
    const call$ = this.shiftService.addOrUpdatIncharges(this.current[i]);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Save incharges successfully.',
      isModal: true,
      stay: true,
      successCallback: (success) => {
        if (success) {
          if (this.nextMonth) {
            this.originalsNext[i] = deepCopy(this.current[i]);
          }
          else {
            this.originals[i] = deepCopy(this.current[i]);
          }
        }
      }
    });
  }

  cancel(i: number) {
    if (this.nextMonth) {
      this.inchargesNext[i] = deepCopy(this.originalsNext[i]);
    }
    else {
      this.incharges[i] = deepCopy(this.originals[i]);
    }
  }

  private isEqual(...objects: any[]) { return objects.every(obj => JSON.stringify(obj) === JSON.stringify(objects[0])); }

  isChanged(i: number) {
    let list: Incharge[];
    let ori: Incharge[];
    if (this.nextMonth) {
      list = this.inchargesNext[i];
      ori = this.originalsNext[i];
    }
    else {
      list = this.incharges[i];
      ori = this.originals[i];
    }
    return list.length > 0 && !list.every((x, index) => this.isEqual(x, ori[index]));
  }

}
