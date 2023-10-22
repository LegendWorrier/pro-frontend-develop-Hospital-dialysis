import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Patient } from '../patient';
import { HemosheetNoteInfo } from 'src/app/dialysis/hemosheet-note-info';
import { PageLoaderComponent } from 'src/app/share/components/page-loader/page-loader.component';
import { IonNav, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { addDays, addMonths, format, lastDayOfMonth, set, setDate } from 'date-fns';
import { HemoSetting } from 'src/app/dialysis/hemo-setting';
import { Permissions } from 'src/app/enums/Permissions';
import { Observable } from 'rxjs';
import { PageView } from 'src/app/share/page-view';
import { HemoNotePage } from './hemo-note/hemo-note.page';
import { ReportsPage } from 'src/app/reports/reports.page';
import { Hemosheet } from 'src/app/dialysis/hemosheet';

@Component({
  selector: 'app-dialysis-summary-list',
  templateUrl: './dialysis-summary-list.page.html',
  styleUrls: ['./dialysis-summary-list.page.scss'],
})
export class DialysisSummaryListPage implements OnInit {
  @Input() patient: Patient;

  recordList: HemosheetNoteInfo[] = [];

  maxDate: string;
  selectedMonth: string;

  today: Date;
  firstLoad = true;

  updating: HemosheetNoteInfo;
  canEdit: boolean;
  setting: HemoSetting.All; // cache

  @ViewChild('loader', { static: true }) loader: PageLoaderComponent<any>;
  constructor(
    private hemoService: HemoDialysisService,
    private nav: IonNav,
    private navCtl: NavController,
    private auth: AuthService) { }

  ngOnInit() {
    this.today = set(new Date(), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.NotDoctor);

    this.maxDate = addDays(this.today, 1).toISOString();

    this.hemoService.getSetting().subscribe(data => this.setting = data);

    this.selectedMonth = new Date().toISOString();
    let filter = this.getFilter();
    this.loader.filter = filter;
  }

  private getFilter() {
    let filter = '';
    
    const target = setDate(addMonths(new Date(this.selectedMonth), 1), 1);
    const limit = lastDayOfMonth(addMonths(target, - 2));
    filter = `date > ${format(limit, 'dd MMM yyyy')} & date < ${format(target, 'dd MMM yyyy')}`;
    return filter;
  }

  onFilter() {
    console.log('filter changed')
    let filter = this.getFilter();
    console.log(filter);

    if (this.loader.filter !== filter) {
      this.loader.filter = filter;
      this.loader.reload(true);
    }
  }

  get loadHemosheet$(): (page: number, limit: number, where: string) => Observable<PageView<HemosheetNoteInfo>> {
    return (page, limit, where) => this.hemoService.getAllHemoRecordsWithNote(this.patient.id, page, limit, null, where);
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

  async onSelect([item, i, list]: [HemosheetNoteInfo, number, HemosheetNoteInfo[]]) {
    
    await this.nav.push(HemoNotePage,
      {
        hemoNote: item,
        patient: this.patient,
        setting: this.setting,
      });
  }

  openReport() {
    const month = format(new Date(this.selectedMonth), 'MM-yyyy');
    this.nav.push(ReportsPage, {
      isModal: true,
      pageName: 'Dialysis Summary',
      report: 'hemorecords',
      reportParams: { patientId: this.patient.id, month: month }
    });
  }

}
