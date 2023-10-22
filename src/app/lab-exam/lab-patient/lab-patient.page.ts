import { ExcelService } from './../../share/service/excel.service';
import { LabExamInfo } from './../lab-exam';
import { LabPopoverComponent } from './popover/lab-popover.component';
import { PatientInfo } from 'src/app/patients/patient-info';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, Platform, PopoverController } from '@ionic/angular';
import { ModalService } from 'src/app/share/service/modal.service';
import { LabService } from '../lab.service';
import { LabResult } from '../lab-result';
import { MatTable } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import { LabItem } from 'src/app/masterdata/labItem';
import { pushOrModal, getName } from 'src/app/utils';
import { AddLabExamPage } from '../add-lab-exam/add-lab-exam.page';
import { LabExamDetailPage } from '../lab-exam-detail/lab-exam-detail.page';
import { ScrollHideConfig } from 'src/app/directive/scroll-hide.directive';
import { ScreenOrientation } from '@capacitor/screen-orientation';

@Component({
  selector: 'app-lab-patient',
  templateUrl: './lab-patient.page.html',
  styleUrls: ['./lab-patient.page.scss'],
})
export class LabPatientPage implements OnInit {

  get width() { return this.plt.width(); }

  constructor(
    private activatedRoute: ActivatedRoute,
    private lab: LabService,
    private loadCtl: LoadingController,
    private modal: ModalService,
    private plt: Platform,
    private popoverCtl: PopoverController,
    private excelService: ExcelService
  ) { }
  @Input() isModal: boolean;
  @Input() patient: PatientInfo;

  filterDate: Date;
  customFilterDate: Date;
  upperlimit: Date;

  filterList = [];
  labExamResult: LabResult;

  updateTmp;
  originalCalculatedCount: number;

  @ViewChild('table', { read: MatTable }) table: MatTable<any>;

  // ------------ UI ------------
  configHeader: ScrollHideConfig = { cssProperty: 'top', maxValue: 59, inverse: false };
  configSegment: ScrollHideConfig = { cssProperty: 'top', maxValue: 48, initValue: 59, inverse: false };

  // ---------------- chart -------------
  chartdata: any[];

  legend = true;
  legendTitle = 'Lab Items';
  showLabels = true;
  animations = true;
  xAxisLabel = 'Date/Year';
  yAxisLabel = 'Lab Value';

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  ngOnInit() {
    if (!this.patient) {
      this.patient = this.activatedRoute.snapshot.data.patient;
    }
    this.updateTmp = { patient: this.patient, newList: [] as LabExamInfo[], deleted: 0, lastRecord: null, calculatedDif: 0 };

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

    this.filterDate = second;

    this.lab.getAllLabExamByPatient(this.patient, this.filterDate, null)
      .subscribe(data => {
        console.log(data);
        this.labExamResult = this.lab.calculateSystemBound(data);
        this.originalCalculatedCount = this.labExamResult.data
          .filter(x => !x.key.isCalculated)
          .map(x => x.value.map(y => y.length).length)
          .reduce((p, c) => p + c, 0);
        this.updateChart();
      });

    this.initScroll();
  }

  getColumns() {
    return [ 'name', ...this.labExamResult.columns];
  }

  initScroll() {
    if (this.plt.is('ios')) {
      this.configHeader.maxValue = 54;
      this.configSegment.initValue = 54;
    }
    this.configHeader.maxValue += 51.86;
    ScreenOrientation.addListener('screenOrientationChange', () => {
      this.updateSegmentConfig(true);
    });
    this.updateSegmentConfig(false);
  }

  updateSegmentConfig(swap: boolean) {
    if (this.plt.width() <= 576) {
      this.configSegment.maxValue = swap ? 48 : 73.54;
    }
    else {
      this.configSegment.maxValue = swap ? 73.54 : 48;
    }
    this.configSegment.maxValue += this.configHeader.maxValue;
  }

  updateUpper() {
    if (this.upperlimit && new Date(this.upperlimit) < new Date(this.customFilterDate)) {
      this.upperlimit = null;
    }
  }

  async update(customFilter: boolean = false) {
    if (this.filterDate || customFilter) {
      const filter = this.filterDate || new Date(this.customFilterDate);
      const loading = await this.loadCtl.create({
        backdropDismiss: false
      });
      const upperLimit = customFilter ? this.upperlimit : null;
      loading.present();
      this.lab.getAllLabExamByPatient(this.patient, filter, upperLimit)
        .pipe(finalize(() => loading.dismiss()))
        .subscribe(data => {
          this.labExamResult = this.lab.calculateSystemBound(data);
          this.updateTmp.lastRecord = this.calculateLastRecord(); // update last record
          const currentCount = this.labExamResult.data
            .filter(x => !x.key.isCalculated)
            .map(x => x.value.map(y => y.length).length)
            .reduce((p, c) => p + c, 0);
          this.updateTmp.calculatedDif = currentCount - this.originalCalculatedCount;
          this.updateChart();
          if (this.table) {
            this.table.renderRows();
          }

        });
    }
  }

  updateChart() {
    this.chartdata = [];
    this.labExamResult.data.forEach(item => {
      const series = [];
      const limits = this.lab.getLimits(item.key, this.patient);
      this.labExamResult.columns.forEach((date, i) => {
        item.value[i].forEach((v, index) => {
          series.push({
            name: new Date(v.entryTime), // formatDate(date, 'dd-MM-yyyy', this.locale),
            value: v.labValue,
            min: limits.lower || '',
            max: limits.upper || '',
            data: v
          });
        });
      });

      const line = {
        name: item.key.name,
        series
      };

      this.chartdata.push(line);
    });
  }

  checkLimit(labItem: LabItem, value: number): number {
    if (!value) {
      return 0;
    }

    const limits = this.lab.getLimits(labItem, this.patient);

    if (limits.lower && value < limits.lower) {
      return -1;
    }
    if (limits.upper && value > limits.upper) {
      return 1;
    }

    return 0;
  }

  excel() {
    this.excelService.exportLabAsExcelFile(this.patient, this.labExamResult);
  }

  async newLabExam() {
    const params = { patient: this.patient };
    const result = await pushOrModal(AddLabExamPage, params, this.modal);
    if (result) {
      const list = this.updateTmp.newList as LabExamInfo[];
      this.updateTmp.newList = [ ...list, ...result ];

      this.lab.setTmp(this.updateTmp);

      this.update(true);
    }
  }

  async detail(item: LabItem, value: LabExamInfo) {
    const params = { patient: this.patient, item, value, isModal: true };
    const result = await pushOrModal(LabExamDetailPage, params, this.modal);

    if (result) {
      if (!result.id) {
        const newList = this.updateTmp.newList as LabExamInfo[];

        const newIndex = newList.findIndex(x => x.id === value.id);

        if (newIndex < 0) {
          this.updateTmp.deleted += 1;
        }
        else {
          newList.splice(newIndex, 1);
        }
      }
      this.lab.setTmp(this.updateTmp);
      this.update(true);

    }
  }

  calculateLastRecord(): Date {
    let lastRecord: Date;
    this.labExamResult.data.forEach(v => {
      if (v.key.isCalculated) { return; }
      const entryTime = v.value[0][v.value[0].length - 1]?.entryTime;
      if (!entryTime) { return; }
      if (!lastRecord || new Date(entryTime) > lastRecord) {
        lastRecord = new Date(entryTime);
      }
    });

    return lastRecord;
  }

  async detailMulti(e, item: LabItem, values: LabExamInfo[]) {
    const popup = await this.popoverCtl.create({
      showBackdrop: false,
      backdropDismiss: true,
      component: LabPopoverComponent,
      componentProps: { items: values, lab: item },
      event: e
    });

    popup.present();
    const result = await popup.onWillDismiss();
    if (result.role === 'OK') {
      this.detail(item, result.data);
    }
  }

  onSelectChart(event) {
    const labInfo = event.data as LabExamInfo;
    if (!labInfo) { return; }
    this.detail(labInfo.labItem, labInfo);
  }

}
