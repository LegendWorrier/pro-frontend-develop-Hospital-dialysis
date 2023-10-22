import { ModalService } from './../../share/service/modal.service';
import { ShiftSlot } from './../shift-slot';
import { addOrEdit, deepCopy } from 'src/app/utils';
import { ShiftsService } from './../shifts.service';
import { UserService } from 'src/app/auth/user.service';
import { AuthService } from 'src/app/auth/auth.service';
import { addMonths, startOfDay, startOfMonth } from 'date-fns';
import { ChangeDetectorRef, Component, ElementRef, Injector, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ShiftsBase } from '../shift-base';
import { PopoverController, Platform, AlertController } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { ScheduleService } from 'src/app/schedule/schedule.service';
import { AuditService } from 'src/app/share/service/audit.service';
import { User } from 'src/app/auth/user';
import { ShiftInfo } from '../shift-info';
import { ControlHelperComponent } from 'src/app/share/components/control-helper/control-helper.component';
import { ShiftsTableComponent } from '../components/shifts-table/shifts-table.component';
import { ExcelService } from 'src/app/share/service/excel.service';

@Component({
  selector: 'app-next-month',
  templateUrl: './next-month.page.html',
  styleUrls: ['./next-month.page.scss', '../../share/excel-btn.scss'],
})
export class NextMonthPage extends ShiftsBase implements OnInit {

  @Input() info: ShiftInfo[];
  @Input() colors: { [unitId: number]: string };
  @Input() allNurseUsers: User[];

  @ViewChild('table') table: ShiftsTableComponent;
  @ViewChild('control') control: ControlHelperComponent;

  editSelf = false;

  get Width() { return this.plt.width(); }

  monthList: Date[] = [];
  selectedMonthIndex;
  lastSelectedMonthIndex;

  maxNextMonth = 3; // right now, it is fixed value. But if customer requests more, change to setting.

  get width() { return this.plt.width(); }

  constructor(
    auth: AuthService,
    userService: UserService,
    shiftService: ShiftsService,
    scheduleService: ScheduleService,
    master: MasterdataService,
    excelService: ExcelService,
    pop: PopoverController,
    alert: AlertController,
    private audit: AuditService,
    private cdr: ChangeDetectorRef,
    private plt: Platform,
    modal: ModalService,
    injector: Injector,
    el: ElementRef,
    renderer: Renderer2) {
      super(auth, userService, shiftService, scheduleService, master, excelService, pop, alert, modal, injector, el, renderer);
   }

  async ngOnInit() {
    this.month = startOfDay(startOfMonth(addMonths(new Date(), 1)));
    for (let i = 0; i < this.maxNextMonth; i++) {
      this.monthList.push(addMonths(this.month, i));
    }
    
    await this.initBase();

    this.lastSelectedMonthIndex = this.selectedMonthIndex = 0;
  }

  protected override afterShiftSheetInit() {
    this.control.init(this.table.container);
    console.log('month: ', this.month);
  }

  override get isEditable(): boolean {
      return this.editSelf || super.isEditable;
  }

  async reload() {
    await this.initShiftSheets();
  }

  getSelf() {
    return this.sheet.users.find(x => x.userId === this.auth.currentUser.id);
  }

  async updateSelf() {
    const self = this.getSelf();
    const call$ = this.shiftService.createOrUpdateShiftsForSelf(this.month, self.shiftSlots, self.suspended);
    await addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Changes have been saved successfully.',
      isModal: true,
      stay: true,
      errorCallback: err => {
        this.error = err;
      },
      successCallback: (data: ShiftSlot[]) => {
        this.initShiftSheets();
        this.editSelf = false;
      },
      completeCallback: () => this.error = null
    });
  }

  async onMonthChange($event) {
    console.log('current', this.selectedMonthIndex);
    console.log('from event', $event);
    if (this.isChanged) {
      const prompt = await this.alert.create({
        backdropDismiss: true,
        header: 'Unsaved change',
        message: 'There is unsaved change, all will be lost, are you sure you want to continue?',
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
      prompt.present();
      const result = await prompt.onWillDismiss();
      if (result.role !== 'ok') {
        this.selectedMonthIndex = this.lastSelectedMonthIndex;
        return;
      }
    }
    this.month = this.monthList[this.selectedMonthIndex];
    this.initShiftSheets();
    this.lastSelectedMonthIndex = this.selectedMonthIndex;
  }

}
