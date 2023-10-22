import { HemoSetting } from './../hemo-setting';
import { PageLoaderComponent } from './../../share/components/page-loader/page-loader.component';
import { AuthService } from './../../auth/auth.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonNav, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/patients/patient';
import { PageView } from 'src/app/share/page-view';
import { HemoDialysisService } from '../hemo-dialysis.service';
import { Hemosheet } from '../hemosheet';
import { HemosheetViewPage } from '../hemosheet-view/hemosheet-view.page';
import { Permissions } from 'src/app/enums/Permissions';
import { isAfter, parseISO, set, addDays, format, addMonths, setDate, addYears } from 'date-fns';
import lastDayOfMonth from 'date-fns/lastDayOfMonth';
import { HemosheetInfo } from '../hemosheet-info';
import { PatientViewInfo } from 'src/app/patients/patient-info';
import { pushOrModal } from 'src/app/utils';
import { ModalService } from 'src/app/share/service/modal.service';

@Component({
  selector: 'app-hemosheet-list',
  templateUrl: './hemosheet-list.page.html',
  styleUrls: ['./hemosheet-list.page.scss']
})
export class HemosheetListPage implements OnInit {
  @Input() patient: Patient;
  @Input() hemosheet: HemosheetInfo;
  @Output() hemosheetChange = new EventEmitter<HemosheetInfo>();

  @Output() onCalculated = new EventEmitter<[number, number]>();

  recordList: HemosheetInfo[] = [];
  filterMode = 'bf';
  range = 'D';
  rangeList = [
    { n: 'Day', v: 'D' },
    { n: 'Month', v: 'M' },
    { n: '3 Months', v: '3M' },
    { n: '1 Year', v: 'Y' },
    { n: 'Custom', v: null }
  ];
  before: string;
  after: string;

  maxDate: string;

  today: Date;
  firstLoad = true;

  updating: HemosheetInfo;
  canEdit: boolean;
  setting: HemoSetting.All; // cache

  get isRangeMode() { return this.filterMode === 'r'; }
  get beforeFormat(): string {
    const duration = this.CheckDuration(this.range ?? 'D');
    if (duration === 'D') {
      return 'MMM d, YYYY';
    }
    else if (duration === 'M') {
      return 'MMM, YYYY';
    }
    else {
      return 'YYYY';
    }
  }
  get beforePresentation(): string {
    const duration = this.CheckDuration(this.range ?? 'D');
    if (duration === 'D') {
      return 'date';
    }
    else if (duration === 'M') {
      return 'month-year';
    }
    else {
      return 'year';
    }
  }

  @ViewChild('loader') loader: PageLoaderComponent<any>;

  constructor(
    private modal: ModalController,
    private hemoService: HemoDialysisService,
    private nav: IonNav,
    private auth: AuthService,
    private modalService: ModalService) { }

  ngOnInit() {

    this.today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.NotDoctor);

    this.maxDate = addDays(this.today, 1).toISOString();

    this.hemoService.getSetting().subscribe(data => this.setting = data);
  }

  close() {
    this.modal.dismiss();
  }

  resetFilter() {
    this.filterMode = 'bf';
    this.before = undefined;
    this.after = undefined;
    this.range = 'D';

    this.loader.filter = null;
    this.loader.reload(true);
  }

  onFilter() {

    if (!this.before) {
      return;
    }

    let filter = '';
    if (this.filterMode === 'bf') {
      filter = `date < ${format(new Date(this.before), 'dd MMM yyyy')}`;
    }
    else {
      // safe guard
      if (isAfter(parseISO(this.after), parseISO(this.before))) {
        this.after = this.before;
      }

      if (!this.range) {
        if (!this.after) {
          return;
        }
        filter = `date > ${format(addDays(new Date(this.after), -1), 'dd MMM yyyy')} & date < ${format(addDays(new Date(this.before), 1), 'dd MMM yyyy')}`;
      }
      else {
        filter = this.handleFilterRange();
      }
    }

    if (this.loader.filter !== filter) {
      this.loader.filter = filter;
      this.loader.reload(true);
    }
  }

  private handleFilterRange() {
    let filter: string;
    const range = this.range[this.range.length - 1];
    switch (range) {
      case 'D': // assume only 1 day option
        filter = `date = ${format(new Date(this.before), 'dd MMM yyyy')}`;
        break;
      case 'M':
      {
        const duration = this.range.length === 1 ? 1 : +(this.range.substring(0, this.range.length - 1));
        const target = setDate(addMonths(new Date(this.before), 1), 1);
        const limit = lastDayOfMonth(addMonths(target, -duration - 1));
        filter = `date > ${format(limit, 'dd MMM yyyy')} & date < ${format(target, 'dd MMM yyyy')}`;
        break;
      }
      case 'Y':
      {
        const duration = this.range.length === 1 ? 1 : +(this.range.substring(0, this.range.length - 1));
        // Note: month start at index 0, so 0 = Jan, 11 = Dec
        const target = set(new Date(this.before), { month: 11, date: 32, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
        const limit = addDays(addYears(target, -duration), -1);
        filter = `date > ${format(limit, 'dd MMM yyyy')} & date < ${format(target, 'dd MMM yyyy')}`;
        break;
      }
      default:
        throw new Error(`invalid range! [${this.range}]`);
    }

    return filter
  }

  get loadHemosheet$(): (page: number, limit: number, where: string) => Observable<PageView<HemosheetInfo>> {
    return (page, limit, where) => this.hemoService.getHemoSheetList(this.patient.id, page, limit, where);
  }

  ionViewWillEnter() {
    const data = this.hemoService.getTmpHemosheet();
    if (data) {
      if (this.updating) {
        Object.assign(this.updating, data);
      }
    }
    
    this.updating = null;

  }

  async newHemo() {
    const hemo$ = await this.hemoService.AddNewHemosheet(this.patient);
    if (hemo$) {
      hemo$.subscribe((data) => {
        this.updateHemo(data);
        (this.patient as PatientViewInfo).isInSession = true;
      });
    }
  }

  get TodayList() {
    return this.recordList.filter(x => new Date(x.completedTime ?? x.created) >= this.today);
  }

  get HistoryList() {
    return this.recordList.filter(x => new Date(x.completedTime ?? x.created) < this.today);
  }

  get itemClasses() {
    return (item: HemosheetInfo): string[] => {
      const classes = [];
      if (!item.completedTime) {
        classes.push('current');
        if (!item.dialysisPrescription) {
          classes.push('no-prescription');
        }
      }

      return classes;
    };
  }

  async onSelect([item, i, list]: [HemosheetInfo, number, HemosheetInfo[]]) {
    let hemo: Hemosheet;
    if (item instanceof Hemosheet) {
      hemo = item;
    }
    else {
      this.hemoService.setTmpHemosheet(item);
      hemo = this.hemoService.getTmpHemosheet();
      Object.assign(item, hemo);
    }

    let onChange = new EventEmitter<HemosheetInfo>();
    const isCurrent = item.id === this.hemosheet?.id;
    if (isCurrent) {
      onChange = this.hemosheetChange;
    }
    onChange.subscribe((data: Hemosheet) => {
      Object.assign(item, data);
    });
    const result = await pushOrModal(HemosheetViewPage, {
      hemosheet: hemo,
      hemosheetChange: onChange,
      patient: this.patient,
      setting: this.setting,
      isCurrent
    }, this.modalService);
    if (result && typeof result === 'boolean') {
      this.recordList.splice(this.recordList.indexOf(item), 1);
    }
  }

  private async updateHemo(data: HemosheetInfo) {
    this.hemosheet = data;

    this.hemosheetChange.emit(this.hemosheet);
    this.recordList.unshift(this.hemosheet);

    const calculated = await this.hemoService.calculateTreatmentCount(this.patient);
    this.onCalculated.emit(calculated);

  }

  // -----------------------------------

  private CheckDuration(duration: string) {
    const key = duration[duration.length - 1];
    if (key === 'D') {
      return 'D';
    }
    else if (key === 'M') {
      return 'M';
    }
    else {
      return 'Y';
    }
  }

}
