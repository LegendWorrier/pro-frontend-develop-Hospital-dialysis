import { ModalService } from './../share/service/modal.service';
import { UserShift } from './user-shift';
import { ControlHelperComponent } from './../share/components/control-helper/control-helper.component';
import { ShiftMainMenuComponent } from './components/shift-main-menu/shift-main-menu.component';
import { UserService } from './../auth/user.service';
import { PopoverController, Platform, AlertController } from '@ionic/angular';
import { ScheduleService } from './../schedule/schedule.service';
import { MasterdataService } from './../masterdata/masterdata.service';
import { ShiftsService } from './shifts.service';
import { AuthService } from './../auth/auth.service';
import { Component, OnInit, Injector, ElementRef, Renderer2, ViewChild, EnvironmentInjector, ViewContainerRef } from '@angular/core';
import { ShiftsBase } from './shift-base';
import { UnitRoundLegendComponent } from './components/unit-round-legend/unit-round-legend.component';
import { ShiftsTableComponent } from './components/shifts-table/shifts-table.component';
import { ExcelService } from '../share/service/excel.service';

@Component({
  selector: 'app-shifts',
  templateUrl: 'shifts.page.html',
  styleUrls: ['shifts.page.scss', '../share/excel-btn.scss']
})
export class ShiftsPage extends ShiftsBase implements OnInit {
  pageName = "Shifts";

  selfMode = false;
  isNurse: boolean;

  error: string;

  get Width() { return this.plt.width(); }
  
  @ViewChild('control') control: ControlHelperComponent;
  @ViewChild('table') table: ShiftsTableComponent;

  @ViewChild('legend') legend: UnitRoundLegendComponent;

  constructor(
    auth: AuthService,
    userService: UserService,
    shiftService: ShiftsService,
    scheduleService: ScheduleService,
    master: MasterdataService,
    excelService: ExcelService,
    pop: PopoverController,
    alert: AlertController,
    private plt: Platform,
    private environment: EnvironmentInjector,
    modal: ModalService,
    injector: Injector,
    el: ElementRef,
    renderer: Renderer2) {
      super(auth, userService, shiftService, scheduleService, master, excelService, pop, alert, modal, injector, el, renderer);
  }

  async ngOnInit() {
    await this.initBase();
    
    this.isNurse = !this.auth.currentUser.isPowerAdmin && (this.auth.currentUser.isNurse || this.auth.currentUser.isHeadNurse);

    this.userService.onUserUpdate.subscribe(info => { // auto update when edit some user
      if (info.data.isNurse || info.data.isHeadNurse) {
        if (info.type === 'edit') {
          const user = this.allNurseUsers.find(x => x.id === info.data.id);
          if (user) {
            Object.assign(user, info.data);
          }
        }
        else {
          this.allNurseUsers = this.allNurseUsers.filter(x => x.id !== info.data.id);
        }
      }
    });
  }

  protected override afterShiftSheetInit() {
    this.control.init(this.table.container);
  }

  async reload() {
    this.isLoading = true;
    if (!this.unitList) {
      await this.initBase();
      this.legend?.updateInfo();
    }
    else {
      this.legend?.updateInfo();
      await this.initShiftSheets();
    }
  }

  async openMenu(event) {
    const popover = await this.pop.create({
      component: ShiftMainMenuComponent,
      event,
      cssClass: 'pop-main-menu',
      showBackdrop: false,
      componentProps: {
        info: this.info,
        colors: this.legend.colors,
        allNurseUsers: this.allNurseUsers,
        unitList: this.unitList
      }
    });
    popover.present();
  }

  getSelf(): UserShift {
    return this.sheet.users.find(x => x.userId === this.auth.currentUser.id);
  }

  

  

}
