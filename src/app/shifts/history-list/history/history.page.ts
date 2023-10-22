import { ModalService } from './../../../share/service/modal.service';
import { Component, ElementRef, Injector, Input, OnInit, Renderer2 } from '@angular/core';
import { PopoverController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/auth/user.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { ScheduleService } from 'src/app/schedule/schedule.service';
import { ShiftsBase } from '../../shift-base';
import { ShiftsService } from '../../shifts.service';
import { ExcelService } from 'src/app/share/service/excel.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss', '../../../share/excel-btn.scss'],
})
export class HistoryPage extends ShiftsBase implements OnInit {

  @Input() colors: { [unitId: number]: string };
  @Input() month: Date;

  constructor(
    auth: AuthService,
    userService: UserService,
    shiftService: ShiftsService,
    scheduleService: ScheduleService,
    master: MasterdataService,
    excelService: ExcelService,
    pop: PopoverController,
    alert: AlertController,
    modal: ModalService,
    injector: Injector,
    el: ElementRef,
    renderer: Renderer2) {
      super(auth, userService, shiftService, scheduleService, master, excelService, pop, alert, modal, injector, el, renderer);
   }

  ngOnInit() {
  }

  reload() {
    this.initShiftSheets();
  }

}
