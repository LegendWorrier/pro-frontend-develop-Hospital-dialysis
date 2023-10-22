import { Unit } from 'src/app/masterdata/unit';
import { User } from 'src/app/auth/user';
import { HistoryListPage } from './../../history-list/history-list.page';
import { NextMonthPage } from './../../next-month/next-month.page';
import { ModalService } from 'src/app/share/service/modal.service';
import { PopoverController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { ShiftInfo } from '../../shift-info';
import { InchargesPage } from '../../incharges/incharges.page';

@Component({
  selector: 'app-shift-main-menu',
  templateUrl: './shift-main-menu.component.html',
  styleUrls: ['./shift-main-menu.component.scss'],
})
export class ShiftMainMenuComponent implements OnInit {
  @Input() info: ShiftInfo[];
  @Input() colors: { [unitId: number]: string } = {};
  @Input() allNurseUsers: User[];
  @Input() unitList: Unit[];

  constructor(private pop: PopoverController, private modal: ModalService) { }

  ngOnInit() {}

  nextmonth() {
    this.modal.openModal(NextMonthPage, {
      info: this.info,
      colors: this.colors,
      allNurseUsers: this.allNurseUsers
    });
    this.pop.dismiss();
  }

  incharges() {
    this.modal.openModal(InchargesPage, {
      info: this.info,
      allNurseUsers: this.allNurseUsers,
      unitList: this.unitList
    });
    this.pop.dismiss();
  }

  history() {
    this.modal.openModal(HistoryListPage, {
      colors: this.colors,
      allNurseUsers: this.allNurseUsers
    });
    this.pop.dismiss();
  }

}
