import { HistoryPage } from './history/history.page';
import { ModalService } from './../../share/service/modal.service';
import { ShiftsService } from './../shifts.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.page.html',
  styleUrls: ['./history-list.page.scss'],
})
export class HistoryListPage implements OnInit {

  @Input() colors: { [unitId: number]: string };

  loading = true;
  historyList: Date[];

  constructor(private shiftService: ShiftsService, private modal: ModalService) { }

  ngOnInit() {
    this.shiftService.getHistoryList().subscribe(x => {this.historyList = x; this.loading = false;});
  }

  select(month: Date) {
    this.modal.currentNav.push(HistoryPage, { colors: this.colors, month });
  }

}
