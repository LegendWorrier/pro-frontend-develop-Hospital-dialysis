import { LanguageService } from './../../service/language.service';
import { intlFormatDistance } from 'date-fns';
import { HemosheetInfo } from './../../../dialysis/hemosheet-info';
import { ModalService } from './../../service/modal.service';
import { RecordService } from 'src/app/dialysis/record.service';
import { HemoDialysisService } from './../../../dialysis/hemo-dialysis.service';
import { MasterdataService } from './../../../masterdata/masterdata.service';
import { firstValueFrom } from 'rxjs';
import { PatientService } from './../../../patients/patient.service';
import { ScheduleService } from './../../../schedule/schedule.service';
import { AuthService } from './../../../auth/auth.service';
import { PopoverController, NavController } from '@ionic/angular';
import { RequestInfo } from './../../service/request.service';
import { Component, OnInit, Input, Injector } from '@angular/core';
import { SectionSlots } from 'src/app/enums/section-slots';
import { HemosheetViewPage } from 'src/app/dialysis/hemosheet-view/hemosheet-view.page';
import { PatientInfo } from 'src/app/patients/patient-info';
import { ExecutionType } from 'src/app/dialysis/execution-record';
import { convertStartTimeToDate, getDateFromDay } from 'src/app/schedule/schedule-utils';
import { DialysisPrescription } from 'src/app/dialysis/dialysis-prescription';
import { DialysisPrescriptionEditPageModule } from 'src/app/dialysis/dialysis-prescription-edit/dialysis-prescription-edit.module';
import { DialysisPrescriptionEditPage } from 'src/app/dialysis/dialysis-prescription-edit/dialysis-prescription-edit.page';

@Component({
  selector: 'app-approval-review',
  templateUrl: './approval-review.component.html',
  styleUrls: ['./approval-review.component.scss'],
})
export class ApprovalReviewComponent implements OnInit {

  @Input() requestInfo: RequestInfo;

  extraInfo: any[] = [];

  ready = false;
  isMulti = false;

  hasPermission = true;
  reviewed = false;
  readonly TYPE = {
    TRANSFER: 'transfer',
    TRANSFER_TEMP: 'transfer-temp',
    COSIGN_HEMO: 'cosign-hemo',
    COSIGN_EXE: 'cosign-execute',
    PRESC_NURSE: 'presc-nurse'
  }

  needReviewList = [
    this.TYPE.COSIGN_HEMO,
    this.TYPE.PRESC_NURSE
  ]

  exeType = ExecutionType;

  constructor(
    private popup: PopoverController,
    private schedule: ScheduleService,
    private patientService: PatientService,
    private master: MasterdataService,
    private auth: AuthService,
    private hemoService: HemoDialysisService,
    private recordService: RecordService,
    private modal: ModalService,
    private navCtl: NavController,
    private lang: LanguageService,
    private injector: Injector) { }

  async ngOnInit() {
    if (this.requestInfo.type === this.TYPE.TRANSFER || this.requestInfo.type === this.TYPE.TRANSFER_TEMP) {
      if (!this.requestInfo.targetUnitId) {
        throw new Error("request info is invalid: no target unitId is specified");
      }
      this.hasPermission = this.auth.currentUser.isPowerAdmin || await this.schedule.checkAuthorizedByUnitId(this.requestInfo.targetUnitId);
    }
    this.isMulti = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units.length > 1;

    await this.getExtraInfo();
    this.ready = true;
  }

  approve() {
    this.popup.dismiss(true, 'ok');
  }

  deny() {
    this.popup.dismiss(false, 'ok');
  }

  formatDateDistance(date: string | Date) {
    return intlFormatDistance(new Date(date), new Date(), { unit: 'day', locale: this.lang.CurrentDateLocale.code });
  }

  get needReview() { return this.requestInfo.type === this.TYPE.COSIGN_HEMO && !this.reviewed }

  async viewHemosheetInfo(hemo: HemosheetInfo, patient: PatientInfo) {
    const hemosheet = await this.modal.openModal(HemosheetViewPage,
      {
        hemosheet: hemo,
        patient,
        cosignApproveMode: true
      });
    const result = await hemosheet.onWillDismiss();
    if (result.role === 'ok') {
      if (result.data) {
        this.approve();
      }
      else {
        this.deny();
      }
    }

    this.reviewed = true;
  }

  async viewPrescription(prescription: DialysisPrescription, patient: PatientInfo) {
    const prescriptionView = await this.modal.openModal(DialysisPrescriptionEditPage,
      {
        prescription: prescription,
        patient,
        signFunc: (approve: boolean) => prescriptionView.dismiss(approve, 'ok'),
        isModal: true
      });
    const result = await prescriptionView.onWillDismiss();
    if (result.role === 'ok') {
      if (result.data) {
        this.approve();
      }
      else {
        this.deny();
      }
    }

    this.reviewed = true;
  }

  viewPatientInfo(patientId: string) {
    this.navCtl.navigateForward(['/patients', patientId]);
    this.popup.dismiss();
  }

  async getExtraInfo() {
    switch (this.requestInfo.type) {
      case this.TYPE.TRANSFER: {
        const patient = await firstValueFrom(this.patientService.getPatient(this.requestInfo.patientId));
        const targetSection = await firstValueFrom(this.schedule.getSection(this.requestInfo.target.sectionId));
        const targetSlot = <SectionSlots>this.requestInfo.target.slot;
        const units = await this.master.getUnitListFromCache();
        const targetUnit = units.find(x => x.id === this.requestInfo.targetUnitId);
        const originUnit = units.find(x => x.id === patient.unitId);

        const targetSlotDate = convertStartTimeToDate(targetSection.startTime, getDateFromDay(targetSlot));

        this.extraInfo.push(patient.name);
        this.extraInfo.push(originUnit.name);
        this.extraInfo.push(targetUnit.name);
        this.extraInfo.push(targetSlotDate);
        break;
      }
      case this.TYPE.TRANSFER_TEMP: {
        const patient = await firstValueFrom(this.patientService.getPatient(this.requestInfo.patientId));
        const targetDatetime = new Date(this.requestInfo.request.date);
        const units = await this.master.getUnitListFromCache();
        const targetUnit = units.find(x => x.id === this.requestInfo.request.overrideUnitId);
        const originUnit = units.find(x => x.id === patient.unitId);

        this.extraInfo.push(patient.name);
        this.extraInfo.push(originUnit.name);
        this.extraInfo.push(targetUnit.name);
        this.extraInfo.push(targetDatetime);
        break;
      }
      case this.TYPE.COSIGN_HEMO: {
        const hemo = await firstValueFrom(this.hemoService.getHemosheet(this.requestInfo.hemoId));
        const patient = await firstValueFrom(this.patientService.getPatient(hemo.patientId));
        this.extraInfo.push(patient);
        this.extraInfo.push(hemo);
        break;
      }
      case this.TYPE.COSIGN_EXE: {
        const exe = await firstValueFrom(this.recordService.getExecutionRecord(this.requestInfo.executionId));
        const hemo = await firstValueFrom(this.hemoService.getHemosheet(exe.hemodialysisId));
        const patient = await firstValueFrom(this.patientService.getPatient(hemo.patientId));
        this.extraInfo.push(patient);
        this.extraInfo.push(hemo);
        this.extraInfo.push(exe);
        break;
      }
      case this.TYPE.PRESC_NURSE: {
        const prescription = await firstValueFrom(this.hemoService.getDialysisPrescription(this.requestInfo.prescriptionId));
        const patient = await firstValueFrom(this.patientService.getPatient(prescription.patientId));
        this.extraInfo.push(patient);
        this.extraInfo.push(prescription);
        break;
      }
    
      default:
        break;
    }
  }

}
