import { mailString } from './../utils';
import { PageLoaderComponent } from './../share/components/page-loader/page-loader.component';
import { Patient } from 'src/app/patients/patient';
import { LabOverviewList } from './lab-overview-list';
import { LabService } from './lab.service';
import { MasterdataService } from './../masterdata/masterdata.service';
import { AuthService } from './../auth/auth.service';
import { PatientService } from './../patients/patient.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LabOverview } from './lab-overview';
import { LabExamInfo } from './lab-exam';

@Component({
  selector: 'app-lab-exam',
  templateUrl: './lab-exam.page.html',
  styleUrls: ['./lab-exam.page.scss'],
})
export class LabExamPage implements OnInit {

  patientLabOverviews: LabOverview[] = [];
  //doctorList: User[];
  unitList: Data[];

  multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;
  firstLoad = true;

  get showAds(): boolean { return this.auth.ExpiredMode && !this.isAdsClosed; }
  isAdsClosed = false;
  mailString = mailString;

  searchString: string;
  @ViewChild("loader") loader: PageLoaderComponent<LabOverview>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private auth: AuthService,
    private master: MasterdataService,
    private labService: LabService) { }

  ngOnInit() {
    this.master.getUnitList().subscribe((data) => this.unitList = data);
  }

  detail(l: LabOverview) {
    this.patientService.setTmp(l.patient as Patient);
    this.router.navigate([encodeURIComponent(l.patient.id)], {relativeTo: this.route});
  }

  get loadPatientLabs$(): (page: number, limit: number, where?: string) => Observable<LabOverviewList> {
    return (page, limit, where) => this.labService.getLabOverviewForAllPatient(page, limit, null, where);
    //.pipe(tap(x => console.log(x)));
  }

  getUnit(id: number): string {
    return this.unitList?.find(x => x.id === id).name;
  }

  onSearch(v) {
    this.searchString = v;
    this.loader.filter = this.searchString;
    this.loader.reload(true);
  }

  ionViewWillEnter() {
    
    let update = this.labService.getTmp();
    //console.log("update: ", update);
    if (update) {
      // update from add lab exam page / lab detail page
      const patientId = update.patient.id;
      const newList = update.newList as LabExamInfo[];
      
      let patientLab = this.patientLabOverviews.find(x => x.patient.id == patientId);
      if (patientLab) {
        patientLab.total += newList.length - update.deleted + update.calculatedDif;
        patientLab.lastRecord = update.lastRecord;
      }
    }
  }

  closeAds() {
    this.isAdsClosed = true;
  }

}
