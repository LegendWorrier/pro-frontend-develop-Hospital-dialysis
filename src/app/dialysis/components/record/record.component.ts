import { AssessmentGroupInfo, AssessmentInfo } from './../../assessment';
import { HemoSetting } from './../../hemo-setting';
import { WebSocketService } from './../../../share/service/web-socket.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { PopupService } from './../../../share/service/popup.service';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { DoctorRecord } from './../../doctor-record';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { AlertController, IonNav, IonPicker, IonPopover, LoadingController, Platform, PopoverController } from '@ionic/angular';
import compareDesc from 'date-fns/compareDesc';
import { AuthService } from 'src/app/auth/auth.service';
import { PatientInfo } from 'src/app/patients/patient-info';
import { ModalService } from 'src/app/share/service/modal.service';
import { addOrEdit, decimalFormat, pushOrModal, presentToast, ToastType, checkGuidNullOrEmpty, deepCopy } from 'src/app/utils';
import { DialysisRecordInfo } from '../../dialysis-record';
import { DialysisRecordEditPage } from '../../dialysis-record-edit/dialysis-record-edit.page';
import { DoctorRecordInfo } from '../../doctor-record';
import { DoctorRecordEditPage } from '../../doctor-record-edit/doctor-record-edit.page';
import { ExecutionRecord, ExecutionType, MedicineRecord } from '../../execution-record';
import { HemoDialysisService } from '../../hemo-dialysis.service';
import { HemosheetInfo } from '../../hemosheet-info';
import { MedicineRecordViewPage } from '../../medicine-record-view/medicine-record-view.page';
import { NurseRecordInfo } from '../../nurse-record';
import { NurseRecordEditPage } from '../../nurse-record-edit/nurse-record-edit.page';
import { RecordService } from '../../record.service';
import { ExecutionRecordPopupComponent } from './execution-record-popup/execution-record-popup.component';

import { Permissions } from 'src/app/enums/Permissions';
import { finalize } from 'rxjs/operators';
import { DialysisMode } from '../../dialysis-mode';
import { addMinutes, differenceInMinutes } from 'date-fns';
import { formatLocalDateString, lowerCaseKeys, normalizeDateFromMsgPack } from 'src/app/utils-with-date';
import { UsageWays } from 'src/app/masterdata/medicine';
import { MedicinePrescriptionService } from 'src/app/patients/medicine-prescription.service';
import { ProgressNoteInfo } from '../../progress-note';
import { ProgressNoteEditPage } from '../../progress-note-edit/progress-note-edit.page';
import { Feature } from 'src/app/enums/feature';

@Component({
  selector: 'hemo-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit, AfterViewInit {

  get decimal() { return decimalFormat(); }

  get executionType() {
    return ExecutionType;
  }

  get width() { return this.plt.width(); }

  constructor(private plt: Platform,
              private auth: AuthService,
              private modal: ModalService,
              private hemo: HemoDialysisService,
              private recordService: RecordService,
              private medPres: MedicinePrescriptionService,
              private alertCtl: AlertController,
              private popupCtl: PopoverController,
              private popupService: PopupService,
              private websocket: WebSocketService,
              private loadCtl: LoadingController,
              private injector: Injector,
              private cdr: ChangeDetectorRef) { }

  get handleIcon() {
    return this.width < 767 ?
      (this.hideMachine ? 'chevron-down-outline' : 'chevron-up-outline')
      : (this.hideMachine ? 'chevron-up-outline' : 'chevron-down-outline');
  }

  // Delegate
  get deleteFunc() {
    return (item: DialysisRecordInfo | NurseRecordInfo | DoctorRecord | ExecutionRecord) => this.deleteRecord(item);
  }

  hideMachine = true;
  isDoctor: boolean;
  isNurse: boolean;
  isAdmin: boolean;

  hasIntegrated: boolean;

  @Input() patient: PatientInfo;

  @Input() hemosheet: HemosheetInfo;
  @Output() hemosheetChange: EventEmitter<HemosheetInfo> = new EventEmitter<HemosheetInfo>();

  @Input() dialysisRecords: DialysisRecordInfo[] = [];
  @Output() dialysisRecordsChange: EventEmitter<DialysisRecordInfo[]> = new EventEmitter<DialysisRecordInfo[]>();
  @Input() set machineRecords(value: DialysisRecordInfo[]) {
    this.$machineDatasource.next(value);
    this.updateMachineTableHeight();
  }
  @Input() viewMode: boolean;

  @Input() nurseRecords: NurseRecordInfo[] = [];
  @Output() nurseRecordsChange: EventEmitter<NurseRecordInfo[]> = new EventEmitter<NurseRecordInfo[]>();

  @Input() progressNotes: ProgressNoteInfo[] = [];
  @Output() progressNotesChange: EventEmitter<ProgressNoteInfo[]> = new EventEmitter<ProgressNoteInfo[]>();

  @Input() doctorRecords: DoctorRecordInfo[] = [];
  @Output() doctorRecordsChange: EventEmitter<DoctorRecordInfo[]> = new EventEmitter<DoctorRecordInfo[]>();

  @Input() executionRecords: ExecutionRecord[] = [];
  @Output() executionRecordsChange: EventEmitter<ExecutionRecord[]> = new EventEmitter<ExecutionRecord[]>();

  @Input() assessments: Observable<AssessmentInfo[]>;
  @Input() assessmentGroups: Observable<AssessmentGroupInfo[]>;

  @Input() nav: IonNav;
  @Input() hemoSetting: HemoSetting.All;

  private updating: DialysisRecordInfo | NurseRecordInfo | ProgressNoteInfo | DoctorRecord;
  @ViewChild('recordTable') recordTable: MatTable<DialysisRecordInfo>;
  @ViewChild('machineTable') machineTable: MatTable<DialysisRecordInfo>;
  @ViewChild('viewport') viewport: CdkVirtualScrollViewport;

  $machineDatasource = new BehaviorSubject<DialysisRecordInfo[]>([]);
  tableSize = 200;
  rowH = 48;
  headerH = 56;
  odd = false;

  autoFillInterval: number; // minutes
  currentCheck: { timestamp: Date, dia: number, sys: number, still: boolean };

  async ngOnInit() {
    // might add load records logic if no pre-loaded data (but doubt it would be needed)
    this.isDoctor = this.auth.currentUser.checkPermissionLevel(Permissions.DoctorOnly);
    this.isNurse = this.auth.currentUser.checkPermissionLevel(Permissions.NurseOnly);
    this.isAdmin = this.auth.currentUser.isAdmin;
    this.hasIntegrated = Feature.hasFlag(this.auth.Feature, Feature.Integrated);

    setTimeout(() => {
      this.initDialysisRecord();
      this.initMachineRecord();
      this.initNurseRecord();
      this.initProgressNote();
      this.initDoctorRecord();
      this.checkBP(this.dialysisRecords.concat(this.$machineDatasource.value));
    });
  }

  initDialysisRecord() {
    for (const item of this.dialysisRecords) {
      item.type = 'dialysis';
    }
  }

  initMachineRecord() {
    for (const item of this.$machineDatasource.value) {
      item.type = 'dialysis';
    }
  }

  initNurseRecord() {
    for (const item of this.nurseRecords) {
      item.type = 'nurse';
    }
  }

  initProgressNote() {
    for (const item of this.progressNotes) {
      item.type = 'progress';
    }
  }

  initDoctorRecord() {
    for (const item of this.doctorRecords) {
      item.type = 'doctor';
    }
  }

  ngAfterViewInit(): void {
    if (this.viewMode) { return; }
    if (!this.hasIntegrated) { return; }

    setTimeout(() => {
      if (this.$machineDatasource.value.length === 1) {
        console.log('update initial record');
        this.$machineDatasource.next(this.$machineDatasource.value);
      }
    }, 0);
    // update table bg
    this.viewport.renderedRangeStream.subscribe(r => {
      this.odd = (r.start % 2 === 1);
    });
  }

  machinePanelToggle() {
    this.hideMachine = !this.hideMachine;
  }

  refreshRecordTableUI() {
    this.recordTable.renderRows();
    this.machineRecords = this.$machineDatasource.value;
  }
  
  private initBPCheck() {
    if (this.hemoSetting?.basic.autoFillRecord && !this.autoFillInterval) {
      const letter = this.hemoSetting.basic.autoFillRecord.substring(this.hemoSetting.basic.autoFillRecord.length - 1);
      const n = Number.parseInt(this.hemoSetting.basic.autoFillRecord.slice(0, -1));
      switch (letter.toLowerCase()) {
        case 'h':
          this.autoFillInterval = n * 60;
          break;
        case 'm':
          this.autoFillInterval = n;
          break;
        default:
          break;
      }
    }

    if (this.autoFillInterval && !this.currentCheck && (this.dialysisRecords.length + this.$machineDatasource.value.length > 1)) {
      const start = this.$machineDatasource.value.length > 0 ?
        this.$machineDatasource.value[this.$machineDatasource.value.length - 1] :
        this.dialysisRecords[this.dialysisRecords.length - 1];
      this.currentCheck = { timestamp: new Date(start.timestamp), dia: start.bpd, sys: start.bps, still: false };
    }
  }

  checkBP(list: DialysisRecordInfo[]) {
    this.initBPCheck();
    if (!this.autoFillInterval || (this.dialysisRecords.length + this.$machineDatasource.value.length < 2)) {
      return;
    }
    for (let i = list.length-1; i >= 0; i--) {
      const item = list[i];
      if (differenceInMinutes(new Date(item.timestamp), this.currentCheck.timestamp) < this.autoFillInterval) {
        if (this.currentCheck.still && item.bpd === this.currentCheck.dia && item.bps === this.currentCheck.sys) {
          // warn user for the still data
          (item as any).still = true;
        }
      }
      else {
        if (item.bpd === this.currentCheck.dia && item.bps === this.currentCheck.sys) {
          // warn user for the still data
          (item as any).still = true;
        }
        
        this.currentCheck = { timestamp: new Date(item.timestamp), dia: item.bpd, sys: item.bps, still: (item as any).still };
      }
    }
  }

  private updateMachineTableHeight() {
    const maxLength = Math.max(this.$machineDatasource.value.length, this.dialysisRecords.length);
    this.tableSize = Math.min(385, Math.max(200, maxLength * this.rowH + this.headerH + 17.7));
  }

  /**
   * manually get latest current data from machine immediately.
   *
   * @memberof RecordComponent
   */
  async getDataNow() {
    if (!this.websocket.IsConnect) {
      await presentToast(this.injector, {native: true, message: 'The server is disconnected. Please try again later.'});
      return;
    }

    const result = await this.websocket.getData({ patient: this.patient })
      .catch(err => {
        console.log(err.message);
        return null as unknown as DialysisRecordInfo;
      });
    console.log('get data', result);
    if (result) {
      result.type = 'dialysis';
      const record = lowerCaseKeys(normalizeDateFromMsgPack(result)) as DialysisRecordInfo;
      console.log('converted', record);
      this.dialysisRecords.unshift(record);
      const machine = Object.assign({}, record);
      machine.isFromMachine = true;
      machine.createdBy = undefined;
      machine.updatedBy = undefined;
      this.$machineDatasource.value.unshift(machine);

      this.refreshRecordTableUI();
    }
    else {
      await presentToast(this.injector, {
        native: true,
        message: 'The target HemoBox cannot get data from the machine right now. (It may be disconnected, please check the box)',
        type: ToastType.alert
      });
    }
  }

  async addDialysisRecord() {
    const params = { isModal: true, hemoId: this.hemosheet.id, assessments: this.assessments, assessmentGroups: this.assessmentGroups };
    await pushOrModal(DialysisRecordEditPage, params, this.modal)
    .then(data => {
      this.updateOnNewDialysisRecord(data);
    });
  }

  async copyRecord(item: DialysisRecordInfo) {
    const tmp = Object.assign({}, item);
    tmp.id = undefined;
    tmp.createdBy = undefined;
    tmp.isFromMachine = false;

    const newRecord = Object.keys(tmp).reduce((data, key) => {
      const val = tmp[key];
      if (val) { data[key] = val; }
      return data;
    }, {}) as DialysisRecordInfo;

    // immediately save to server
    const call$ = this.recordService.createDialysisRecord(newRecord, false);

    await addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Record copied',
      stay: true,
      isModal: false,
      successCallback: (data: any) => {
        this.updateOnNewDialysisRecord(data);
      }
    });
  }

  updateOnNewDialysisRecord(data) {
    if (data) {
      this.updateDialysis(data.dialysis);
      if (data.nurse) {
        this.updateNurse(data.nurse);
      }

      // update cycle start time
      if (this.dialysisRecords.length === 1) {
        this.updateHemosheet();
      }
      else {
        this.updateMachineTableHeight();
      }
    }
  }

  async addExecutionRecord(event) {
    const onUpdate = new EventEmitter<ExecutionRecord[]>();
    onUpdate.subscribe(data => {
      this.executionRecords = data.concat(this.executionRecords);
      this.executionRecordsChange.emit(this.executionRecords);
    });

    const popup = await this.popupCtl.create({
      id: 'execute-popup',
      component: ExecutionRecordPopupComponent,
      componentProps: { hemosheet: this.hemosheet, patient: this.patient, nav: this.nav, onUpdate },
      showBackdrop: false,
      event,
    });

    await popup.present();
  }

  async executionClick(item: ExecutionRecord, event?) {
    const onExecuted = new EventEmitter();
    onExecuted.subscribe(() => {
      this.refreshExecutionList();
    });
    const onCosignChange = new EventEmitter();
    onCosignChange.subscribe(() => {
      this.refreshExecutionList();
    });
    if (item.type === ExecutionType.Medicine) {
      await pushOrModal(MedicineRecordViewPage, {
        unitId: this.patient.unitId,
        record:  item as MedicineRecord,
        deleteFunc: this.deleteFunc,
        onExecuted,
        onCosignChange
      }, this.modal);
    }
    else if (item.type === ExecutionType.NSSFlush) {
      const menu = [
        {
          display: 'Delete',
          name: 'del',
          disable: !this.canExecute(item)&&!this.isAdmin
        }];
      const result = await this.popupService.openPopupMenu(menu, event);
      if (result === 'del') {
        await this.deleteRecord(item);
      }
    }
    // TODO: add logic for other execution type, if any
  }

  getMedRoute(route: UsageWays) {
    return this.medPres.getRoute(route);
  }

  canExecute(item: ExecutionRecord) {
    return this.recordService.checkCanExecute(item);
  }
  canRequest(item: ExecutionRecord) {
    return !item.coSign && item.isExecuted && item.createdBy === this.auth.currentUser.id;
  }

  refreshExecutionList() {
    this.executionRecords.sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
    this.executionRecordsChange.emit(this.executionRecords);
  }

  async execute(item: ExecutionRecord) {
    const result = await this.recordService.executeWithPromt(item);
    if (result) {
      this.refreshExecutionList();
    }
  }

  async requestCosign(item: ExecutionRecord) {
    const result = await this.recordService.requestCosignPromt(item, this.patient.unitId);
    if (result) {
      this.refreshExecutionList();
    }
  }

  async addNurseRecord() {
    const params = { isModal: true, hemoId: this.hemosheet.id };
    await pushOrModal(NurseRecordEditPage, params, this.modal)
    .then(data => {
      if (data) { this.updateNurse(data); }
    });
  }

  async addProgressNote() {
    const params = { isModal: true, hemoId: this.hemosheet.id, total: this.progressNotes.length };
    await pushOrModal(ProgressNoteEditPage, params, this.modal)
    .then(data => {
      if (data) { this.updateProgressNote(data); }
    });
  }

  async addDoctorNote() {
    const params = { isModal: true, hemoId: this.hemosheet.id };
    await pushOrModal(DoctorRecordEditPage, params, this.modal)
    .then(data => {
      if (data) { this.updateDoctor(data); }
    });
  }

  private updateProgressNote(data: ProgressNoteInfo) {
    data.type = 'progress';
    this.progressNotes.push(data);
    this.progressNotes.sort((a, b) => a.order - b.order);
    this.progressNotesChange.emit(this.progressNotes);
  }
  private updateNurse(data: NurseRecordInfo) {
    data.type = 'nurse';
    this.nurseRecords.push(data);
    this.nurseRecords.sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
    this.nurseRecordsChange.emit(this.nurseRecords);
  }
  private updateDoctor(data: DoctorRecordInfo) {
    data.type = 'doctor';
    this.doctorRecords.push(data);
    this.doctorRecords.sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
    this.doctorRecordsChange.emit(this.doctorRecords);
  }
  private updateDialysis(data: DialysisRecordInfo) {
    data.type = 'dialysis';
    this.dialysisRecords.push(data);
    this.dialysisRecords.sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
    this.dialysisRecordsChange.emit(this.dialysisRecords);
    this.recordTable.renderRows();
    this.cdr.detectChanges();
  }

  async editRecord(row: DialysisRecordInfo | NurseRecordInfo | ProgressNoteInfo | DoctorRecord) {
    this.updating = row;

    console.log('type', row.type);
    let component;
    switch (row.type) {
      case 'dialysis':
        component = DialysisRecordEditPage;
        break;
      case 'nurse':
        component = NurseRecordEditPage;
        break;
      case 'progress':
        component = ProgressNoteEditPage;
        break;
      case 'doctor':
        component = DoctorRecordEditPage;
        break;
      default:
        throw new Error('Invalid component!');
    }

    // in case dialysis record
    let dia: number;
    let sys: number;
    if (row.type === 'dialysis') {
      dia = row.bpd;
      sys = row.bps;
    }

    const params = { isModal: true, record: row, deleteFunc: this.deleteFunc,
      hemoId: this.hemosheet.id, assessments: this.assessments, assessmentGroups: this.assessmentGroups,
      isHD: (this.hemosheet.dialysisPrescription?.mode ?? DialysisMode.HD) === DialysisMode.HD };
    await pushOrModal(component, params, this.modal)
    .then(data => {
      if (data) {
        Object.assign(this.updating, data);

        if (row.type === 'dialysis') {
          if ((this.updating as any).still && dia !== data.bpd && sys !== data.bps) {
            (this.updating as any).still = false;
          }

          this.recordTable.renderRows();
          this.dialysisRecordsChange.emit(this.dialysisRecords);

          // update cycle start time
          if (this.dialysisRecords.length === 1 || this.dialysisRecords.indexOf(data) === 0) {
            this.updateHemosheet();
          }
        }
        else if (row.type === 'nurse') {
          this.nurseRecordsChange.emit(this.nurseRecords);
        }
        else if (row.type === 'doctor') {
          this.doctorRecordsChange.emit(this.doctorRecords);
        }
        else if (row.type === 'progress') {
          this.progressNotesChange.emit(this.progressNotes);
        }
        else {
          // TODO add logic for more type
        }
      }
      else {
        Object.assign(this.updating, this.recordService.getTmp());
      }
      this.updating = null;
    });
  }

  deleteRecord(item: DialysisRecordInfo | NurseRecordInfo | ProgressNoteInfo | DoctorRecord | ExecutionRecord) {
    return new Promise<boolean>(async (resolve) => {
      const alert = await this.alertCtl.create({
        header: 'Confirmation',
        subHeader: 'Delete Confirm',
        message: `Are you sure you want to delete this?`,
        buttons: [
          {text: 'Cancel', handler: () => resolve(false) },
          {text: 'Confirm', role: 'OK', handler: () => {
            const $delete = item.type === 'dialysis' ? this.recordService.deleteDialysisRecord(item) :
                            item.type === 'nurse' ? this.recordService.deleteNurseRecord(item) :
                            item.type === 'doctor' ? this.recordService.deleteDoctorRecord(item) :
                            item.type === 'progress' ? this.recordService.deleteProgressNote(item) :
                            this.recordService.deleteRecord(item);
            $delete.subscribe({
              next: () => {
                if (item.type === 'dialysis') {
                  console.log('clear dialysis record');
                  this.dialysisRecords.splice(this.dialysisRecords.indexOf(item), 1);
                  this.recordTable.renderRows();
                  this.dialysisRecordsChange.emit(this.dialysisRecords);
                }
                else if (item.type === 'nurse') {
                  this.nurseRecords.splice(this.nurseRecords.indexOf(item), 1);
                  this.nurseRecordsChange.emit(this.nurseRecords);
                }
                else if (item.type === 'progress') {
                  this.progressNotes.splice(this.progressNotes.indexOf(item), 1);
                  this.progressNotesChange.emit(this.progressNotes);
                }
                else if (item.type === 'doctor') {
                  this.doctorRecords.splice(this.doctorRecords.indexOf(item), 1);
                  this.doctorRecordsChange.emit(this.doctorRecords);
                }
                else {
                  this.executionRecords.splice(this.executionRecords.indexOf(item), 1);
                  this.executionRecordsChange.emit(this.executionRecords);
                }
                resolve(true);
              }
            });
          }}
        ]
      });
      alert.present();
    });

  }

  id(index, item) {
    return item.id;
  }

  // update cycle start time logic
  updateHemosheet() {
    const original = this.hemosheet.cycleStartTime;
    this.hemosheet.cycleStartTime = this.dialysisRecords[0].timestamp;
    this.hemo.editHemoSheet(this.hemosheet).subscribe({
      next: _ => {
        this.hemosheetChange.emit(this.hemosheet);
      },
      error: err => {
        console.log('failed update hemosheet', err);
        this.hemosheet.cycleStartTime = original;
      }
    });
  }

  isSystemCreated(item: ExecutionRecord) {
    return checkGuidNullOrEmpty(item.createdBy);
  }

  claim(item: ExecutionRecord) {
    (item as any).isClaiming = true;
    
    this.recordService.claim(item.id)
    .pipe(finalize(() => (item as any).isClaiming = undefined))
    .subscribe(
      {
        next: () => {
          item.createdBy = this.auth.currentUser.id;
          item.updatedBy = this.hemosheet.createdBy;
          presentToast(this.injector, {
            header: 'Claimed',
            message: 'You have claimed to be owner of this execution.',
            type: ToastType.success
          });
        },
        error: (e) => {
          presentToast(this.injector, {
            header: 'Failed',
            message: 'Cannot claim this execution. (Perhaps another person has already claimed it?)',
            type: ToastType.alert
          });
        }
      });
  }

  swap(first: ProgressNoteInfo, second: ProgressNoteInfo) {
    if (!second || !first) {
      return;
    }

    const call$ = this.recordService.swapProgressNote(first, second);

    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'swap progress note successful.',
      stay: true,
      isModal: this.viewMode,
      successCallback: () => {
        const list = this.progressNotes;
        const firstIndex = list.findIndex(x => x.id === first.id);
        const secondIndex = list.findIndex(x => x.id === second.id);
        [list[firstIndex], list[secondIndex]] = [list[secondIndex], list[firstIndex]];
      }
    });
  }

  // ====================== Adjust Times =====================

  startTime: string; // Date string
  interval = 30;
  async adjustTimes() {
    const tmpList = deepCopy(this.dialysisRecords) as DialysisRecordInfo[];
    let count = tmpList.length - 1;
    for (let i = 0; i < tmpList.length; i++) {
      const item = tmpList[count];
      item.timestamp = addMinutes(new Date(this.startTime), this.interval * i);
      count--;
    }
    
    const loading = await this.loadCtl.create();
    loading.present();

    forkJoin(tmpList.map(x => this.recordService.updateDialysisRecord(x)))
      .pipe(finalize(() => loading.dismiss()))
      .subscribe(data => {
        this.dialysisRecords = data;
        this.initDialysisRecord();
        this.dialysisRecordsChange.emit(this.dialysisRecords);
      });
  }

  initAdjustData() {
    const target = this.dialysisRecords[this.dialysisRecords.length - 1]?.timestamp;
    if (!target) {
      return;
    }
    this.startTime = formatLocalDateString(new Date(target));
    this.interval = this.readIntervalSetting();
  }

  async selectInterval(intervalSelect: IonPicker) {
    const selected = this.convertIntervalToStr(this.interval);
    const column = await intervalSelect.getColumn('interval');
    column.selectedIndex = column.options.findIndex(x => x.value === selected);
    intervalSelect.isOpen = true;

    const result = await intervalSelect.onWillDismiss();
    if (result.role === 'ok') {
      
      this.interval = this.readInterval(result.data.interval.value);
    }
    intervalSelect.isOpen = false;
  }

  private readIntervalSetting() {
    const data = this.hemoSetting.basic.autoFillRecord;
    if (!data) {
      return 30;
    }
    return this.readInterval(data);
  }

  private readInterval(interval: string) {
    if (!interval) {
      return 0;
    }
    const type = interval.slice(-1);
    const multiply = type === 'h' ? 60 : 1;
    const value = Number.parseInt(interval.slice(0, -1));
    return value * multiply;
  }

  convertIntervalToStr(interval: number) {
    if (interval >= 60) {
      return interval/60 + 'h';
    }
    return interval + 'm';
  }

  intervalOptions = [
    { text: 'every 5 minutes', value: '5m'},
    { text: 'every 10 minutes', value: '10m'},
    { text: 'every 15 minutes', value: '15m'},
    { text: 'every 30 minutes', value: '30m'},
    { text: 'every 45 minutes', value: '45m'},
    { text: 'every 1 hour', value: '1h'}
  ];
  intervalPickerColumn = [
    {
      name: 'interval',
      options: this.intervalOptions
    }
  ];

  intervalButtons = [
    {
      text: 'Confirm',
      role: 'ok'
    },
    {
      text: 'Cancel'
    }
  ]

}
