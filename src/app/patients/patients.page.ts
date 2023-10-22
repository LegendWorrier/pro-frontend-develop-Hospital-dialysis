import { PatientInfo } from 'src/app/patients/patient-info';
import { Platform } from '@ionic/angular';
import { ScheduledPatient, SchedulePatient } from './../schedule/schedule-patient';
import { ScheduleService, ActiveScheduleCache } from './../schedule/schedule.service';
import { mailString } from './../utils';
import { PageLoaderComponent } from './../share/components/page-loader/page-loader.component';

import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { UserService } from '../auth/user.service';
import { Data } from '../masterdata/data';
import { MasterdataService } from '../masterdata/masterdata.service';
import { getName } from '../utils';
import { Patient } from './patient';
import { PatientList } from './patient-list';
import { PatientService } from './patient.service';
import { map, mergeMap, tap } from 'rxjs/operators';
import { AuditService } from '../share/service/audit.service';
import { ScrollHideConfig } from '../directive/scroll-hide.directive';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { GUID } from '../share/guid';
import { UserUtil } from '../auth/user-utils';
import { PatientRules } from './patient-rule';

@Component({
  selector: 'app-patients',
  templateUrl: 'patients.page.html',
  styleUrls: ['patients.page.scss']
})
export class PatientsPage implements OnInit {

  get showAds() { return this.auth.ExpiredMode && !this.isAdsClosed; }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private scheduleService: ScheduleService,
    private auth: AuthService,
    private user: UserService,
    private master: MasterdataService,
    private audit: AuditService,
    private plt: Platform,
    private cdr: ChangeDetectorRef) {

  }
  
  patients: PatientInfo[] = [];
  todayPatients_: PatientInfo[];
  doctorList: User[];
  unitList: Data[];

  multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units?.length > 1;

  get firstLoad() { return this.loader?.firstLoad ?? true; }
  get isLoading() { return this.loader?.isLoading ?? true; }
  get isTotal() { return this.loader?.isTotal ?? false; }
  isAdsClosed = false;
  mailString = mailString;

  searchString: string;
  @ViewChild('loader') loader: PageLoaderComponent<Patient>;

  private crossCount: number;
  schedules: SchedulePatient[];
  isMulti: boolean;

  myPatient: boolean; // my patient mode for doctor
  isDoctor: boolean;
  isPowerAdmin: boolean;
  rule: PatientRules;

  get doctorMode() { return this.myPatient || (!this.isPowerAdmin && this.isDoctor && this.rule?.doctorCanSeeOwnPatientOnly); }

  tabList =  [
    {
      name: 'all',
      display: 'All Patients',
      shortDisplay: 'All',
      icon: 'reorder-four'
    },
    {
      name: 'today',
      display: 'Today Patients',
      shortDisplay: 'Today',
      icon: 'today-outline'
    }];
  tab: string = 'all';
  configSegment: ScrollHideConfig = { cssProperty: 'top', maxValue: 100, initValue: 0, inverse: false };

  async ngOnInit() {
    UserUtil.getDoctorListFromCache(this.user).then((data) => this.doctorList = data);
    this.user.onUserUpdate.subscribe(info =>  {
      const user = info.data;
      if (user.isDoctor) {
        if (info.type === 'edit') {
          const existing = this.doctorList.find(x => x.id === user.id);
          if (existing) {
            Object.assign(existing, user);
          }
        }
        else {
          this.doctorList = this.doctorList.filter(x => x.id !== user.id);
        }
      }
    });
    this.patientService.getRule().subscribe(data => this.rule = data);
    this.isMulti = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;
    this.isDoctor = this.auth.currentUser.isDoctor;
    this.isPowerAdmin = this.auth.currentUser.isPowerAdmin;
    this.initScroll();
    this.loadTodayPatient();
  }

  initScroll() {
    if (this.plt.is('ios')) {
      this.configSegment.maxValue += 51.86;
    }
    
    ScreenOrientation.addListener('screenOrientationChange', () => {
      this.updateSegmentConfig(true);
    });
    this.updateSegmentConfig(false);
  }

  updateSegmentConfig(swap: boolean) {
    if (this.plt.width() <= 576) {
      this.configSegment.maxValue = swap ? 100 : 125.54;
    }
    else {
      this.configSegment.maxValue = swap ? 125.54 : 100;
    }
  }
  
  loadTodayPatient() {
    this.todayPatients_ = null;
    this.scheduleService.getTodayPatient().subscribe({
      next: data => this.todayPatients_ = data,
      error: err => { this.todayPatients_ = []; throw err;}
    });
  }

  get todayPatients() {
    if (!this.todayPatients_) return null;
    var filter = this.patientService.getFilter(this.searchString) ?? (() => true);
    return this.todayPatients_.filter(x => filter(x) && (this.myPatient ? x.doctorId === this.auth.currentUser.id : true));
  }

  get loadPatient$(): (page: number, limit: number, where?: string) => Observable<PatientList> {
    return (page, limit, where) => {
      console.log('(Load patients...)');
      const unitList$ = this.unitList ? of(this.unitList) : from(this.master.getUnitListFromCache()).pipe(tap(data => this.unitList = data));
      return unitList$.pipe(mergeMap((data) => {
        const isPowerAdmin = this.auth.currentUser.isPowerAdmin;
        const units: number[] = isPowerAdmin ? data.map(x => x.id) : this.auth.currentUser.units;

        const force = this.firstLoad;
        const main$ = this.patientService.getAllPatient(page, limit, null, (this.myPatient? this.auth.currentUser.id : null), where);
        const active$ = page === 1 ? units.map(x => this.scheduleService.getActiveScheduleFromCache(x, force)) : [];

        return combineLatest([main$, ...active$])
        .pipe(map((data) => {
          const mainResult = data[0] as PatientList;
          if (page === 1) {
            const schedulesGroup = ([] as SchedulePatient[]).concat(...(data.slice(1) as ActiveScheduleCache[]).map(x => x.schedules))
              .groupBy((x: SchedulePatient) => x.patientId);
            const schedules = Object.keys(schedulesGroup).map(x => schedulesGroup[x][0]);
            console.log(schedules);

            this.schedules = schedules;
            this.crossCount = isPowerAdmin ? 0 : schedules.filter(x => x.overrideUnitId && !units.includes(x.overrideUnitId)).length;

            const filter = this.patientService.getFilter(where) ?? (() => true);
            mainResult.data = this.schedules.filter(x => filter(x.patient)
                && (this.myPatient ? x.patient.doctorId === this.auth.currentUser.id : true))
              .map(x => x.patient)
              .concat(mainResult.data.filter(x => !schedules.some(s => s.patientId === x.id)));
          }
          mainResult.total += this.crossCount;

          return mainResult;
        }));
      }));
    };
  }

  isCross(p: Patient) {
    return !this.auth.currentUser.isPowerAdmin && !this.auth.currentUser.units.includes(p.unitId);
  }

  showUnit(p: ScheduledPatient) {
    const schedule = this.schedules.find(x => x.patientId === p.id);
    const hasOverrideUnit = schedule && schedule.overrideUnitId;
    const isCross = !this.isMulti && hasOverrideUnit && this.auth.currentUser.units[0] !== schedule.overrideUnitId;

    return isCross || this.isMulti;
  }

  detail(p: Patient) {
    this.patientService.setTmp(p);
    this.router.navigate([encodeURIComponent(p.id)], {relativeTo: this.route});
  }

  addPatient() {
    this.router.navigate(['add'], {relativeTo: this.route});
  }

  getName(doctorId: GUID): Observable<string> {
    const doctor = this.doctorList?.find(x => x.id === doctorId);
    if (doctor) {
      return of(getName(doctor));
    }
    return this.audit.getAuditFullName(doctorId);
  }

  getUnit(id: number): string {
    return this.unitList?.find(x => x.id === id).name;
  }

  getCrossUnit(p: ScheduledPatient): string {
    const schedule = this.schedules.find(x => x.patientId === p.id);
    if (!schedule || !schedule.overrideUnitId) {
      return '';
    }
    const unitName = this.getUnit(schedule.overrideUnitId);
    return unitName ? ` ${unitName}` : '';
  }

  async onSearch(v) {
    this.searchString = v;
    this.loader.filter = this.searchString; // this line is required for immediate effect
    await this.loader.reload(true);
  }

  async reload(force?: boolean) {
    if (this.tab === 'all' || force) {
      await this.loader.reload(true);
    }
    if (this.tab === 'today' && !force) {
      this.loadTodayPatient();
    }
  }

  closeAds() {
    this.isAdsClosed = true;
  }

}
