import { HemoSetting } from './../../dialysis/hemo-setting';
import { AdmissionService } from './../admission.service';
import { NotificationService } from './../../share/Notification/notification.service';
import { ModalService } from 'src/app/share/service/modal.service';
import { DialysisInfoComponent } from './../../dialysis/components/dialysis-info/dialysis-info.component';
import { AuthService } from './../../auth/auth.service';
import { RecordComponent } from './../../dialysis/components/record/record.component';
import { DoctorRecordInfo } from './../../dialysis/doctor-record';
import { Component, EventEmitter, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonRouterOutlet, PopoverController, ViewWillEnter } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from 'src/app/auth/user.service';
import { AssessmentGroupInfo, AssessmentInfo, AssessmentItem } from 'src/app/dialysis/assessment';
import { AssessmentService } from 'src/app/dialysis/assessment.service';
import { AssessmentComponent } from 'src/app/dialysis/components/assessment/assessment.component';
import { DialysisRecordInfo } from 'src/app/dialysis/dialysis-record';
import { ExecutionRecord } from 'src/app/dialysis/execution-record';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { HemosheetInfo } from 'src/app/dialysis/hemosheet-info';
import { NurseRecordInfo } from 'src/app/dialysis/nurse-record';
import { RecordService } from 'src/app/dialysis/record.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Medicine } from 'src/app/masterdata/medicine';
import { deepCopy, getName } from 'src/app/utils';
import { Patient } from '../patient';
import { PatientMenuComponent } from '../patient-menu/patient-menu.component';
import { PatientService } from '../patient.service';
import { compareDesc } from 'date-fns';
import { AuditService } from 'src/app/share/service/audit.service';
import { DialysisPrescriptionListPage } from 'src/app/dialysis/dialysis-prescription-list/dialysis-prescription-list.page';
import { MedicinePrescriptionListPage } from '../medicine-prescription-list/medicine-prescription-list.page';
import { AdmissionInfo } from '../admission';
import { MedHistoryService } from '../med-history.service';
import { MedOverview } from '../med-history';
import { lowerCaseKeys, normalizeDateFromMsgPack } from 'src/app/utils-with-date';
import { PatientViewInfo } from '../patient-info';
import { ProgressNoteInfo } from 'src/app/dialysis/progress-note';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.page.html',
  styleUrls: ['./patient-detail.page.scss'],
})
export class PatientDetailPage implements OnInit, OnDestroy, ViewWillEnter {
  patient: Patient;
  hemosheet: HemosheetInfo;
  hemosheetChange = new EventEmitter<HemosheetInfo>();

  admit: AdmissionInfo;
  admitChange = new EventEmitter<AdmissionInfo>();

  medOverview: MedOverview;
  medOverviewChange = new EventEmitter<MedOverview>();

  assessmentGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  assessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  assessItems: AssessmentItem[] = [];
  dialysisRecords: DialysisRecordInfo[] = [];
  machineRecords: DialysisRecordInfo[] = [];
  nurseRecords: NurseRecordInfo[] = [];
  doctorRecords: DoctorRecordInfo[] = [];
  executionRecords: ExecutionRecord[] = [];
  progressNotes: ProgressNoteInfo[] = [];

  medicineList: Medicine[];
  doctorName: string;

  // calculated
  thisMonth: number;
  total: number;

  tabList = [
    {
      name: 'basic',
      display: 'Basic Info',
      shortDisplay: 'Info',
      icon: 'idcard'
    },
    {
      name: 'overview',
      display: 'Dialysis Overview',
      shortDisplay: 'Overview',
      icon: 'hemodialyser-outline'
    },
    {
      name: 'assessment',
      display: 'Assessment',
      icon: 'checkbox-outline'
    },
    {
      name: 'record',
      display: 'Records',
      icon: 'reader-outline'
    }
  ];
  tab: string;

  // ----- special auto commands ---------
  private gotoRecordTab: boolean;
  private openMed: boolean;
  private openPres: boolean;
  notiSignal: Subscription;
  // ------------------------------
  isPN: boolean;
  setting: HemoSetting.All;

  clearBtnClick: EventEmitter<any> = new EventEmitter();
  monitorInterval: NodeJS.Timeout;

  @ViewChild('sheetInfo', { read: DialysisInfoComponent }) sheetInfo: DialysisInfoComponent;
  @ViewChild('assessCom', { read: AssessmentComponent }) assessCom: AssessmentComponent;
  @ViewChild('recordCom', { read: RecordComponent }) recordCom: RecordComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private modal: ModalService,
    private auth: AuthService,
    private assessmentService: AssessmentService,
    private userService: UserService,
    private patientService: PatientService,
    private admission: AdmissionService,
    private hemoService: HemoDialysisService,
    private recordService: RecordService,
    private medService: MedHistoryService,
    private noti: NotificationService,
    private audit: AuditService,
    private master: MasterdataService,
    private popoverController: PopoverController,
    private routerOutlet: IonRouterOutlet,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.patient = this.activatedRoute.snapshot.data.patient;
    this.isPN = this.auth.currentUser.isPN && !this.auth.currentUser.isAdmin;

    this.master.getMedicineList().subscribe(data => this.medicineList = data);

    this.admission.getActiveAdmit(this.patient.id)
    .subscribe((admit) => {
      this.admit = admit;
    });
    this.hemoService.getPatientHemosheet(this.patient.id)
    .subscribe((hemosheet) => {
      this.hemosheet = hemosheet;
      console.log(this.hemosheet);
      if (this.hemosheet) {
        // init data
        this.assessmentService.getItems(this.hemosheet).subscribe(data => this.assessItems = data);
        this.recordService.getDialysisRecords(this.hemosheet).subscribe(data => {
          this.dialysisRecords = data.filter(x => !x.isFromMachine);
          this.machineRecords = data.filter(x => x.isFromMachine);
          
          if (this.recordCom) {
            this.cdr.detectChanges();
            
            this.recordCom.initDialysisRecord();
            this.recordCom.initMachineRecord();
          }
        });
        this.recordService.getNurseRecords(this.hemosheet).subscribe(data => this.nurseRecords = data);
        this.recordService.getDoctorRecords(this.hemosheet).subscribe(data => this.doctorRecords = data);
        this.recordService.getExecutionRecords(this.hemosheet).subscribe(data => this.executionRecords = data);
        this.recordService.getProgressNoteRecords(this.hemosheet).subscribe(data => this.progressNotes = data);

        // update data (mainly from hemosheet view)
        this.assessmentService.assessmentUpdate.subscribe(data => {
          this.assessItems = deepCopy(data);
          if (this.assessCom) {
            this.assessCom.rerender();
          }
        });
        this.recordService.dialysisRecordUpdate.subscribe(data => {
          this.dialysisRecords = deepCopy(data);
        });
        this.recordService.nurseRecordUpdate.subscribe(data => {
          this.nurseRecords = deepCopy(data);
        });
        this.recordService.progressNotesUpdate.subscribe(data => {
          this.progressNotes = deepCopy(data);
        });
        this.recordService.doctorRecordUpdate.subscribe(data => {
          this.doctorRecords = data;
        });
        this.recordService.executionRecordUpdate.subscribe(data => {
          this.executionRecords = data;
        });

        this.monitorRecords();
        
        this.activatedRoute.queryParamMap.subscribe(params => {
          console.log('param check...');
          this.gotoRecordTab = params.get('goToRecordTab') === 'true' || params.get('goToRecordTab') === '1';
          
          if (this.gotoRecordTab) {
            console.log('go to record tab');
            setTimeout(() => {
              this.tab = 'record';

              this.cdr.detectChanges();
              this.recordCom.refreshRecordTableUI();
            }, 50);
          }
        });
        this.hemoService.getSetting().subscribe((data) => this.setting = data);
      }
    });
    this.activatedRoute.queryParamMap.subscribe(params => {
      console.log('param check...');
      this.openMed = params.get('med') === 'true' || params.get('med') === '1';
      this.openPres = params.get('pres') === 'true' || params.get('pres') === '1';
    });
    this.assessmentService.getAllGroups().subscribe((data) => this.assessmentGroups.next(data));
    this.assessmentService.getAll().subscribe((data) => this.assessments.next(data));
    // update hemo
    this.hemosheetChange.subscribe((data) => {
      console.log('current hemosheet has been updated');
      const newHemo = this.hemosheet == null || undefined;
      this.hemosheet = data;
      if (newHemo) {
        this.assessmentService.getItems(this.hemosheet).subscribe(items => this.assessItems = items);
        this.dialysisRecords = [];
        this.machineRecords = [];
        this.monitorRecords();
        this.hemoService.getSetting().subscribe((data) => this.setting = data);
      }
      else {
        this.sheetInfo?.update(this.hemosheet);
      }

      if (!data) {
        clearInterval(this.monitorInterval);
      }
    });
    // med history
    this.medService.getMedOverview(this.patient).subscribe(data => {
      this.medOverview = data;
    });
    // admission
    this.admitChange.subscribe(data => {
      this.admit = data;
    });
    this.userService.onUserUpdate.subscribe(info =>  {
      const user = info.data;
      if (user.isDoctor && user.id === this.patient.doctorId) {
        if (info.type === 'edit') {
          this.doctorName = getName(user);
        }
        else {
          this.doctorName = '';
        }
      }
    });
  }

  monitorRecords() {
    // update data from machine and record list every 30 seconds
    this.monitorInterval = setInterval(() => {
      this.updateRecords();
    }, 30000);
  }

  updateRecords() {
    if (!this.hemosheet) {
      clearInterval(this.monitorInterval);
      return;
    }
    const lastMachineAccess = this.machineRecords[0]?.timestamp;
    const lastAccess = this.dialysisRecords[0]?.timestamp;
    this.recordService.getDialysisRecordUpdate(this.hemosheet, lastAccess ? new Date(lastAccess) : null, lastMachineAccess ? new Date(lastMachineAccess): null)
      .subscribe(data => {
        data.forEach(x => x.type = 'dialysis');
        this.recordCom?.checkBP(data);
        this.machineRecords = this.machineRecords.concat(data.filter(x => x.isFromMachine)).sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
        this.dialysisRecords = this.dialysisRecords.concat(data.filter(x => !x.isFromMachine)).sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
      });
  }

  ngOnDestroy() {
    clearInterval(this.monitorInterval);
    this.notiSignal?.unsubscribe();
  }

  async ionViewWillEnter(): Promise<void> {
    if (!this.doctorName && this.patient.doctorId) {
      this.updateDoctorName();
    }

    if (this.hemosheet?.completedTime) {
      this.hemosheet = null;
      (this.patient as PatientViewInfo).isInSession = false;
    }
    // Update patient
    const data = this.patientService.getTmp();
    if (data) {
      this.patient = data;

      const calculated = await this.hemoService.calculateTreatmentCount(this.patient);
      this.thisMonth = calculated[0];
      this.total = calculated[1];
    }
    // Update hemosheet
    const hemo = this.hemoService.getTmpHemosheet();
    if (hemo) {
      this.hemosheet = hemo;

      // reset view if hemosheet has been completed
      if (this.hemosheet.completedTime) {
        this.hemosheet = null;
      }
      else {
        this.sheetInfo?.update(this.hemosheet);
      }
    }

    if (this.hemosheet && this.gotoRecordTab) {
      const tmp = this.recordService.getTmp() as DialysisRecordInfo;
      if (tmp) {
        console.log('update record list...')
        const record = lowerCaseKeys(normalizeDateFromMsgPack(tmp)) as DialysisRecordInfo;
        record.type = 'dialysis';
        console.log(record);
        this.dialysisRecords.unshift(record);
        const machine = Object.assign({}, record);
        machine.isFromMachine = true;
        machine.createdBy = null;
        machine.updatedBy = null;
        this.machineRecords.unshift(machine);
      }
    }

    this.notiSignal = this.noti.onActionSignal.subscribe(info => {
      if (info.target === 'patient' && info.params?.id === this.patient.id) {
        this.openMed = info.params.med;
        this.openPres = info.params.pres;
        this.specialCommand();
      }
    });

  }

  async ionViewDidEnter(){
    this.specialCommand();
  }

  private specialCommand() {
    if (this.openMed) {
      this.modal.openModal(MedicinePrescriptionListPage, {
        patient: this.patient
      });
    }
    else if (this.openPres) {
      this.modal.openModal(DialysisPrescriptionListPage, {
        patient: this.patient,
        hemosheet: this.hemosheet,
        hemosheetChange: this.hemosheetChange,
        
      });
    }
  }

  ionViewWillLeave(): void {
    // do not delete (for segment tabs)

    this.notiSignal?.unsubscribe();
  }

  async updateDoctorName() {
    console.log('update doctor name.');
    this.doctorName = await this.audit.getAuditFullName(this.patient.doctorId).toPromise();
  }

  async openMenu(ev: any) {

    const update = new EventEmitter<[number, number]>();
    update.subscribe((data) => this.updateCalculation(data));

    const popover = await this.popoverController.create({
      component: PatientMenuComponent,
      event: ev,
      cssClass: 'pop-main-menu',
      showBackdrop: false,
      componentProps: {
        patient: this.patient,
        hemosheet: this.hemosheet,
        hemosheetChange: this.hemosheetChange,
        onCalculated: update,
        admit: this.admit,
        admitChange: this.admitChange,
        medOverview: this.medOverview,
        medOverviewChange: this.medOverviewChange,
        outlet: this.routerOutlet
      }
    });

    return await popover.present();
  }

  updateCalculation([thisMonth, total]: [number, number]) {
    this.thisMonth = thisMonth;
    this.total = total;
  }

  get disableTab(): (s: string) => boolean {
    return (s: string) => {
      switch (s) {
        case 'assessment':
        case 'record':
          return !this.hemosheet;
        default:
          return false;
      }
    };
  }

}
