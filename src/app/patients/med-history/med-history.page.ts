import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PatientInfo } from '../patient-info';
import { LoadingController, Platform, PopoverController } from '@ionic/angular';
import { ScrollHideConfig } from 'src/app/directive/scroll-hide.directive';
import { MedHistoryItemInfo, MedHistoryResult, MedOverview } from '../med-history';
import { MedHistoryService } from '../med-history.service';
import { finalize } from 'rxjs';
import { MatTable } from '@angular/material/table';
import { Medicine } from 'src/app/masterdata/medicine';
import { pushOrModal } from 'src/app/utils';
import { AddMedHistoryPage } from '../add-med-history/add-med-history.page';
import { ModalService } from 'src/app/share/service/modal.service';
import { MedPopoverComponent } from './med-popover/med-popover.component';
import { EditMedHistoryPage } from '../edit-med-history/edit-med-history.page';
import { isAfter, startOfMonth } from 'date-fns';
import { ExcelService } from 'src/app/share/service/excel.service';

@Component({
  selector: 'app-med-history',
  templateUrl: './med-history.page.html',
  styleUrls: ['./med-history.page.scss'],
})
export class MedHistoryPage implements OnInit {

  @Input() patient: PatientInfo;
  @Input() medOverview: MedOverview;
  @Output() medOverviewChange: EventEmitter<MedOverview> = new EventEmitter<MedOverview>();

  get width() { return this.plt.width(); }

  filterDate: Date;
  customFilterDate: Date;
  upperlimit: Date;

  filterList = [];
  medHistoryResult: MedHistoryResult;

  @ViewChild('table', { read: MatTable }) table: MatTable<any>;

  // ------------ UI ------------
  configHeader: ScrollHideConfig = { cssProperty: 'top', maxValue: 59, inverse: false };

  constructor(
    private plt: Platform,
    private medService: MedHistoryService,
    private excelService: ExcelService,
    private loadCtl: LoadingController,
    private popCtl: PopoverController,
    private modal: ModalService) { }

  ngOnInit() {
    // Init filter list
    const first = new Date();
    first.setDate(1);
    this.filterList.push({ t: '1 Month', v: first });
    const second = new Date();
    second.setDate(1);
    second.setMonth(second.getMonth() - 2);
    this.filterList.push({ t: '3 Months', v: second });
    const third = new Date();
    third.setDate(1);
    third.setMonth(third.getMonth() - 5);
    this.filterList.push({ t: '6 Months', v: third });
    const forth = new Date();
    forth.setDate(1);
    forth.setFullYear(forth.getFullYear() - 1);
    this.filterList.push({ t: '1 year', v: forth });
    this.filterList.push({ t: 'Custom...', v: null });

    this.filterDate = first;

    this.medService.getMedHistoryDetail(this.patient, this.filterDate, null)
      .subscribe(data => {
        console.log(data);
        this.medHistoryResult = data;
      });

    this.initScroll();
  }

  updateUpper() {
    if (this.upperlimit && new Date(this.upperlimit) < new Date(this.customFilterDate)) {
      this.upperlimit = null;
    }
  }

  getColumns() {
    return [ 'name', ...this.medHistoryResult.columns];
  }

  initScroll() {
    if (this.plt.is('ios')) {
      this.configHeader.maxValue = 54;
    }
    this.configHeader.maxValue += 51.86;
  }

  async update(customFilter: boolean = false) {
    if (this.filterDate || customFilter) {
      const filter = this.filterDate || new Date(this.customFilterDate);
      const loading = await this.loadCtl.create({
        backdropDismiss: false
      });
      const upperLimit = customFilter ? this.upperlimit : null;
      loading.present();
      this.medService.getMedHistoryDetail(this.patient, filter, upperLimit)
        .pipe(finalize(() => loading.dismiss()))
        .subscribe(data => {
          this.medHistoryResult = data;
          if (this.table) {
            this.table.renderRows();
          }

        });
    }
  }

  excel() {
    this.excelService.exportMedHistory(this.patient, this.medHistoryResult);
  }

  async newMed() {
    const params = { patient: this.patient };
    const result = await pushOrModal(AddMedHistoryPage, params, this.modal);
    if (result) {
      this.update(true);

      const newMed = result as MedHistoryItemInfo[];
      const entryTime = new Date(newMed[0].entryTime);
      // is this month
      if (isAfter(entryTime, startOfMonth(new Date()))) {
        for (let index = 0; index < newMed.length; index++) {
          const item = newMed[index];
          const targetMed = this.medOverview.thisMonthMeds.find(x => x.medId === item.medicineId);
          if (!targetMed) {
            this.medOverview.thisMonthMeds.push({ medId: item.medicineId, medicine: item.medicine, count: 1 });
          }
          else {
            targetMed.count += 1;
          }
        }
        this.medOverviewChange.emit(this.medOverview);
      }
    }
  }

  async detail(item: Medicine, value: MedHistoryItemInfo) {
    const params = { patient: this.patient, medicine: item, value, isModal: true };
    const result = await pushOrModal(EditMedHistoryPage, params, this.modal);

    if (result) {
      this.update(true);

      if (typeof result === 'boolean') {
        // is this month
        if (isAfter(new Date(value.entryTime), startOfMonth(new Date()))) {
          const targetMed = this.medOverview.thisMonthMeds.find(x => x.medId === value.medicineId);
          targetMed!.count -= 1;
          if (targetMed.count === 0) {
            this.medOverview.thisMonthMeds.splice(this.medOverview.thisMonthMeds.indexOf(targetMed), 1);
          }
          this.medOverviewChange.emit(this.medOverview);
        }
      }
    }
  }

  async detailMulti(e, item: Medicine, values: MedHistoryItemInfo[]) {
    const popup = await this.popCtl.create({
      showBackdrop: false,
      backdropDismiss: true,
      component: MedPopoverComponent,
      componentProps: { items: values, med: item, patient: this.patient },
      event: e
    });

    popup.present();
    const result = await popup.onWillDismiss();
    if (result.role === 'OK') {
      this.detail(item, result.data);
    }
  }

}

