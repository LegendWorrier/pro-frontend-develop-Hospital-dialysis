import { GUID } from 'src/app/share/guid';
import { ModalSearchListComponent, ModalSearchParams } from 'src/app/share/components/modal-search-list/modal-search-list.component';
import { ModalService } from 'src/app/share/service/modal.service';
import { UserService } from 'src/app/auth/user.service';
import { AppConfig } from 'src/app/app.config';
import { AuditService } from 'src/app/share/service/audit.service';
import { DialysisRecordInfo } from './../../dialysis-record';
import { RecordService } from 'src/app/dialysis/record.service';
import { RequestService } from './../../../share/service/request.service';
import { DialysisPrescriptionViewComponent } from './../dialysis-prescription-view/dialysis-prescription-view.component';
import { ShiftsService } from './../../../shifts/shifts.service';
import { PickTimeComponent } from './../pick-time/pick-time.component';
import { HemoSetting } from './../../hemo-setting';
import { ReportsPage } from './../../../reports/reports.page';
import { Component, EventEmitter, Input, OnInit, Output, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonNav, NavController, Platform, PopoverController, AlertController, LoadingController, ModalController, NavParams } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { DehydrationCalculate, HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { Hemosheet } from 'src/app/dialysis/hemosheet';
import { Patient } from '../../../patients/patient';
import { HemosheetEditPage } from '../../hemosheet-edit/hemosheet-edit.page';
import { checkGuidNullOrEmpty, decimalFormat, getName, presentToast, ToastType, deepCopy, addOrEdit, pushOrModal, ModalBack } from 'src/app/utils';
import { compareDesc } from 'date-fns';
import { Postures } from 'src/app/enums/postures';
import { CosignRequestPopupComponent } from '../cosign-request-popup/cosign-request-popup.component';
import { AvShuntService } from '../../av-shunt.service';
import { ExecutionRecord } from '../../execution-record';
import { Permissions } from 'src/app/enums/Permissions';
import { finalize, map, first } from 'rxjs/operators';
import { HemosheetInfo } from '../../hemosheet-info';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';
import { User } from 'src/app/auth/user';
import { DialysisType } from 'src/app/enums/dialysis-type';
import { PatientViewInfo } from 'src/app/patients/patient-info';
import { PatientService } from 'src/app/patients/patient.service';
import { Auth } from 'src/app/auth/auth-utils';
import { UserUtil } from 'src/app/auth/user-utils';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'hemo-dialysis-info',
  templateUrl: './dialysis-info.component.html',
  styleUrls: ['./dialysis-info.component.scss'],
})
export class DialysisInfoComponent implements OnInit {

  constructor(
    private hemoService: HemoDialysisService,
    private patientService: PatientService,
    private recordService: RecordService,
    private shiftService: ShiftsService,
    private avshunt: AvShuntService,
    private request: RequestService,
    private auth: AuthService,
    private audit: AuditService,
    private user: UserService,
    private master: MasterdataService,
    private modal: ModalService,
    private nav: NavController,
    private route: ActivatedRoute,
    private plt: Platform,
    private popupCtl: PopoverController,
    private loadCtl: LoadingController,
    private alertCtl: AlertController,
    private injector: Injector) { }

  get isSystemCreated() { return checkGuidNullOrEmpty(this.hemosheet.createdBy); }

  get preWeight() {
    return DehydrationCalculate.preWeight(this.hemosheet);
  }

  get ufNet() {
    return DehydrationCalculate.ufNet(this.hemosheet);
  }

  get ufEstimate() {
    return DehydrationCalculate.ufEstimate(this.hemosheet);
  }

  get postWeight() {
    return DehydrationCalculate.postWeight(this.hemosheet);
  }

  get actualWeightLoss() {
    return DehydrationCalculate.actualWeightLoss(this.hemosheet);
  }

  get idwg() {
    return DehydrationCalculate.idwg(this.hemosheet);
  }

  get width() {
    return this.plt.width();
  }

  get decimal() {
    return decimalFormat(true);
  }

  get vitalSigns() {
    return this.hemosheet.preVitalsign.map(x => {(x as any).type = 'Pre-Dialysis'; return x; })
      .concat(this.hemosheet.postVitalsign.map(x => {(x as any).type = 'Post-Dialysis'; return x; }))
      .sort((a, b) => compareDesc(new Date(a.timestamp), new Date(b.timestamp)));
  }

  nursesInShift: {
    name: string;
    id: GUID
  }[];

  @Input() patient: Patient;
  @Input() hemosheet: Hemosheet;
  @Output() hemosheetChange: EventEmitter<HemosheetInfo> = new EventEmitter<HemosheetInfo>();

  @Input() executeRecords: ExecutionRecord[];
  @Output() executeRecordsChange: EventEmitter<ExecutionRecord[]> = new EventEmitter<ExecutionRecord[]>();

  @Input() dialysisRecords: DialysisRecordInfo[];
  // Calculated
  @Input() thisMonth: number;
  @Input() total: number;
  @Output() onCalulated = new EventEmitter<[number, number]>();

  @Input() viewMode: boolean;
  @Input('nav') ionNav: IonNav;

  @Input() cosignFunc: (result: boolean) => void;

  @Input() setting: HemoSetting.All;
  @Output() settingChange: EventEmitter<HemoSetting.All> = new EventEmitter<HemoSetting.All>();
  @ViewChild('prescriptionInfo') prescriptionInfo: DialysisPrescriptionViewComponent;

  canEdit: boolean;
  canAddPrescription: boolean;
  hasPrescription: boolean;
  canChangeCompleteTime: boolean;
  canApprove: boolean;

  showNursesInShift: boolean;
  modifyNIS: boolean; // (NIS = Nurses In Shift)

  postures = Postures;
  type = DialysisType;

  getName = getName;
  isClaiming = false;

  permissionInit = false;

  async ngOnInit() {
    this.canEdit = this.auth.currentUser.checkPermissionLevel(Permissions.NotDoctor);

    if (this.hemosheet) {
      this.init();
      this.CheckPermission();
    }
    else {
      this.hemosheetChange.asObservable().pipe(first(x => !!x)).subscribe(() => {
        this.init();
      });
    }

    if (!this.setting) {
      this.hemoService.getSetting().subscribe(data => {
        this.setting = data;
        this.settingChange.emit(this.setting);
        this.CheckPermission();
      });
    }
    else {
      this.CheckPermission();
    }

    if (this.thisMonth == null && !this.viewMode) {
      const calculated = await this.hemoService.calculateTreatmentCount(this.patient);
      this.thisMonth = calculated[0];
      this.total = calculated[1];
      this.onCalulated.emit(calculated);
    }
  }

  private async CheckPermission() {
    if (this.permissionInit || !this.hemosheet || !this.setting) {
      return;
    }
    if (!this.patient) {
      this.patient = await firstValueFrom(this.patientService.getPatient(this.hemosheet.patientId));
    }
    const hasPermission = await Auth.checkIsUnitHeadOrInChargeByUnitId(this.patient.unitId, this.auth, this.shiftService, this.master);

    this.canChangeCompleteTime =
      !this.setting.rules.changeCompleteTimePermissionRequired ||
      this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseOnly) || hasPermission;

    this.canAddPrescription = !this.setting.rules.dialysisPrescriptionRequireHeadNurse ||
                              this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp) || hasPermission;
    this.canApprove =
      this.auth.currentUser.checkPermissionLevel(Permissions.DoctorOnly) ||
      (this.setting.rules.headNurseCanApproveDoctorSignature && (this.auth.currentUser.isHeadNurse || hasPermission));

    this.permissionInit = true;
  }

  private init() {
    // AV Shunt
    if (!this.hemosheet.avShunt.shuntSite && this.hemosheet.avShunt.avShuntId) {
      this.avshunt.getAvShuntList(this.hemosheet.patientId).subscribe(data => {
        const avShunt = data.find(a => a.id === this.hemosheet.avShunt.avShuntId);
        this.hemosheet.avShunt.shuntSite = this.avshunt.getAvShuntSiteName(avShunt);
      });
    }

    this.showNursesInShift = !AppConfig.config.hideNursesInShift && this.viewMode && !!this.hemosheet.completedTime;
    if (this.showNursesInShift) {
      this.updateNIS();
    }
  }

  async addHemoSheet() {
    const updateCallback = async (data: HemosheetInfo) => {
      this.hemosheet = data;
          this.hemosheetChange.emit(this.hemosheet);
          if (this.setting.basic.autoFillMedicine) {
            this.recordService.getExecutionRecords(this.hemosheet).subscribe((data) => {
              this.executeRecords = data;
              this.executeRecordsChange.emit(this.executeRecords);
            });
          }
          (this.patient as PatientViewInfo).isInSession = true;
    }

    const hemo$ = await this.hemoService.AddNewHemosheet(this.patient);
    if (hemo$) {
      hemo$.subscribe({
        next: updateCallback,
        error: async (err) => {
          if (err instanceof HttpErrorResponse && err.status === 409) {
            const code = err.error.code;
            switch (code) {
              case 'SECTION_NULL':
                const show = await this.alertCtl.create({
                  header: 'Auto schedule failed',
                  message: 'Cannot find a corresponding section. auto schedule will not be processed.',
                  buttons: [{text: 'Ok'}]
                });
                show.present();

                this.hemoService.getPatientHemosheet(this.patient.id).subscribe(updateCallback);
              return;
            }
          }

          throw err;
        }
      });
    }
  }

  update(hemosheet?: Hemosheet) {
    if (hemosheet) {
      this.hemosheet = hemosheet;
    }
    this.prescriptionInfo?.update(this.hemosheet);
  }

  openReport() {
    if (this.ionNav) {
      this.ionNav.push(ReportsPage, {
        isModal: true,
        pageName: 'Hemosheet',
        report: 'hemosheet',
        reportParams: { hemoId: this.hemosheet.id }
      });
    }
    else {
      this.nav.navigateForward(['reports', 'hemo-records', this.hemosheet.id]);
    }
  }

  claim() {
    this.isClaiming = true;
    
    this.hemoService.claim(this.hemosheet.id)
    .pipe(finalize(() => this.isClaiming = false))
    .subscribe(
      {
        next: () => {
          this.hemosheet.createdBy = this.auth.currentUser.id;
          this.hemosheet.updatedBy = this.hemosheet.createdBy;
          presentToast(this.injector, {
            header: 'Claimed',
            message: 'You have claimed to be owner of this hemosheet.',
            type: ToastType.success
          });
        },
        error: (e) => {
          presentToast(this.injector, {
            header: 'Failed',
            message: 'Cannot claim this hemosheet. (Perhaps another person has already claimed it?)',
            type: ToastType.alert
          });
        }
      });
  }

  approve() {
    const call$ = this.hemoService.doctorConsent(this.hemosheet.id, !this.hemosheet.doctorConsent);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Doctor Consent has been updated.',
      isModal: false,
      stay: true,
      successCallback: () => {
        this.hemosheet.doctorConsent = !this.hemosheet.doctorConsent;
      },
    });
  }

  async updateNIS() {
    if (!this.hemosheet.nursesInShift || this.hemosheet.nursesInShift.length === 0) {
      this.nursesInShift = [];
      return;
    }
    const list = await firstValueFrom(forkJoin(this.hemosheet.nursesInShift.map(x => this.audit.getAuditFullName(x)
    .pipe(map(n => ({
      name: n,
      id: x
    }))))));
    this.nursesInShift = list;
  }

  tmpNIS;
  editNursesInShift() {
    this.tmpNIS = deepCopy(this.hemosheet.nursesInShift);
    this.modifyNIS = true;
  }

  async saveNursesInShift() {
    const loading = await this.loadCtl.create();
    loading.present();
    await addOrEdit(this.injector, {
      addOrEditCall: this.hemoService.editNursesInShift(this.hemosheet),
        successTxt: 'Update Nurses in shift successfully.',
        stay: true,
        isModal: false,
        errorCallback: _ => {
          this.reverseNursesInShift();
        },
        finalize: () => {
          loading.dismiss();
          this.modifyNIS = false;
        }
    });
  }

  reverseNursesInShift() {
    this.hemosheet.nursesInShift = this.tmpNIS;
    this.modifyNIS = false;
    
    this.updateNIS();
  }

  async updateNurseInShiftToCurrent() {
    const loading = await this.loadCtl.create();
    loading.present();
    await addOrEdit(this.injector, {
      addOrEditCall: this.hemoService.updateNursesInShiftToCurrent(this.hemosheet),
        successTxt: 'Update Nurses in shift successfully.',
        stay: true,
        isModal: false,
        successCallback: (data: GUID[]) => {
          this.hemosheet.nursesInShift = data;
          this.updateNIS();
        },
        errorCallback: _ => {
          this.reverseNursesInShift();
        },
        finalize: () => {
          loading.dismiss();
          this.modifyNIS = false;
        }
    });
  }

  addNurse() {
    const onSelect = (u: User) => {
      if (u) {
        if (!this.hemosheet.nursesInShift) {
          this.hemosheet.nursesInShift = [];
        }
        this.hemosheet.nursesInShift.push(u.id);
        this.updateNIS();
      }
      return true;
    };
    this.modal.currentNav.push(ModalSearchListComponent, {
      title: 'Nurse in shift select',
      data: this.getNurseList(),
      getSearchKey: x => getName(x),
      lastUpdate: _ => UserUtil.getLastCacheUpdate(this.patient.unitId),
      nav: this.modal.currentNav,
      onItemSelect: onSelect
    } as ModalSearchParams<User>);
  }

  removeNurse(id: GUID) {
    this.hemosheet.nursesInShift.splice(this.hemosheet.nursesInShift.indexOf(id), 1);
    this.updateNIS();
  }

  clearNurse() {
    this.hemosheet.nursesInShift = [];
    this.updateNIS();
  }

  async edit() {
    this.hemoService.setTmpHemosheet(this.hemosheet);
    this.patientService.setTmp(this.patient);

    if (this.ionNav) {
      const onUpdateHemo = new EventEmitter<HemosheetInfo>();
      onUpdateHemo.subscribe((data) => {
        this.hemosheet = data;
        this.hemosheetChange.emit(this.hemosheet);
        this.prescriptionInfo.update(this.hemosheet);
      });
      const result = await pushOrModal(HemosheetEditPage,
        {
          onSave: onUpdateHemo,
          isModal: true,
          viewMode: this.viewMode,
          executeRecords: this.executeRecords,
          dialysisRecords: this.dialysisRecords,
          patientUnitId: this.patient.unitId
        }, this.modal);
      if (result && typeof result === 'boolean') {
        const modalCtl = this.injector.get(ModalController);
        const params = this.injector.get(NavParams);
        ModalBack(this.ionNav, params, modalCtl, true);
      }
    }
    else {
      this.nav.navigateForward(['hemosheets', this.hemosheet.id],
      {
        relativeTo: this.route,
        state: { executeRecords: this.executeRecords, dialysisRecords: this.dialysisRecords }
      });
    }
  }

  async complete() {
    if (!this.setting) {
      this.setting = await firstValueFrom(this.hemoService.getSetting());
    }
    const complete$ = await this.hemoService.getCompleteHemosheetCallWithPrompt(this.hemosheet, this.executeRecords, this.setting);

    if (complete$) {
      complete$.subscribe({
      next: () => {
        this.hemosheet = null;
        this.hemosheetChange.emit(null);
        (this.patient as PatientViewInfo).isInSession = false;
      }, 
      error: (err) => {
        this.hemosheet.completedTime = null;
        throw err;
      }});
    }
  }

  async changeComplete() {
    const chooseTime = await this.popupCtl.create({
      component: PickTimeComponent,
      componentProps: {
        targetTime: this.hemosheet.completedTime
      },
      backdropDismiss: true,
      id: 'pick-time',
      cssClass: [ 'hemo-calendar', 'hemo-popup' ]
    });
    chooseTime.present();
    const result = await chooseTime.onWillDismiss();
    if (result.data) {
      const newCompleteTime = result.data as Date;
      const change$ = this.hemoService.changeCompleteTime(this.hemosheet, newCompleteTime);
      addOrEdit(this.injector, {
        addOrEditCall: change$,
        successTxt: 'Changed completed time successfully.',
        stay: true,
        isModal: true,
        successCallback: _ => {
          this.hemosheet.completedTime = newCompleteTime;
          this.hemosheetChange.emit(this.hemosheet);
        }
      });
    }
  }

  addDialysisPresctription() {
    this.nav.navigateForward(['prescriptions', 'add'], { relativeTo: this.route, state: { canEdit: true } });
  }

  async requestCosign() {
    const call$ = (id, userId, password) => this.hemoService.addCosign(id, userId, password);
    const requestCall$ = (id, userId) => this.request.requestCosignHemo(id, userId);
    const popup = await this.popupCtl.create({
      component: CosignRequestPopupComponent,
      componentProps: { resource: this.hemosheet, unitId: this.patient.unitId, setCosignCall: call$, requestCosignCall: requestCall$ },
      backdropDismiss: true,
      showBackdrop: true
    });
    popup.present();
    const result = await popup.onWillDismiss();
    if (result.role === 'OK') {
      this.hemosheet.proofReader = result.data;
    }

  }

  async sendPdf() {
    addOrEdit(this.injector, {
      addOrEditCall: this.hemoService.sendHemosheetPdf(this.hemosheet.id),
      stay: true,
      successTxt: 'Sent successfully',
      successCallback: () => {
        this.hemosheet.sentPDF = true;
      },
      customErrorHandling: (err) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return true;
        }
      }
    });
  }

  // ============== Utils ===========

  getNurseList(): Observable<User[]> {
    const noDuplicate = (user: User) => {
      return !this.hemosheet.nursesInShift.includes(user.id);
    };

    return new Observable((sub) => {
      UserUtil.getNursesForCurrentUser(this.user)
        .pipe(map(data => data.filter(noDuplicate)))
        .subscribe(data => sub.next(data));
    });
  }

}
