import { PatientService } from './../../patients/patient.service';
import { ExcelService } from './../../share/service/excel.service';
import { Platform } from '@ionic/angular';
import { StatService } from './../stat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ScrollHideConfig } from 'src/app/directive/scroll-hide.directive';
import { Column, DataRow, TableResult } from '../table-result';
import { RowSpanComputer, Span } from './row-span-computer';
import { format, isValid, formatISO } from 'date-fns';
import { StatInfo, StatRowInfo, StatType } from './stat-info';
import { PatientInfo } from 'src/app/patients/patient-info';
import { decimalFormat } from 'src/app/utils';
import { DecimalPipe } from '@angular/common';
import { AuthService } from 'src/app/auth/auth.service';
import { Unit } from 'src/app/masterdata/unit';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-stat',
  templateUrl: './stat.page.html',
  styleUrls: ['./stat.page.scss', '../../share/excel-btn.scss'],
})
export class StatPage implements OnInit {

  get width() { return this.plt.width(); }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private auth: AuthService,
    private master: MasterdataService,
    private statService: StatService,
    private excelService: ExcelService,
    private _decimalPipe: DecimalPipe,
    private plt: Platform) { }
  // ---------- shortcuts -----------------
  get durationMode(): string {
    return this.CheckDuration(this.duration);
  }

  get lastDurationMode(): string {
    return this.CheckDuration(this.lastDuration);
  }

  get pointOfTimeFormat(): string {
    if (this.durationMode === 'D') {
      return 'YY MMM d';
    }
    else if (this.durationMode === 'M') {
      return 'YYYY MMM';
    }
    else {
      return 'YYYY';
    }
  }

  get pointOfTimePresentation(): string {
    if (this.durationMode === 'D') {
      return 'date';
    }
    else if (this.durationMode === 'M') {
      return 'month-year';
    }
    else {
      return 'year';
    }
  }

  get dateFormat(): string { return this.plt.width() > 1200 && this.result.columns.length < 15 ? 'MMM d' : 'd'; }
  get decimal(): string { return decimalFormat(); }

  get selectableUnits(): Unit[] {
    return this.auth.currentUser.isPowerAdmin ? 
      [{name: 'All', id: null, headNurse: null },...this.unitList] 
      : this.unitList.filter(x => this.auth.currentUser.units.includes(x.id));
  }
  unitList: Unit[] = [];
  selectedUnit: number;
  multiUnit = false;

  @Input() pageName: string;
  @Input() stat: string;
  @Input() patientId: string;
  @Input() params: {[name: string]: any};

  @Input() custom: boolean = false;

  patientName: string;
  showSideData: boolean = true;

  result: TableResult<any>;
  rowSpans: Array<Span[]>;
  yearColumns: { title: string, span: number }[] = [];
  monthColumns: { id: string, title: string, short: string, span: number }[] = [];

  duration = '10D';
  pointOfTime: string;
  now = true;

  POTDate: Date;
  lastDuration: string;
  maxDate: string;

  durationList = [
    {t: '10 Days', v: '10D'},
    {t: '20 Days', v: '20D'},
    {t: '1 Month', v: 'M'},
    {t: '6 Months', v: '6M'},
    {t: '1 Year', v: 'Y'},
    {t: '2 Years', v: '2Y'},
    {t: '5 Years', v: '5Y'},
    {t: '10 Years', v: '10Y'},
    {t: '20 Years', v: '20Y'}
  ];

  @ViewChild('table', { read: ElementRef }) table: ElementRef<any>;

  private rowSpanComputer = new RowSpanComputer();

  // ------------ UI ------------
  configHeader: ScrollHideConfig = { cssProperty: 'top', maxValue: 185.59, inverse: false };
  configUnitPanel: ScrollHideConfig = { cssProperty: 'top', maxValue: 50, inverse: false };

  async ngOnInit() {
    const state = this.router.getCurrentNavigation()?.extras?.state;

    const current = new Date();
    current.setHours(0, 0, 0, 0);
    this.pointOfTime = this.maxDate = formatISO(current);
    this.multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;
    this.unitList = await this.master.getUnitListFromCache();
    this.selectedUnit = this.selectableUnits[0].id;
    this.route.data.subscribe(async (data) => {
      if (!data) return;

      console.log(data);
      
      this.pageName = data.pageName;
      this.stat = data.stat;
      this.custom = data.custom;

      if (this.custom && state) {
        this.params = { ...state };
        this.stat = this.params['stat'];
        this.pageName = this.params['pageName'];
      }
      else {
        this.params = Object.assign({}, data.params);
      }

      this.route.params.subscribe(async params => {
        for (const key in this.params) {
          if (Object.prototype.hasOwnProperty.call(this.params, key)) {
            const element =  this.params[key] as string;
            if (typeof(element) === 'string' && element.startsWith(':')) {
              const value = params[element.substring(1)];
              this.params[key] = value;
            }
          }
        }

        if (this.custom) {
          const value = params['statName'];
          this.params['statName'] = value;
          this.stat = value;
        }

        if (this.custom && !state) {
          const data = await firstValueFrom(this.statService.getCustomStatList());
          const info = data.find(x => x.name === this.stat);
          this.params = { ...info.extraParams, pageName: info.pageName, excelFileName: info.excelFileName };
          this.pageName = this.params['pageName'];
        }

        if (params.patientId) {
          this.patientId = params.patientId;
          let patientInfo = this.router.getCurrentNavigation()?.extras.state?.patient as PatientInfo;
          if (!patientInfo) {
            patientInfo = await firstValueFrom(this.patientService.getPatient(this.patientId));
          }
          this.patientName = patientInfo.name;
          this.pageName = 'Patient\'s ' + this.pageName + `: ${this.patientName}`;
        }
      });

      this.fetchStat();
    });
  }
  // -----------------------------------

  private CheckDuration(duration: string) {
    if (duration === '10D' || duration === '20D' || duration === 'M') {
      return 'D';
    }
    else if (duration === '6M' || duration === 'Y' || duration === '2Y') {
      return 'M';
    }
    else {
      return 'Y';
    }
  }

  async changeUnit(event) {
    this.selectedUnit = event.detail.value;
  }

  fetchStat() {
    const tmp = this.now ? null : this.POTDate;
    this.lastDuration = this.duration;
    this.statService.getStat(this.stat, this.duration, tmp, this.patientId, this.selectedUnit).subscribe((data) => {
      console.log(data);
      this.result = data;
      this.rowSpans = this.rowSpanComputer.compute(this.result.rows, [ 'infoRef' ]);

      if (isValid(new Date(this.result.columns[0].data))) {
        this.yearColumns = [];
        this.monthColumns = [];
        const years = this.result.columns.groupBy((x: Column) => format(new Date(x.data), 'yyyy'));
        for (const key in years) {
          if (Object.prototype.hasOwnProperty.call(years, key)) {
            const element = years[key];
            this.yearColumns.push({ title: key, span: element.length });
          }
        }

        if (this.lastDurationMode === 'Y') {
          return;
        }

        const months = this.result.columns.groupBy((x: Column) => format(new Date(x.data), 'yyyy MMM'));
        for (const key in months) {
          if (Object.prototype.hasOwnProperty.call(months, key)) {
            const element = months[key];
            const month = new Date(element[0].data);
            this.monthColumns.push({
              id: format(month, 'yyyy MMM'),
              title: format(month, 'MMMM'),
              short: format(month, 'MMM'),
              span: element.length
            });
          }
        }
      }
    });
  }

  getColumns() {
    const info = this.hasInfo() ? [ 'info' ] : [];
    return [ ...info , 'name', ...this.result.columns.map(x => x.title), this.params.mix ? 'mix' : this.params.avg ? 'avg' : 'total'];
  }

  getYearColumns() {
    const mainHeader = this.lastDurationMode === 'Y';
    const info = this.hasInfo() ? [ mainHeader ? 'info' : 'dummy' ] : [];
    return [ ...info , (mainHeader ? 'name' : 'dummy'), ...this.yearColumns.map(x => `H-${x.title}`), mainHeader ? 'total' : 'dummy' ];
  }

  getMonthColumns() {
    const mainHeader = this.lastDurationMode === 'M';
    const info = this.hasInfo() ? [ mainHeader ? 'info' : 'dummy' ] : [];
    return [ ...info , (mainHeader ? 'name' : 'dummy'), ...this.monthColumns.map(x => `H-${x.id}`), mainHeader ? 'total' : 'dummy' ];
  }

  hasInfo() {
    return this.result?.info.length > 0 && !this.params.hideInfo;
  }

  total(row: DataRow<any>) {
    if (typeof row.data[0] !== 'number') {
      return row.data.reduce((sum: number, current: StatInfo) => sum + (current?.count ?? 0), 0);
    }
    return row.data.reduce((a, b) => a + b, 0);
  }

  average(row: DataRow<any>) {
    if (typeof row.data[0] !== 'number') {
      return row.data.reduce((sum: number, current: StatInfo) => sum + (current?.avg ?? 0), 0) / row.data.filter(x => x).length || 0;
    }
    return row.data.reduce((a, b) => a + b, 0) / row.data.filter(x => x).length || 0;
  }

  max(row: DataRow<any>) {
    if (typeof row.data[0] !== 'number') {
      const hasAny = row.data.some(x => x);
      if (!hasAny) {
        return '-';
      }
      if (row.data.some(x => x?.text != null)) {
        const group = row.data.filter(x => x?.text != null).groupBy((x: StatInfo) => x.text);
        return Object.keys(group).reduce((a, b) => group[a].length > group[b].length ? a : b) || '-';
      }
      else {
        return Math.max(...row.data.filter(x => x).map(x => x.count ?? x.avg));
      }
    }
    return Math.max(...row.data);
  }

  min(row: DataRow<any>) {
    if (typeof row.data[0] !== 'number') {
      const hasAny = row.data.some(x => x);
      if (!hasAny) {
        return '-';
      }
      if (row.data.some(x => x?.text)) {
        const group = row.data.filter(x => x?.text).groupBy((x: StatInfo) => x.text);
        return Object.keys(group).reduce((a, b) => group[a].length < group[b].length ? a : b);
      }
      else {
        return Math.min(...row.data.filter(x => x).map(x => x.count ?? x.avg));
      }
    }
    return Math.min(...row.data);
  }

  mix(row: DataRow<StatInfo>) {
    var info = this.result.info[row.infoRef] as StatRowInfo;
    switch (info.type) {
      case StatType.Avg:
        return 'Avg: ' + this._decimalPipe.transform(this.average(row), this.decimal);
      case StatType.Count:
        return 'Total: ' + this.total(row);
      case StatType.Max:
        return 'Most: ' + this.max(row);
      default:
        break;
    }
  }

  isStatInfo() {
    return this.result?.rows.some(x => x.data.some(d => this.getStatInfo(d)));
  }
  getStatInfo(cell: any) {
    if (!cell) {
      return null;
    }
    if (cell.avg != undefined || cell.count != undefined || cell.text != undefined || cell.totalCount != undefined) {
      return cell as StatInfo;
    }

    return null;
  }

  toYesNo(value: any) {
    return value? 'Yes' : 'No';
  }


  update() {
    this.POTDate = new Date(this.pointOfTime);
    if (this.durationMode === 'M') {
      this.POTDate.setDate(1);
    }
    else if (this.durationMode === 'Y') {
      this.POTDate.setDate(1);
      this.POTDate.setMonth(0);
    }
    this.POTDate.setHours(0, 0, 0);

    this.result = null;
    this.fetchStat();
  }

  excel() {
    const title = this.pageName;
    const headers = [
      []
    ];

    const excelName = this.params.excelFileName || this.pageName;
    this.excelService.exportTableAsExcelFile(title, this.params, this.result, this.lastDurationMode, headers, excelName);

  }

}
