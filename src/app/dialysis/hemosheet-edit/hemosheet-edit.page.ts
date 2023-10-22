import { first } from 'rxjs/operators';
import { ModalSearchListComponent, ModalSearchParams } from './../../share/components/modal-search-list/modal-search-list.component';
import { ModalService } from './../../share/service/modal.service';
import { RecordService } from './../record.service';
import { HemoSetting } from './../hemo-setting';
import { ExecutionRecord } from './../execution-record';
import { formatDate } from '@angular/common';
import { GUID } from 'src/app/share/guid';
import { Component, EventEmitter, Injector, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonSelect, Platform, LoadingController, AlertController, IonNav, ModalController, NavParams, NavController } from '@ionic/angular';
import { differenceInHours, formatISO, compareDesc, compareAsc } from 'date-fns';
import { BehaviorSubject, Observable, forkJoin, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { DehydrationCalculate, HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { Hemosheet } from 'src/app/dialysis/hemosheet';
import { AdmissionType } from 'src/app/enums/admission-type';
import { CatheterType } from 'src/app/enums/catheter-type';
import { Permissions } from 'src/app/enums/Permissions';
import { Postures } from 'src/app/enums/postures';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { ModalBack, addOrEdit, decimalFormat, decimalPattern, deepCopy } from 'src/app/utils';
import { AvShunt } from '../av-shunt';
import { EditAvShuntPage } from '../av-shunt-view/edit-av-shunt/edit-av-shunt.page';
import { AvShuntService } from '../av-shunt.service';
import { DialysisPrescription } from '../dialysis-prescription';
import { DialysisPrescriptionEditPage } from '../dialysis-prescription-edit/dialysis-prescription-edit.page';
import { EditHemosheet } from './edit-hemosheet';
import { DialysisPrescriptionInfo } from '../dialysis-prescription-info';
import { HemosheetInfo, VitalSignRecord } from '../hemosheet-info';
import { DialysisRecordInfo } from '../dialysis-record';
import { DialysisType } from 'src/app/enums/dialysis-type';
import { Ward } from 'src/app/masterdata/ward';
import { formatLocalDateString } from 'src/app/utils-with-date';

@Component({
  selector: 'app-hemosheet-edit',
  templateUrl: './hemosheet-edit.page.html',
  styleUrls: ['./hemosheet-edit.page.scss'],
})
export class HemosheetEditPage implements OnInit {

  constructor(
    private plt: Platform,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private hemo: HemoDialysisService,
    private records: RecordService,
    private avshunt: AvShuntService,
    private modal: ModalService,
    private loadCtl: LoadingController,
    private alertCtl: AlertController,
    private master: MasterdataService,
    private injector: Injector) { }

  get width() {
    return this.plt.width();
  }

  get decimalPattern() {
    return decimalPattern();
  }

  get decimal() {
    return decimalFormat();
  }

  get preWeight() {
    return this.dehydration.preWeight;
  }

  get ufNet() {
    return this.dehydration.ufNet;
  }

  get ufEstimate() {
    return this.dehydration.ufEstimate;
  }

  get postWeight() {
    return this.dehydration.postWeight;
  }

  get actualWeightLoss() {
    return this.dehydration.actualWeightLoss;
  }

  get idwg() {
    return this.dehydration.idwg;
  }

  get targetDryWeight() {
    if (!this.hemosheet.dialysisPrescription) {
      return null;
    }
    return this.hemosheet.dialysisPrescription.temporary ?
    this.hemosheet.dialysisPrescription.excessFluidRemovalAmount :
    this.hemosheet.dialysisPrescription.dryWeight;
  }

  get temporary() {
    if (!this.hemosheet.dialysisPrescription) {
      return false;
    }

    return this.hemosheet.dialysisPrescription.temporary;
  }
  get avProps() { return { patientId: this.hemosheet.patientId }; }
  get avAdded() { return (newAv) => this.avShuntList.next([newAv]); }
  get pProps() { return { isModal: true, patient: { id: this.hemosheet.patientId, unitId: this.patientUnitId }, canEdit: true }; }
  get pAdded() { return (newPres) => this.prescriptionList.next([newPres]); }

  get newDate() {
    return formatISO(new Date());
  }

  get canAutoCalculateFlush() {
    return (this.totalFlush && this.hemosheet.flushTimes)
            || (this.totalFlush && this.hemosheet.flushNSS)
            || (this.hemosheet.flushNSS && this.hemosheet.flushTimes)
            || (this.totalFlush && this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration)
            || (this.hemosheet.flushNSS && this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration);
  }

  hemosheet: EditHemosheet;
  @Input() isModal: boolean;
  @Input() viewMode: boolean;
  @Input() onSave: EventEmitter<HemosheetInfo> = new EventEmitter<HemosheetInfo>();
  /**
   * Used and passed here mainly for calculating when user hit save and complete.
   *
   * @type {ExecutionRecord[]}
   * @memberof HemosheetEditPage
   */
  @Input() executeRecords: ExecutionRecord[];
  /**
   * used and passed here for auxiliary feature (filling BP from existing records)
   *
   * @type {DialysisRecordInfo[]}
   * @memberof HemosheetEditPage
   */
  @Input() dialysisRecords: DialysisRecordInfo[];
  @Input() setting: HemoSetting.All;
  @Input() patientUnitId: number;

  admissionTypes = Object.values(AdmissionType);
  dialysisTypes = Object.keys(DialysisType).filter(key => !isNaN(Number(DialysisType[key]))).map(x => ({ t: x, v: DialysisType[x] }));

  unitList: BehaviorSubject<Data[]> = new BehaviorSubject<Data[]>(null);
  avShuntList: BehaviorSubject<AvShunt[]> = new BehaviorSubject<AvShunt[]>(null);
  prescriptionList: BehaviorSubject<DialysisPrescriptionInfo[]> = new BehaviorSubject<DialysisPrescriptionInfo[]>(null);

  postures = Object.keys(Postures).filter(key => !isNaN(Number(Postures[key]))).map(x => ({ t: x, v: Postures[x] }));

  deletedAvShunts: AvShunt[];
  @ViewChild('avSelect') avSelect: IonSelect;
  @ViewChild('prescSelect') prescriptionSelect: IonSelect;
  @ViewChild('dialysisRecord') dialysisRecordT: TemplateRef<any>;

  @ViewChild(IonContent) content: IonContent;
  error: string;

  isPowerAdmin: boolean;
  hasPermission: boolean;
  newDialyzer: boolean;
  canDelete: boolean;

  maxDate: string;
  dehydration: DehydrationCalculate;

  originalPrescriptionId: GUID;

  isAv = true;
  isPrescriptionAcNotUsed = false;
  customBloodTrans = false;
  customExtraFluid = false;
  customAFillCC = false;
  customVFillCC = false;
  customASize = false;
  customVSize = false;
  hasFlushNSS = false;
  totalFlush: number;

  /**
   * Whether doctor prescription has blood access route AND is 'AV type'
   */
  isPlannedAv?: boolean = undefined;

  acList: Data[] = [];
  needleList: number[] = [];

  private originalStartTime: Date;
  private originalCompleteTime: Date;

  avPage = EditAvShuntPage;

  pPage = DialysisPrescriptionEditPage;

  wards: Data[] = [];

  ngOnInit() {
    if (!this.hemosheet) {
      if (this.isModal) {
        this.hemosheet = Object.assign(new Hemosheet(), deepCopy(this.hemo.getTmpHemosheet())) as EditHemosheet;
        if (this.hemosheet.dialysisPrescription) {
          this.hemosheet.dialysisPrescription = Object.assign(new DialysisPrescription, this.hemosheet.dialysisPrescription);
        }
      }
      else {
        this.hemosheet = this.activatedRoute.snapshot.data.hemosheet;
        this.patientUnitId = this.activatedRoute.snapshot.data.patient.unitId;
      }
    }
    this.saveOriginalTmp();

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.executeRecords) {
      this.executeRecords = navigation.extras.state?.executeRecords;
    }
    if (navigation?.extras.state?.dialysisRecords) {
      this.dialysisRecords = navigation?.extras.state?.dialysisRecords;
    }

    this.originalPrescriptionId = this.hemosheet.dialysisPrescriptionId = this.hemosheet.dialysisPrescription?.id;
    this.dehydration = this.hemo.calculateDehydration(this.hemosheet);
    this.initData();

    const date = new Date();
    this.maxDate = formatISO(date);
    if (!this.setting) {
      this.hemo.getSetting().subscribe(data => this.setting = data);
    }

    // reset ward temporary, re-assign when save
    if (!this.hemosheet.outsideUnit) {
      this.hemosheet.ward = null;
    }
    this.master.getUnitList().subscribe(data =>  {
      const units = data;
      this.unitList.next(units);
    });
    this.master.getAnticoagulantList().subscribe(data => this.acList = data);
    this.master.getNeedleList().subscribe(data => this.needleList = data.map(x => x.number));

    this.isPowerAdmin = this.auth.currentUser.isPowerAdmin;
    this.hasPermission = this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp);
    this.canDelete = this.auth.currentUser.checkPermission('hemosheet-del');

    this.loadAvShuntList();
    this.loadPrescriptionList();
    this.loadWards();
  }

  loadAvShuntList() {
    this.avshunt.getAvShuntList(this.hemosheet.patientId)
    .subscribe(data => {
      this.avShuntList.next(data.filter(x => x.isActive));
      this.deletedAvShunts = data.filter(x => !x.isActive);
      this.initAvShunt();
    });
  }

  loadPrescriptionList() {
    this.hemo.getDialysisPrescriptionList(this.hemosheet.patientId)
    .subscribe(data =>  {
      this.prescriptionList.next(data.filter(x => x.isActive));
    });
  }

  loadWards() {
    forkJoin([this.unitList.asObservable().pipe(first(x => !!x)), 
        this.master.getWardList()])
      .subscribe(value => {
        console.log(value);
        this.wards = value[0].filter(x => x.id !== this.patientUnitId).concat(value[1]);
      });
  }

  onWard(item: Data) {
    if (!item) {
      return;
    }
    this.hemosheet.isICU = (item as Ward).isICU;
  }

  initData() {
    // prefill, for temporary
    if (this.hemosheet.dialysisPrescription && this.hemosheet.dialysisPrescription.temporary && !this.hemosheet.dehydration.ufGoal) {
      this.hemosheet.dehydration.ufGoal = this.hemosheet.dialysisPrescription.excessFluidRemovalAmount;
    }
    if (this.hemosheet.dialysisPrescription && (this.hemosheet.dialysisPrescription as DialysisPrescription).isAcNotUsed) {
      this.isPrescriptionAcNotUsed = true;
    }
    else {
      this.isPrescriptionAcNotUsed = false;
    }
    if (this.hemosheet.dialyzer.useNo === 0) {
      this.hemosheet.dialyzer.useNo = undefined;
      this.newDialyzer = true;
    }
    if (this.hemosheet.dehydration.bloodTransfusion || this.hemosheet.dehydration.bloodTransfusion === 0) {
      this.customBloodTrans = true;
    }
    if (this.hemosheet.dehydration.extraFluid || this.hemosheet.dehydration.extraFluid === 0) {
      this.customExtraFluid = true;
    }
    if (this.hemosheet.avShunt.aSize) {
      this.customASize = true;
    }
    if (this.hemosheet.avShunt.vSize) {
      this.customVSize = true;
    }
    if (this.hemosheet.avShunt.aNeedleCC != undefined) {
      this.customAFillCC = true;
    }
    if (this.hemosheet.avShunt.vNeedleCC != undefined) {
      this.customVFillCC = true;
    }
    if (this.hemosheet.preVitalsign.length === 0) {
      this.hemosheet.preVitalsign.push({ timestamp: this.newDate });
    }
    if (this.hemosheet.postVitalsign.length === 0) {
      this.hemosheet.postVitalsign.push({ timestamp: this.newDate });
    }

    this.isPlannedAv = this.hemosheet.dialysisPrescription?.bloodAccessRoute ? 
                    !!this.hemosheet.dialysisPrescription.bloodAccessRoute.match(/AV/i) : undefined;

    this.hasFlushNSS = this.hemosheet.flushNSS > 0 || this.hemosheet.flushNSSInterval > 0 || this.hemosheet.flushTimes > 0;
    this.totalFlush = this.hemosheet.flushNSS * this.hemosheet.flushTimes;
  }

  calculateFlush() {
    
    if (this.hemosheet.flushNSS && this.hemosheet.flushTimes) {
      this.totalFlush = (this.hemosheet.flushNSS * this.hemosheet.flushTimes).round(2);
      if (!this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration) {
        this.hemosheet.flushNSSInterval = (this.hemosheet.dialysisPrescription?.duration/this.hemosheet.flushTimes).round(2);
      }
    }
    else if (this.hemosheet.flushNSS && this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration) {
      this.hemosheet.flushTimes = (this.hemosheet.dialysisPrescription?.duration / this.hemosheet.flushNSSInterval).round(2);
      this.totalFlush = (this.hemosheet.flushNSS * this.hemosheet.flushTimes).round(2);
    }
    else if (this.totalFlush && this.hemosheet.flushTimes) {
      this.hemosheet.flushNSS = (this.totalFlush/this.hemosheet.flushTimes).round(2);
      if (!this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration) {
        this.hemosheet.flushNSSInterval = (this.hemosheet.dialysisPrescription?.duration/this.hemosheet.flushTimes).round(2);
      }
    }
    else if (this.totalFlush && this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration) {
      this.hemosheet.flushTimes = (this.hemosheet.dialysisPrescription?.duration / this.hemosheet.flushNSSInterval).round(2);
      this.hemosheet.flushNSS = (this.totalFlush/this.hemosheet.flushTimes).round(2);
    }
    else if (this.totalFlush && this.hemosheet.flushNSS) {
      this.hemosheet.flushTimes = (this.totalFlush/this.hemosheet.flushNSS).round(2);
      if (!this.hemosheet.flushNSSInterval && this.hemosheet.dialysisPrescription?.duration) {
        this.hemosheet.flushNSSInterval = (this.hemosheet.dialysisPrescription?.duration / this.hemosheet.flushTimes).round(2);
      }
    }
  }

  saveOriginalTmp() {
    const tmp = Object.assign(new Hemosheet, deepCopy(this.hemosheet)) as Hemosheet;
    if (tmp.dialysisPrescription) {
      tmp.dialysisPrescription = Object.assign(new DialysisPrescription, this.hemosheet.dialysisPrescription);
    }
    this.hemo.setTmpHemosheet(tmp);
    this.originalStartTime = this.hemosheet.cycleStartTime;
    this.originalCompleteTime = this.hemosheet.completedTime;
  }

  updatePrescription() {
    const id = (this.hemosheet as any).dialysisPrescriptionId;
    if (id) {
      const selectedPrescription = this.prescriptionList.value.find(x => x.id === id);
      this.hemosheet.dialysisPrescription = Object.assign(new DialysisPrescription, selectedPrescription);
      this.initData();
    }
  }

  getAVShuntName(item?: AvShunt) {
    if (!item) {
      return undefined;
    }
    return this.avshunt.getAvShuntSiteName(item);
  }

  initAvShunt() {

    if (this.hemosheet.avShunt.avShuntId) {
      let avShunt = this.avShuntList.value.find(x => x.id === this.hemosheet.avShunt.avShuntId);
      // handle deleted
      if (!avShunt) {
        avShunt = this.deletedAvShunts.find(x => x.id === this.hemosheet.avShunt.avShuntId);
        if (!this.hemosheet.avShunt.shuntSite) {
          this.hemosheet.avShunt.shuntSite = this.getAVShuntName(avShunt);
        }
        this.unselectedAvShuntDisplay();
      }

      // handle not updated data
      if (this.avshunt.getAvShuntSiteName(avShunt!) !== this.hemosheet.avShunt.shuntSite) {
        this.unselectedAvShuntDisplay();
      }
      else {
        this.updateAVType(avShunt!.catheterType);
      }
    }
    else {
      this.unselectedAvShuntDisplay();
    }
  }

  async updateAvShunt() {
    if (this.hemosheet.avShunt.avShuntId) {
      const avShunt = this.avShuntList.value.find(x => x.id === this.hemosheet.avShunt.avShuntId);
      this.updateAVType(avShunt!.catheterType);
      this.resetAvShuntDisplay();
    }
  }

  private updateAVType(type?: string) {
    if (!type) {
      // best guess for type
      const guess = this.hemosheet.avShunt.shuntSite!.match(/AV/i);
      this.isAv = !!guess;
    }
    else {
      this.isAv = type === CatheterType.AVFistula || type === CatheterType.AVGraft;
    }
  }

  private unselectedAvShuntDisplay() {
    this.hemosheet.avShunt.avShuntId = null;
    if (this.hemosheet.avShunt.shuntSite) {
      this.avSelect.selectedText = this.hemosheet.avShunt.shuntSite;
      this.updateAVType(); // guess the av type
    }
  }

  private resetAvShuntDisplay() {
    if (this.avSelect.selectedText) {
      this.avSelect.selectedText = null;
    }
  }

  async save() {
    await this.saveChanges(this.hemo.editHemoSheet(this.hemosheet));
  }

  async complete() {
    const complete$ = await this.hemo.getCompleteHemosheetCallWithPrompt(this.hemosheet, this.executeRecords, this.setting);
    if (complete$) {
      await this.saveChanges(complete$);
    }
  }

  private async saveChanges(callToServer$: Observable<any>) {
    // save AV Shunt name
    if (this.hemosheet.avShunt.avShuntId) {
      const avShunt = this.avShuntList.value.find(x => x.id === this.hemosheet.avShunt.avShuntId);
      if (avShunt) {
        this.hemosheet.avShunt.shuntSite = this.avshunt.getAvShuntSiteName(avShunt);
      }
    }
    
    // reset unused data
    if (this.isAv || !this.hemosheet.avShunt.avShuntId) {
      this.hemosheet.avShunt.aNeedleCC = undefined;
      this.hemosheet.avShunt.vNeedleCC = undefined;
      this.hemosheet.avShunt.aLength = undefined;
      this.hemosheet.avShunt.vLength = undefined;
    }
    if (!this.isAv || !this.hemosheet.avShunt.avShuntId) {
      this.hemosheet.avShunt.aSize = undefined;
      this.hemosheet.avShunt.vSize = undefined;
      this.hemosheet.avShunt.aNeedleTimes = undefined;
      this.hemosheet.avShunt.vNeedleTimes = undefined;
    }
    if (!this.hemosheet.dialyzer.useNo || this.newDialyzer) {
      this.newDialyzer = true;
      this.hemosheet.dialyzer.useNo = 0;
      this.hemosheet.dialyzer.tcv = 0;
    }
    if (!this.customBloodTrans) {
      this.hemosheet.dehydration.bloodTransfusion = undefined;
    }
    if (!this.customExtraFluid) {
      this.hemosheet.dehydration.extraFluid = undefined;
    }
    if (!this.hemosheet.outsideUnit) {
      this.hemosheet.ward = this.unitList.value.find(x => x.id === this.patientUnitId).name;
    }
    if (!this.hasFlushNSS || !this.hemosheet.flushNSS || !this.hemosheet.flushTimes) {
      this.hemosheet.flushNSS = null;
      this.hemosheet.flushNSSInterval = null;
      this.hemosheet.flushTimes = null;
    }

    // remove empty item(s)
    this.hemosheet.preVitalsign.removeIf(x => this.checkEmpty(x));
    this.hemosheet.postVitalsign.removeIf(x => this.checkEmpty(x));

    // permission fix (for nurses)
    if (!this.hemosheet.completedTime && this.hemosheet.dialysisPrescriptionId === this.originalPrescriptionId) {
      const item = this.prescriptionList.value.find(x => x.id === this.hemosheet.dialysisPrescriptionId);
      this.prescriptionSelect.selectedText = `${formatDate(item.created, 'd/MM/yy HH:mm', 'en-US')} / ${item.mode} / ${item.temporary ? 'Temp' : 'Long-Term'}`;
      this.hemosheet.dialysisPrescriptionId = null;
    }
    // update nurses in shift if start time is changed dramatically
    if (this.originalStartTime && this.hemosheet.cycleStartTime
      && Math.abs(differenceInHours(new Date(this.originalStartTime), new Date(this.hemosheet.cycleStartTime))) > 1) {
        this.hemosheet.shiftSectionId = 0;
    }
    else {
      // ensure no accident overwrite
      this.hemosheet.shiftSectionId = undefined;
    }

    await addOrEdit(this.injector, {
      addOrEditCall: callToServer$,
      successTxt: { name: 'Hemosheet', editMode: true},
      redirectRoute: ['/patients', this.hemosheet.patientId],
      content: this.content,
      errorCallback: err => {
        this.error = err;
        if (this.error !== '') {
          this.hemosheet.completedTime = this.originalCompleteTime;
          this.initData();
        }
      },
      isModal: this.isModal,
      successCallback: (data) => {
        this.hemosheet.updated = new Date();
        this.hemosheet.updatedBy = this.auth.currentUser.id;
        if (this.setting.rules.changePrescriptionSensitive && this.hemosheet.dialysisPrescription?.id !== this.originalPrescriptionId) {
          this.hemosheet.doctorConsent = false;
        }
        this.hemo.setTmpHemosheet(this.hemosheet);
        this.onSave.emit(this.hemosheet);
      },
      finalize: () => {
      },
      completeCallback: () => this.error = null
    });

  }

  private checkEmpty(item: VitalSignRecord) {
    return !(item.bpd || item.bps || item.hr || item.rr || item.temp);
  }

  trackVitalSign(item: VitalSignRecord, index: number) {
    return item.timestamp;
  }

  async deleteHemosheet() {
    const alert = await this.alertCtl.create({
      backdropDismiss: true,
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this hemosheet (this cannot be undone)?',
      buttons: [
        {
          text: 'Confirm',
          handler: () => this.hemo.deleteHemosheet(this.hemosheet)
            .subscribe({
              next: () => {
                if (this.viewMode) {
                  const nav = this.injector.get(IonNav);
                  const modalCtl = this.injector.get(ModalController);
                  const params = this.injector.get(NavParams);
                  ModalBack(nav, params, modalCtl, true);
                }
                else {
                  const nav = this.injector.get(NavController);
                  this.hemosheet.completedTime = new Date();
                  this.hemo.setTmpHemosheet(this.hemosheet);
                  this.onSave.emit(this.hemosheet);
                  nav.back();
                }
              }
            }),
            role: 'OK'
        },
        {
          text: 'Cancel'
        }
      ]
    });

    alert.present();
  }

  // =============== Auxiliary ===================

  async pickRecordToFill(item: VitalSignRecord, revert: boolean = false) {
    if (!this.dialysisRecords) {
      const loading = await this.loadCtl.create();
      loading.present();
      this.dialysisRecords = (await firstValueFrom(this.records.getDialysisRecords(this.hemosheet))).filter(x => !x.isFromMachine);
      loading.dismiss();
    }

    const modalOption = {
      title: 'Choose value from Dialysis Records',
      data: revert? this.dialysisRecords.sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)))
      : this.dialysisRecords.sort((a, b) => compareAsc(new Date(a.timestamp), new Date(b.timestamp))),
      hideSearch: true,
      hasReload: false,
      templateOverride: this.dialysisRecordT
    } as ModalSearchParams<DialysisRecordInfo>;

    const addRecord = (record: DialysisRecordInfo) => {
      if (record) {
        item.bpd = record.bpd;
        item.bps = record.bps;
        item.hr = record.hr;
        item.rr = record.rr;
        item.temp = record.temp;
        item.timestamp = formatLocalDateString(new Date(record.timestamp));
      }
      return true;
    }

    if (this.isModal) {
      modalOption.onItemSelect = addRecord;
      modalOption.nav = this.modal.currentNav;
      this.modal.currentNav.push(ModalSearchListComponent, modalOption);
    }
    else {
      const pick = await this.modal.openModal(ModalSearchListComponent, modalOption);
      const result = await pick.onWillDismiss();
      if (result.role === 'ok') {
        addRecord(result.data);
      }
    }
  }

}
