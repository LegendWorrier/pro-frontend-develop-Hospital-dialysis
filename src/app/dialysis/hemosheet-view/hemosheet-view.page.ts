import { AuthService } from './../../auth/auth.service';
import { DoctorRecordInfo } from './../doctor-record';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { IonContent, IonNav, ModalController } from '@ionic/angular';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Patient } from 'src/app/patients/patient';
import { AssessmentInfo, AssessmentItem, AssessmentGroupInfo } from '../assessment';
import { AssessmentService } from '../assessment.service';
import { DialysisRecordInfo } from '../dialysis-record';
import { ExecutionRecord } from '../execution-record';
import { Hemosheet } from '../hemosheet';
import { NurseRecordInfo } from '../nurse-record';
import { RecordService } from '../record.service';
import { HemoSetting } from '../hemo-setting';
import { RecordComponent } from '../components/record/record.component';
import { GUID } from 'src/app/share/guid';
import { HemoDialysisService } from '../hemo-dialysis.service';
import { PatientService } from 'src/app/patients/patient.service';
import { ProgressNoteInfo } from '../progress-note';

@Component({
  selector: 'app-hemosheet-view',
  templateUrl: './hemosheet-view.page.html',
  styleUrls: ['./hemosheet-view.page.scss'],
})
export class HemosheetViewPage implements OnInit {
  @Input() patient: Patient;
  @Input() hemosheet: Hemosheet;
  @Output() hemosheetChange = new EventEmitter<Hemosheet>();

  @Input() isCurrent: boolean;
  @Input() setting: HemoSetting.All;

  @Input() cosignApproveMode: boolean;

  // ========== special command ============
  @Input() cmd: string[]
  @Input() hemosheetId: GUID;

  assessmentGroups: BehaviorSubject<AssessmentGroupInfo[]> = new BehaviorSubject<AssessmentGroupInfo[]>(null);
  assessments: BehaviorSubject<AssessmentInfo[]> = new BehaviorSubject<AssessmentInfo[]>(null);
  assessItems: AssessmentItem[] = [];

  dialysisRecords: DialysisRecordInfo[] = [];
  machineRecords: DialysisRecordInfo[] = [];
  nurseRecords: NurseRecordInfo[] = [];
  doctorRecords: DoctorRecordInfo[] = [];
  executionRecords: ExecutionRecord[] = [];
  progressNotes: ProgressNoteInfo[] = [];

  tabList = [
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

  clearBtnClick = new EventEmitter();

  isPN: boolean;

  @ViewChild('record') recordCom: RecordComponent;
  @ViewChild('content') content : IonContent;

  constructor(public nav: IonNav,
              private modal: ModalController,
              private auth: AuthService,
              private assessmentService: AssessmentService,
              private recordService: RecordService,
              private hemoService: HemoDialysisService,
              private patientService: PatientService,
              private cdr: ChangeDetectorRef) { }

  async ngOnInit() {
    this.isPN = !this.auth.currentUser.isAdmin && this.auth.currentUser.isPN;
    
    this.assessmentService.getAllGroups().subscribe((data) => this.assessmentGroups.next(data));
    this.assessmentService.getAll().subscribe((data) => this.assessments.next(data));
    this.assessmentService.getItems(this.hemosheet ?? this.hemosheetId).subscribe((data) => this.assessItems = data);

    this.recordService.getDialysisRecords(this.hemosheet ?? this.hemosheetId).subscribe(data => {
      this.dialysisRecords = data.filter(x => !x.isFromMachine);
      this.machineRecords = data.filter(x => x.isFromMachine);
    });
    this.recordService.getNurseRecords(this.hemosheet ?? this.hemosheetId).subscribe(data => this.nurseRecords = data);
    this.recordService.getDoctorRecords(this.hemosheet ?? this.hemosheetId).subscribe(data => this.doctorRecords = data);
    this.recordService.getExecutionRecords(this.hemosheet ?? this.hemosheetId).subscribe(data => this.executionRecords = data);
    this.recordService.getProgressNoteRecords(this.hemosheet ?? this.hemosheetId).subscribe(data => this.progressNotes = data);
    
    if (this.cmd && this.cmd.find(x => x === 'record')) {
      console.log('go to record tab');
      setTimeout(() => {
        this.tab = 'record';

        this.cdr.detectChanges();
        this.recordCom.refreshRecordTableUI();

        setTimeout(() => {
          if (this.cmd.find(x => x === 'doctor-note')) {
            this.scrollTo('doctor-panel');
          }
        }, 50);
      }, 50);
    }

    if (!this.hemosheet && this.hemosheetId) {
      this.hemosheet = await firstValueFrom(this.hemoService.getHemosheet(this.hemosheetId));
      this.patient = await firstValueFrom(this.patientService.getPatient(this.hemosheet.patientId));
    }
  }

  private scrollTo(element:string) {
    let ele = document.getElementById(element);
    let yOffset = ele.offsetTop;
    while (ele.parentElement && ele.parentElement.nodeName !== 'ION-CONTENT') {
      ele = ele.parentElement;
      yOffset += ele.offsetTop;
    }
    this.content.scrollToPoint(0, yOffset, 250);
  }

  updateAssessment(items: AssessmentItem[]) {
    if (this.isCurrent) {
      this.assessmentService.assessmentUpdate.emit(items);
    }
  }

  updateDialysisRecord(records: DialysisRecordInfo[]) {
    if (this.isCurrent) {
      this.recordService.dialysisRecordUpdate.emit(records);
    }
  }

  updateNurseRecord(records: NurseRecordInfo[]) {
    if (this.isCurrent) {
      this.recordService.nurseRecordUpdate.emit(records);
    }
  }

  updateProgressNotes(records: ProgressNoteInfo[]) {
    if (this.isCurrent) {
      this.recordService.progressNotesUpdate.emit(records);
    }
  }

  updateDoctorRecord(records: DoctorRecordInfo[]) {
    if (this.isCurrent) {
      this.recordService.doctorRecordUpdate.emit(records);
    }
  }

  updateExecutionRecord(records: ExecutionRecord[]) {
    if (this.isCurrent) {
      this.recordService.executionRecordUpdate.emit(records);
    }
  }

  get cosign() {
    if (this.cosignApproveMode) {
      return (result: boolean) => this.modal.dismiss(result, 'ok');
    }

    return null;
  }

}
