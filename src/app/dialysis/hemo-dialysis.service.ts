import { AppConfig } from 'src/app/app.config';
import { AuthService } from './../auth/auth.service';
import { format } from 'date-fns';
import { HemoSetting } from './hemo-setting';
import { PickTimeComponent } from './components/pick-time/pick-time.component';
import { ShiftsService } from './../shifts/shifts.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GUID, guid } from 'src/app/share/guid';
import { Injectable, inject } from '@angular/core';
import { AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { Observable, firstValueFrom } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Patient } from '../patients/patient';
import { HemoResult } from './hemo-result';
import { ServiceURL } from '../service-url';
import { PageView } from '../share/page-view';
import { DialysisPrescription } from './dialysis-prescription';
import { Hemosheet } from './hemosheet';
import { ServiceBase } from '../share/service/service-base';
import { ExecutionRecord } from './execution-record';
import { Permissions } from '../enums/Permissions';
import { PatientInfo } from '../patients/patient-info';
import { DialysisPrescriptionInfo } from './dialysis-prescription-info';
import { HemosheetInfo } from './hemosheet-info';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { HemoNote, HemosheetNoteInfo } from './hemosheet-note-info';

@Injectable({
  providedIn: 'root',
})
export class HemoDialysisService extends ServiceBase {

  constructor(
    http: HttpClient,
    private alertCtl: AlertController,
    private loadingCtl: LoadingController,
    private pop: PopoverController,
    private shiftService: ShiftsService,
    private auth: AuthService
    ) {
    super(http);
  }

  // ================== cache =================
  private tmpPrescription: DialysisPrescription;
  private tmpHemosheet: HemosheetInfo;

  private static processReadHemosheet(data: HemosheetInfo): Hemosheet {
    if (data && !(data instanceof Hemosheet)) {
      const hemosheet = Object.assign(new Hemosheet, data);
      if (data.dialysisPrescription) {
        hemosheet.dialysisPrescription = Object.assign(new DialysisPrescription, data.dialysisPrescription);
      }
      else {
        hemosheet.dialysisPrescription = null;
      }
      return hemosheet;
    }
    if (data?.dehydration.lastPostWeight) {
      data.dehydration.lastPostWeight = data.dehydration.lastPostWeight.round(AppConfig.config.decimalPrecision);
    }
    return data as Hemosheet;
  }

  getAllHemoRecords(page: number, limit?: number, orderBy?: string, where?: string): Observable<PageView<HemoResult>> {
    let params = new HttpParams({ fromObject: { page } });
    if (where) {
      params = params.set('where', where);
    }
    if (limit) {
      params = params.set('limit', limit);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }

    return this.http.get<PageView<HemoResult>>(this.API_URL + ServiceURL.hemo_record_getall, { params }).pipe(map((result) => {
      result.data = result.data.map( x => {
        x.record = HemoDialysisService.processReadHemosheet(x.record);
        return x;
      });
      return result;
    }));
  }

  getAllHemoRecordsWithNote(patientId: string, page: number, limit?: number, orderBy?: string, where?: string): Observable<PageView<HemosheetNoteInfo>> {
    let params = new HttpParams({ fromObject: { page } });
    if (where) {
      params = params.set('where', where);
    }
    if (limit) {
      params = params.set('limit', limit);
    }
    if (orderBy) {
      params = params.set('orderBy', orderBy);
    }

    return this.http.get<PageView<HemosheetNoteInfo>>(this.API_URL + ServiceURL.hemo_record_getlist_withnote.format(encodeURIComponent(patientId)), { params }).pipe(map((result) => {
      result.data = result.data.map( x => {
        return HemoDialysisService.processReadHemosheet(x) as HemosheetNoteInfo;
      });
      return result;
    }));
  }

  getPatientHemosheet(patientId: string): Observable<Hemosheet> {
    return this.http.get<HemosheetInfo>(this.API_URL + ServiceURL.hemo_record_getlatest.format(encodeURIComponent(patientId)))
    .pipe(map(HemoDialysisService.processReadHemosheet));
  }

  checkDialysisPrescription(patient: PatientInfo): Promise<boolean> {
    return this.http.get<boolean>(this.API_URL + ServiceURL.hemo_checkprescription.format(encodeURIComponent(patient.id))).toPromise();
  }

  createNewHemoSheet(patient: PatientInfo, hemoData?: HemosheetInfo): Observable<HemosheetInfo> {
    const hemosheet = new Hemosheet();
    hemosheet.patientId = patient.id;
    hemosheet.cycleStartTime = new Date();
    if (hemoData) {
      Object.assign(hemosheet, hemoData);
      hemosheet.dialysisPrescription = null; // save some bandwidth (backend side also has safe guard not to send this)
    }

    return this.http.post<HemosheetInfo>(this.API_URL + ServiceURL.hemo_record_addnew, hemosheet);
  }

  getHemosheet(id: GUID): Observable<Hemosheet> {
    return this.http.get<HemosheetInfo>(this.API_URL + ServiceURL.hemo_record_get.format(`${id}`))
    .pipe(map(HemoDialysisService.processReadHemosheet));
  }

  editHemoSheet(record: HemosheetInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.hemo_record_edit.format(`${record.id}`), record);
  }

  editNursesInShift(record: HemosheetInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.hemo_record_nurses_in_shift.format(`${record.id}`), record.nursesInShift);
  }

  updateNursesInShiftToCurrent(record: HemosheetInfo) {
    return this.http.put<GUID[]>(this.API_URL + ServiceURL.hemo_record_nurses_in_shift_current.format(`${record.id}`), null);
  }

  updateRecord(recordId: GUID, prescription: DialysisPrescriptionInfo) {
    return this.http.post<boolean>(this.API_URL + ServiceURL.hemo_prescription_updaterecord.format(`${recordId}`), prescription);
  }

  checkUnexecuted(record: HemosheetInfo) {
    return this.http.get<boolean>(this.API_URL + ServiceURL.hemo_check_unexecuted_record.format(`${record.id}`));
  }

  completeHemoSheet(record: HemosheetInfo, completeTime: Date = null) {
    return this.http.post<void>(this.API_URL + ServiceURL.hemo_record_complete.format(`${record.id}`), { update: record, completeTime });
  }

  changeCompleteTime(record: HemosheetInfo, completeTime: Date) {
    if (record.completedTime == null) {
      throw new Error('Invalid logic. Cannot change still on going hemosheet');
    }
    return this.http.post<void>(this.API_URL + ServiceURL.hemo_record_change_complete.format(`${record.id}`), { completeTime });
  }

  addCosign(recordId: GUID | string, userId: GUID | string, password: string) {
    const cosign = {
      userId,
      password
    };
    return this.http.post<boolean>(this.API_URL + ServiceURL.hemo_record_cosign.format(`${recordId}`), cosign);
  }

  doctorConsent(recordId: GUID | string, approved: boolean = true) {
    if (approved) {
      return this.http.put(this.API_URL + ServiceURL.hemo_record_doctorconsent.format(`${recordId}`), null);
    }
    else {
      return this.http.put(this.API_URL + ServiceURL.hemo_record_doctorconsent_revoke.format(`${recordId}`), null);
    }
  }

  claim(recordId: GUID) {
    return this.http.put<void>(this.API_URL + ServiceURL.hemo_record_claim.format(recordId), {});
  }

  getHemoSheetList(patientId: string, pageNo: number, limit?: number, where?: string): Observable<PageView<HemosheetInfo>> {
    let params = new HttpParams;
    if (pageNo) {
      params = params.set('page', pageNo);
    }
    if (limit) {
      params = params.set('limit', limit);
    }
    if (where) {
      params = params.set('where', where);
    }
    return this.http.get<PageView<HemosheetInfo>>(this.API_URL + ServiceURL.hemo_record_getlist.format(encodeURIComponent(patientId)), { params }).pipe(
      map((page) => {
        page.data = page.data.map((item, i, list) => {
          const previous = list[i + 1]; // the list is sorted as descending
          if (!item.dehydration.lastPostWeight && previous) {
            const lastDehydration = new DehydrationCalculate(previous);
            item.dehydration.lastPostWeight = lastDehydration.postWeight?.round(AppConfig.config.decimalPrecision);
          }
          return item;
        });
        return page;
      })
    );
  }

  countRecords(patientId: string): Promise<{total: number; thisMonth: number}> {
    return this.http.get<{total: number; thisMonth: number}>(this.API_URL + ServiceURL.hemo_record_countinfo.format(encodeURIComponent(patientId))).toPromise();
  }

  getDialysisPrescriptionList(patientId: string): Observable<DialysisPrescriptionInfo[]> {
    return this.http.get<DialysisPrescriptionInfo[]>(this.API_URL + ServiceURL.hemo_prescription_getlist.format(encodeURIComponent(patientId)));
  }

  getDialysisPrescription(prescriptionId: GUID) {
    return this.http.get<DialysisPrescriptionInfo>(this.API_URL + ServiceURL.hemo_prescription_get.format(`${prescriptionId}`));
  }

  createDialysisPrescription(prescription: DialysisPrescription) {
    return this.http.post<DialysisPrescriptionInfo>(this.API_URL + ServiceURL.hemo_prescription_addnew, prescription);
  }

  editDialysisPrescription(prescription: DialysisPrescription) {
    return this.http.post<boolean>(this.API_URL + ServiceURL.hemo_prescription_edit.format(`${prescription.id}`), prescription);
  }

  deleteDialysisPrescription(prescription: DialysisPrescriptionInfo) {
    return this.http.delete(this.API_URL + ServiceURL.hemo_prescription_delete.format(`${prescription.id}`));
  }

  deleteHemosheet(hemosheet: HemosheetInfo) {
    return this.http.delete(this.API_URL + ServiceURL.hemo_record_delete.format(`${hemosheet.id}`));
  }

  updatePrescriptionNurse(recordId: GUID | string, userId: GUID | string, password: string) {
    const cosign = {
      userId,
      password
    };
    return this.http.post<boolean>(this.API_URL + ServiceURL.hemo_prescription_nurse.format(`${recordId}`), cosign);
  }

  assingSelfPrescriptionNurse(recordId: GUID | string) {
    return this.http.post<boolean>(this.API_URL + ServiceURL.hemo_prescription_nurse_self.format(`${recordId}`), {});
  }

  updateHemoNote(hemoId: GUID, hemoNote: HemoNote) {
    return this.http.post<HemoNote>(this.API_URL + ServiceURL.hemo_note_update.format(`${hemoId}`), hemoNote);
  }

  getSetting() {
    return this.http.get<HemoSetting.All>(this.API_URL + ServiceURL.hemo_setting);
  }

  setSetting(request: HemoSetting.All) {
    return this.http.put<void>(this.API_URL + ServiceURL.hemo_setting, request);
  }

  sendHemosheetPdf(hemoId: GUID) {
    return this.http.put(this.API_URL + ServiceURL.hemo_sendpdf.format(`${hemoId}`), null);
  }

  // ================== Utils =================

  async AddNewHemosheet(patient: PatientInfo, hemoData?: HemosheetInfo): Promise<Observable<Hemosheet>> {
    return new Promise(async (resolve) => {
      const prescription = await this.checkDialysisPrescription(patient);
      if (!prescription) {
        const alert = await this.alertCtl.create({
          header: 'Create Record Confirmation',
          message: 'There is no any dialysis prescription, are you sure you wish to proceed and create a record without prescription?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                resolve(null);
              }
            }, {
              text: 'Confirm',
              handler: async () => {
                resolve(await this.newHemoRecord(patient, hemoData));
              }
            }
          ]
        });

        await alert.present();
      }
      else {
        resolve(await this.newHemoRecord(patient, hemoData));
      }
    });

  }

  private async newHemoRecord(patient: PatientInfo, hemoData?: HemosheetInfo): Promise<Observable<Hemosheet>> {
    const loading = await this.loadingCtl.create({
      backdropDismiss: false
    });

    loading.present();
    return this.createNewHemoSheet(patient, hemoData).pipe(
      map(HemoDialysisService.processReadHemosheet),
      finalize(() => loading.dismiss()));
  }

  checkCanEdit(prescription: DialysisPrescriptionInfo): boolean {
    if (!prescription.isHistory) {
      return true;
    }
    return false;
  }

  calculateTreatmentCount(patient: Patient): Promise<[number, number]> {
    return new Promise<[number, number]>((resolve) => {
      this.countRecords(patient.id).then(count => {
        const thisMonth = count.thisMonth;
        const accu = patient.dialysisInfo.accumulatedTreatmentTimes || 0;
        const total = count.total + accu;
        resolve([thisMonth, total]);
      });
    });

  }

  calculateDehydration(hemosheet: HemosheetInfo): DehydrationCalculate {
    return new DehydrationCalculate(hemosheet);
  }

  setTmpPrescription(p: DialysisPrescription) {
    this.tmpPrescription = p;
  }

  getTmpPrescription(): DialysisPrescription {
    const p = this.tmpPrescription;
    this.tmpPrescription = null;
    return p;
  }

  setTmpHemosheet(h: HemosheetInfo) {
    this.tmpHemosheet = h;

  }

  getTmpHemosheet(): Hemosheet {
    const h = this.tmpHemosheet;
    this.tmpHemosheet = null;
    return HemoDialysisService.processReadHemosheet(h);
  }

  // -------------- Complete Hemosheet --------------

  async getCompleteHemosheetCallWithPrompt(
    record: HemosheetInfo,
    executionRecords: ExecutionRecord[] = null,
    setting: HemoSetting.All = null
    ): Promise<Observable<void>> {
    // warning if there is any unexecuted record
    const hasUnexecuted = executionRecords?.some(x => !x.isExecuted) ?? await firstValueFrom(this.checkUnexecuted(record));
    if (hasUnexecuted) {
      const warn = await this.alertCtl.create({
        backdropDismiss: true,
        header: 'Warning',
        subHeader: 'Unexecuted Record(s)',
        message:
        `There is one or more unexecuted record(s), do you really want to complete this hemosheet?
        (If you choose to continue, any unexecuted record will be automatically executed for you)`,
        buttons: [
          {
            text: 'Confirm',
            role: 'OK'
          },
          {
            text: 'Cancel'
          }
        ]
      });

      warn.present();
      const result = await warn.onDidDismiss();
      if (result.role !== 'OK') {
        return null;
      }
    }

    let completeTime = null;

    const canChangeCompleteTime =
      !(setting ?? await firstValueFrom(this.getSetting())).rules.changeCompleteTimePermissionRequired
      || this.auth.currentUser.checkPermissionLevel(Permissions.HeadNurseUp);

    if (canChangeCompleteTime) {
      const confirmation = await this.alertCtl.create({
        backdropDismiss: true,
        header: 'Confirmation',
        subHeader: `Complete time : now (${format(new Date(), 'hh:mm a, MMM dd yyyy')})`,
        message:
        `You do want to choose complete time manually?
        If no, system will sign current time (now) as a complete time for you.`,
        buttons: [
          {
            text: 'Confirm',
            role: 'OK'
          },
          {
            text: 'Pick Time manually',
            role: 'pick'
          }
        ]
      });
      confirmation.present();
      const confirm = await confirmation.onWillDismiss();
      if (confirm.role === 'pick') {
        const chooseTime = await this.pop.create({
          component: PickTimeComponent,
          id: 'pick-time',
          cssClass: ['hemo-popup', 'hemo-calendar']
        });
        chooseTime.present();
        const result = await chooseTime.onWillDismiss();
        if (!result.data) {
          return null;
        }
        completeTime = result.data as Date;
      }
      else if (confirm.role !== 'OK') {
        return null;
      }
    }

    // set complete time (just for FE marking as completed)
    record.completedTime = completeTime ?? new Date();

    return this.completeHemoSheet(record, completeTime);
  }

}




export class DehydrationCalculate {

  constructor(public hemosheet: HemosheetInfo) {}

  static preWeight(hemosheet: HemosheetInfo) {
    if (!hemosheet.dehydration.preTotalWeight) {
      return null;
    }
    return hemosheet.dehydration.preTotalWeight - hemosheet.dehydration.wheelchairWeight - hemosheet.dehydration.clothWeight;
  }

  get preWeight() {
    return DehydrationCalculate.preWeight(this.hemosheet);
  }

  static ufNet(hemosheet: HemosheetInfo) {
    if (!hemosheet.dialysisPrescription) {
      return null;
    }
    const dryWeight = hemosheet.dialysisPrescription.dryWeight ?? hemosheet.dialysisPrescription.excessFluidRemovalAmount;
    if (!dryWeight) {
      return null;
    }
    return DehydrationCalculate.preWeight(hemosheet) - dryWeight;
  }

  get ufNet() {
    return DehydrationCalculate.ufNet(this.hemosheet);
  }

  static ufEstimate(hemosheet: HemosheetInfo) {
    if (!DehydrationCalculate.ufNet(hemosheet)) {
      return null;
    }
    return DehydrationCalculate.ufNet(hemosheet) + 
    (hemosheet.dehydration.foodDrinkWeight ?? 0) +
    (hemosheet.dehydration.extraFluid ?? hemosheet.dialysisPrescription?.extraFluid ?? 0)*0.001 +
    (hemosheet.dehydration.bloodTransfusion ?? hemosheet.dialysisPrescription?.bloodTransfusion ?? 0)*0.001;
  }

  get ufEstimate() {
    return DehydrationCalculate.ufEstimate(this.hemosheet);
  }

  static postWeight(hemosheet: HemosheetInfo) {
    if (!hemosheet.dehydration.postTotalWeight) {
      return null;
    }
    return hemosheet.dehydration.postTotalWeight - hemosheet.dehydration.postWheelchairWeight - hemosheet.dehydration.clothWeight;
  }

  get postWeight() {
    return DehydrationCalculate.postWeight(this.hemosheet);
  }

  static actualWeightLoss(hemosheet: HemosheetInfo) {
    const cal = DehydrationCalculate.preWeight(hemosheet) - DehydrationCalculate.postWeight(hemosheet);
    if (cal > 0 && DehydrationCalculate.postWeight(hemosheet)) {
      return cal;
    }
    return null;
  }

  get actualWeightLoss() {
    return DehydrationCalculate.actualWeightLoss(this.hemosheet);
  }

  static idwg(hemosheet: HemosheetInfo) {
    const cal = DehydrationCalculate.preWeight(hemosheet) - hemosheet.dehydration.lastPostWeight;
    if (cal > 0) { return cal; }
    return null;
  }

  get idwg() {
    return DehydrationCalculate.idwg(this.hemosheet);
  }
}

export const HemosheetResolver: ResolveFn<Hemosheet> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      const hemoService = inject(HemoDialysisService);
      const fromTmp = hemoService.getTmpHemosheet();
      if (fromTmp) {
        return fromTmp;
      }
      
      let id = guid(route.paramMap.get('hemosheetId'));
      return hemoService.getHemosheet(id);
    };