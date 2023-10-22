import { Dialyzer } from 'src/app/masterdata/dialyzer';
import { DraftService } from './../../share/service/draft.service';
import { RecoveryService } from './../../share/service/recovery.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppConfig } from 'src/app/app.config';
import { DialysisModeName } from './../dialysis-mode';
import { GUID } from 'src/app/share/guid';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, Platform, PopoverController } from '@ionic/angular';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { DialysisMode } from 'src/app/dialysis/dialysis-mode';
import { DialysisPrescription } from 'src/app/dialysis/dialysis-prescription';
import { HdfType } from 'src/app/dialysis/hdf-type';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { BloodAccessRoute } from 'src/app/enums/blood-access-route';
import { Permissions } from 'src/app/enums/Permissions';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { addOrEdit, presentToast } from 'src/app/utils';
import { RequestService } from '../../share/service/request.service';
import { CosignRequestPopupComponent } from '../components/cosign-request-popup/cosign-request-popup.component';
import { PatientService } from 'src/app/patients/patient.service';
import { PatientInfo } from 'src/app/patients/patient-info';

@Component({
  selector: 'app-dialysis-prescription-edit',
  templateUrl: './dialysis-prescription-edit.page.html',
  styleUrls: ['./dialysis-prescription-edit.page.scss'],
})
export class DialysisPrescriptionEditPage implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plt: Platform,
    private master: MasterdataService,
    private hemoService: HemoDialysisService,
    private patientService: PatientService,
    private auth: AuthService,
    private request: RequestService,
    private alertCtl: AlertController,
    private popupCtl: PopoverController,
    private recover: RecoveryService,
    private draft: DraftService,
    private injector: Injector) {
      const curNav = this.router.getCurrentNavigation();
      if (curNav?.extras?.state) {
        this.canEdit = curNav.extras.state.canEdit;
      }
    }

  get width() { return this.plt.width(); }
  get isIos() { return this.plt.is('ios'); }
  get Hour() {
    if (!this._h && this.tmpPrescription.duration) {
      this._h = Math.trunc(this.tmpPrescription.duration / 60);
    }

    return this._h;
  }

  set Hour(h: number) {
    this._h = h;
  }
  get Minute() {
    if (this._m === undefined && this.tmpPrescription.duration) {
      this._m = this.tmpPrescription.duration % 60;
    }
    return this._m;
  }

  set Minute(m: number) {
    this._m = m;
  }

  // heparin alternate unit
  useMl = false;
  
  @Input() isModal: boolean;
  @Input() patient: PatientInfo;
  @Input() prescription: DialysisPrescription;
  @Input() canEdit?: boolean;
  @Input() overrideId?: GUID;

  @Input() signFunc: (result: boolean) => void;

  tmpPrescription: DialysisPrescription = new DialysisPrescription;

  DialysisMode = DialysisMode;
  modes = Object.keys(DialysisModeName).map(k => ({ text: DialysisModeName[k], value: k }));
  hdfTypes = Object.values(HdfType).map(v => ({ text: v, value: v }));
  bloodRoutes = Object.values(BloodAccessRoute).map(v => ({ text: v, value: v }));

  deleted: boolean;
  editMode: boolean;
  acNotUsed: boolean;
  showAcForFill: boolean;
  showNeedleSize: boolean;

  acList: Data[] = [];
  dialysateList: {k: number, ca: number}[] = [];
  needleList: number[] = [];
  dialyzerList: Dialyzer[] = [];

  acHr: number;

  myId: GUID;

  private tmp = { mode: null, bloodRoute: null, needleA: null, needleV: null };
  error: string;
  @ViewChild(IonContent) content: IonContent;

  _dialysate: {k: number, ca: number};

  private _h: number;

  private _m: number;

  get draftKey(): string { return `hemo-pres:${this.patient.id}` };
  get preSave() { return () => this.beforeSave(); }
  get postLoad() { return () => this.afterLoad(); }

  async ngOnInit() {
    if (this.isModal) {
      if (this.prescription) {
        this.tmpPrescription = Object.assign(new DialysisPrescription, this.prescription);
        if (this.prescription.patientId) {
          this.editMode = true;
        }
        else { // copy mode
          this.tmpPrescription.patientId = this.patient.id;
          this.tmpPrescription.id = undefined;
        }
      }
      else {
        this.tmpPrescription.patientId = this.patient.id;
      }
    }
    else {
      const patientId = decodeURIComponent(this.route.snapshot.params.id);
      this.patient = await firstValueFrom(this.patientService.getPatient(patientId));
      this.prescription = this.route.snapshot.data.prescription;
      if (this.route.snapshot.params.prescriptionId) {
        this.editMode = true;
        const data = this.route.snapshot.data.prescription;
        Object.assign(this.tmpPrescription, data);
      }
      else {
        this.tmpPrescription.patientId = this.patient.id;
      }
      this.canEdit = true;
    }

    if (!this.editMode) {
      this.tmpPrescription.avgDialyzerReuse = AppConfig.config.prescription.avgDialyzerReuse;
    }
    if (!this.tmpPrescription.isActive) {
      this.deleted = true;
    }
    
    if (!this.canEdit) {
      const setting = await firstValueFrom(this.hemoService.getSetting());
      this.canEdit = (!setting.rules.dialysisPrescriptionRequireHeadNurse || this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp))
                    && this.hemoService.checkCanEdit(this.tmpPrescription) && !this.signFunc;
    }

    this.afterLoad();
    
    // workaround : dynamic list not show value on the beginning
    if (this.needleList.length === 0) {
      this.tmp.needleA = this.tmpPrescription.arterialNeedle;
      this.tmpPrescription.arterialNeedle = null;
      this.tmp.needleV = this.tmpPrescription.venousNeedle;
      this.tmpPrescription.venousNeedle = null;
    }
    if (this.dialysateList.length === 0) {
      this._dialysate = { k: null, ca: null};
    }

    this.master.getAnticoagulantList().subscribe(data => this.acList = data);
    this.master.getDialyzerList().subscribe(data => this.dialyzerList = data);

    this.master.getDialysateList().subscribe(data => {
      this.dialysateList = data.map(x => ({k: x.k, ca: x.ca })).sort((a, b) => (a.k - b.k) === 0 ? a.ca - b.ca : a.k - b.k);
      this._dialysate = { k: this.tmpPrescription.dialysateK, ca: this.tmpPrescription.dialysateCa };
    });
    this.master.getNeedleList().subscribe(data => {
      this.needleList = data.map(x => x.number);
      this.tmpPrescription.arterialNeedle = this.tmp.needleA;
      this.tmpPrescription.venousNeedle = this.tmp.needleV;
    });

    this.acHr = AppConfig.config.prescription.acHr;
    this.myId = this.auth.currentUser.id;

    // console.log(this.tmpPrescription)
  }

  onBloodRouteChange() {
    this.showAcForFill = this.tmpPrescription.bloodAccessRoute &&
      (
        this.tmpPrescription.bloodAccessRoute === BloodAccessRoute.DoubleLumen_L ||
        this.tmpPrescription.bloodAccessRoute === BloodAccessRoute.DoubleLumen_R ||
        this.tmpPrescription.bloodAccessRoute === BloodAccessRoute.PermCath_L ||
        this.tmpPrescription.bloodAccessRoute === BloodAccessRoute.PermCath_R
      );
      
    this.showNeedleSize = this.tmpPrescription.bloodAccessRoute && !this.showAcForFill;
  }

  compareDialysate(a, b) {
    return a.k === b.k && a.ca === b.ca;
  }

  get canAutoCalculate() {
    if ((!this.useMl && this.tmpPrescription.acPerSession && this.tmpPrescription.initialAmount != null && this.tmpPrescription.maintainAmount)
        ||(this.useMl && this.tmpPrescription.acPerSessionMl && this.tmpPrescription.initialAmountMl != null && this.tmpPrescription.maintainAmountMl)) {
      return false;
    }

    if (this.useMl) {
      return (this.tmpPrescription.acPerSessionMl && this.tmpPrescription.initialAmountMl != null)
            || (this.tmpPrescription.acPerSessionMl && this.tmpPrescription.maintainAmountMl)
            || (this.tmpPrescription.initialAmountMl != null && this.tmpPrescription.maintainAmountMl);
    }
    else {
      return (this.tmpPrescription.acPerSession && this.tmpPrescription.initialAmount != null)
            || (this.tmpPrescription.acPerSession && this.tmpPrescription.maintainAmount)
            || (this.tmpPrescription.initialAmount != null && this.tmpPrescription.maintainAmount);
    }
  }

  autoCalculate() {
    if (this.useMl) {
      if (this.tmpPrescription.acPerSessionMl && this.tmpPrescription.initialAmountMl != null) {
        this.tmpPrescription.maintainAmountMl = (this.tmpPrescription.acPerSessionMl - this.tmpPrescription.initialAmountMl) / this.acHr;
      }
      else if (this.tmpPrescription.acPerSessionMl && this.tmpPrescription.maintainAmountMl) {
        this.tmpPrescription.initialAmountMl = this.tmpPrescription.acPerSessionMl - (this.tmpPrescription.maintainAmountMl * this.acHr);
      }
      else {
        this.tmpPrescription.acPerSessionMl = this.tmpPrescription.initialAmountMl + (this.tmpPrescription.maintainAmountMl * this.acHr);
      }
    }
    else {
      if (this.tmpPrescription.acPerSession && this.tmpPrescription.initialAmount != null) {
        this.tmpPrescription.maintainAmount = (this.tmpPrescription.acPerSession - this.tmpPrescription.initialAmount) / this.acHr;
      }
      else if (this.tmpPrescription.acPerSession && this.tmpPrescription.maintainAmount) {
        this.tmpPrescription.initialAmount = this.tmpPrescription.acPerSession - (this.tmpPrescription.maintainAmount * this.acHr);
      }
      else {
        this.tmpPrescription.acPerSession = this.tmpPrescription.initialAmount + (this.tmpPrescription.maintainAmount * this.acHr);
      }
    }
  }

  afterLoad() {
    // TODO: separate unit for each fields
    const hasMl = this.tmpPrescription.initialAmountMl || this.tmpPrescription.maintainAmountMl || this.tmpPrescription.acPerSessionMl;
    const hasUnit = this.tmpPrescription.initialAmount || this.tmpPrescription.maintainAmount || this.tmpPrescription.acPerSession;

    if (this.tmpPrescription.reasonForRefraining ||
      !(this.tmpPrescription.anticoagulant || hasMl || hasUnit)) {
      this.acNotUsed = true;
    }
    else {
      this.acNotUsed = false;
    }

    if (hasMl) {
      this.useMl = true;
    }
    else {
      this.useMl = false;
    }

    if (this.tmpPrescription.bloodAccessRoute) {
      this.onBloodRouteChange();
    }

    this._dialysate = { k: this.tmpPrescription.dialysateK, ca: this.tmpPrescription.dialysateCa };
  }

  beforeSave() {
    if (this.tmpPrescription.mode !== DialysisMode.HDF) {
      this.tmpPrescription.hdfType = null;
      this.tmpPrescription.substituteVolume = null;
      this.tmpPrescription.ivSupplementPosition = null;
      this.tmpPrescription.ivSupplementVolume = null;
    }
    if (this.acNotUsed) {
      this.tmpPrescription.anticoagulant = null;
      this.tmpPrescription.acPerSession = null;
      this.tmpPrescription.initialAmount = null;
      this.tmpPrescription.maintainAmount = null;
      this.tmpPrescription.acPerSessionMl = null;
      this.tmpPrescription.initialAmountMl = null;
      this.tmpPrescription.maintainAmountMl = null;
    }
    // TODO: separate unit for each fields
    const acUnitComplete = this.tmpPrescription.acPerSession && this.tmpPrescription.initialAmount && this.tmpPrescription.maintainAmount;
    if ((!this.useMl && acUnitComplete) || this.acNotUsed) {
      this.tmpPrescription.acPerSessionMl = null;
      this.tmpPrescription.initialAmountMl = null;
      this.tmpPrescription.maintainAmountMl = null;
    }
    if (!this.tmpPrescription.isAcNotUsed) {
      this.tmpPrescription.reasonForRefraining = null;
    }
    if (this.tmpPrescription.temporary) {
      this.tmpPrescription.dryWeight = null;
    }
    else {
      this.tmpPrescription.excessFluidRemovalAmount = null;
    }
    if (!this.showAcForFill) {
      this.tmpPrescription.aNeedleCC = null;
      this.tmpPrescription.vNeedleCC = null;
    }
    if (!this.showNeedleSize) {
      this.tmpPrescription.arterialNeedle = null;
      this.tmpPrescription.venousNeedle = null;
    }
    this.tmpPrescription.duration = this.Hour * 60 + (this.Minute ?? 0);
    this.tmpPrescription.dialysateK = this._dialysate.k;
    this.tmpPrescription.dialysateCa = this._dialysate.ca;
  }

  onDialyzer(item: Dialyzer) {
    if (item.surfaceArea) {
      this.tmpPrescription.dialyzerSurfaceArea = item.surfaceArea;
    }
  }

  async save() {
    this.beforeSave();

    let override = false;
    if (this.overrideId) {
      const alert = await this.alertCtl.create({
        backdropDismiss: false,
        header: 'Overridable',
        subHeader: 'Redundant Prescription',
        message:
        `There is already a prescription created prior, this one is redundant.
        Do you want to override and edit existing one instead?`,
        buttons: [
          { text: 'Save as new one', handler: () => { alert.dismiss(false); return false; } },
          { text: 'Override Existing', handler: () => { alert.dismiss(true); return true; } }
        ]
      });

      alert.present();
      const result = await alert.onDidDismiss();
      // override
      if (result.data) {
        override = true;
        this.tmpPrescription.id = this.overrideId;
      }
    }

    // =========== Debug Code =======
    //await this.autoRecover();
    //throw new Error("Test recovery");

    // =============================
    
    const saveToServer$: Observable<any> = this.editMode || override ?
      this.hemoService.editDialysisPrescription(this.tmpPrescription) :
      this.hemoService.createDialysisPrescription(this.tmpPrescription).pipe(map(x => Object.assign(new DialysisPrescription, x)));

    await addOrEdit(this.injector, {
      addOrEditCall: saveToServer$,
      successTxt: { name: 'Prescription', editMode: this.editMode},
      redirectRoute: ['/patients', this.tmpPrescription.patientId],
      content: this.content,
      errorCallback: err => this.error = err,
      isModal: this.isModal,
      successCallback: data => {
        this.hemoService.setTmpPrescription(data ?? this.tmpPrescription);
        this.draft.removeDraft(this.draftKey); // remove draft, if any
      },
      customErrorHandling: async (e) => {
        if (e !instanceof HttpErrorResponse || (e as HttpErrorResponse)?.status == 401) {
          await this.autoRecover();
        }
        return false;
      },
      completeCallback: () => this.error = null
    });

  }

  async autoRecover() {
    await this.recover.save(`patient`, 'hemo-pres', [ this.patient.id, this.prescription?.id ? this.prescription : null ]);
    await this.draft.saveDraft(this.draftKey, this.tmpPrescription);
    presentToast(this.injector, {
      message: 'The data has been auto-saved.',
      native: true
    });
  }

  async sign() {
    const call$ = this.hemoService.assingSelfPrescriptionNurse(this.prescription.id);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: 'Signed successfully',
      stay: true,
      isModal: this.isModal,
      successCallback: (data) => {
        this.prescription.dialysisNurse = data;
      }
    });
  }

  async requestSign() {
    const call$ = (id, userId, password) => this.hemoService.updatePrescriptionNurse(id, userId, password);
    const requestCall$ = (id, userId) => this.request.requestNursePrescription(id, userId);
    const popup = await this.popupCtl.create({
      component: CosignRequestPopupComponent,
      componentProps: { label: 'Executor Nurse', resource: this.prescription, unitId: this.patient.unitId, setCosignCall: call$, requestCosignCall: requestCall$ },
      backdropDismiss: true,
      showBackdrop: true
    });
    popup.present();
    const result = await popup.onWillDismiss();
    if (result.role === 'OK') {
      this.prescription.dialysisNurse = result.data;
    }

  }


}
