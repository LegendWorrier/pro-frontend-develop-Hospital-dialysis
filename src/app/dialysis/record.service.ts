import { RequestService } from './../share/service/request.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GUID } from 'src/app/share/guid';
import { EventEmitter, Injectable, Injector } from '@angular/core';
import { LoadingController, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { AuthService } from '../auth/auth.service';
import { MedicinePrescription, MedicinePrescriptionInfo } from '../patients/medicine-prescription';
import { ServiceURL } from '../service-url';
import { ServiceBase } from '../share/service/service-base';
import { presentToast } from '../utils';
import { CosignRequestPopupComponent } from './components/cosign-request-popup/cosign-request-popup.component';
import { ExecutePromtPopupComponent } from './components/execute-promt-popup/execute-promt-popup.component';
import { DialysisRecordInfo } from './dialysis-record';
import { DoctorRecordInfo } from './doctor-record';
import { ExecutionRecord, ExecutionType, MedicineRecord } from './execution-record';
import { HemosheetInfo } from './hemosheet-info';
import { NurseRecordInfo } from './nurse-record';
import { ProgressNoteInfo } from './progress-note';
import { processProgressNote } from './progress-note-util';

@Injectable({
  providedIn: 'root'
})
export class RecordService extends ServiceBase {

  // ================= Event =======================

  dialysisRecordUpdate: EventEmitter<DialysisRecordInfo[]> = new EventEmitter<DialysisRecordInfo[]>();
  nurseRecordUpdate: EventEmitter<NurseRecordInfo[]> = new EventEmitter<NurseRecordInfo[]>();
  progressNotesUpdate: EventEmitter<ProgressNoteInfo[]> = new EventEmitter<ProgressNoteInfo[]>();
  doctorRecordUpdate: EventEmitter<DoctorRecordInfo[]> = new EventEmitter<DoctorRecordInfo[]>();
  executionRecordUpdate: EventEmitter<ExecutionRecord[]> = new EventEmitter<ExecutionRecord[]>();

  // ================================================
  
  constructor(http: HttpClient, 
    private auth: AuthService,
    private request: RequestService,
    private popupCtl: PopoverController,
    private loadingCtl: LoadingController,
    private injector: Injector
    ) {
    super(http);
  }
  // =============== dialysis =====================
  getDialysisRecords(hemosheet: HemosheetInfo | GUID): Observable<DialysisRecordInfo[]> {
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<DialysisRecordInfo[]>(this.API_URL + ServiceURL.hemo_record_dialysis_getlist.format(`${id}`));
  }

  getDialysisRecordUpdate(hemosheet: HemosheetInfo | GUID, lastTimestamp: Date, lastMachineTimestamp: Date): Observable<DialysisRecordInfo[]> {
    var params = new HttpParams;
    if (lastTimestamp) {
      params = params.set('last_data', lastTimestamp.toISOString());
    }
    if (lastMachineTimestamp) {
      params = params.set('last_machine_data', lastMachineTimestamp.toISOString());
    }
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<DialysisRecordInfo[]>(this.API_URL + ServiceURL.hemo_record_dialysis_updatelist
      .format(`${id}`), { params });
  }

  getMachineUpdate(hemosheet: HemosheetInfo | GUID, lastTimestamp: Date = null): Observable<DialysisRecordInfo[]> {
    var param = new HttpParams;
    if (lastTimestamp) {
      param = param.set('last_data', lastTimestamp.toISOString());
    }
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<DialysisRecordInfo[]>(this.API_URL + ServiceURL.hemo_record_dialysis_machine_update.format(`${id}`), {
      params: param
    });
  }

  getDialysisRecord(id: GUID) {
    return this.http.get<DialysisRecordInfo>(this.API_URL + ServiceURL.hemo_record_dialysis_get.format(`${id}`));
  }

  createDialysisRecord(record: DialysisRecordInfo, copyToNurse: boolean = false): Observable<{dilaysis: DialysisRecordInfo, nurse: NurseRecordInfo}> {
    var param = { copyToNurse: copyToNurse };
    return this.http.post<{dilaysis: DialysisRecordInfo, nurse: NurseRecordInfo}>(this.API_URL + ServiceURL.hemo_record_dialysis_addnew
      , record, { params: param });
  }

  updateDialysisRecord(record: DialysisRecordInfo): Observable<DialysisRecordInfo> {
    return this.http.post<DialysisRecordInfo>(this.API_URL + ServiceURL.hemo_record_dialysis_edit.format(`${record.id}`), record);
  }

  deleteDialysisRecord(record: DialysisRecordInfo) {
    return this.http.delete(this.API_URL + ServiceURL.hemo_record_dialysis_delete.format(`${record.id}`));
  }

  // =============== nurse =====================
  getNurseRecords(hemosheet: HemosheetInfo | GUID): Observable<NurseRecordInfo[]> {
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<NurseRecordInfo[]>(this.API_URL + ServiceURL.hemo_record_nurse_getlist.format(`${id}`));
  }

  getNurseRecord(record: NurseRecordInfo) {
    return this.http.get<NurseRecordInfo>(this.API_URL + ServiceURL.hemo_record_nurse_get.format(`${record.id}`));
  }

  createNurseRecord(record: NurseRecordInfo): Observable<NurseRecordInfo> {
    return this.http.post<NurseRecordInfo>(this.API_URL + ServiceURL.hemo_record_nurse_addnew, record);
  }

  updateNurseRecord(record: NurseRecordInfo): Observable<NurseRecordInfo> {
    return this.http.post<NurseRecordInfo>(this.API_URL + ServiceURL.hemo_record_nurse_edit.format(`${record.id}`), record);
  }

  deleteNurseRecord(record: NurseRecordInfo) {
    return this.http.delete(this.API_URL + ServiceURL.hemo_record_nurse_delete.format(`${record.id}`));
  }
  // =============== doctor =====================
  getDoctorRecords(hemosheet: HemosheetInfo | GUID): Observable<DoctorRecordInfo[]> {
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<DoctorRecordInfo[]>(this.API_URL + ServiceURL.hemo_record_doctor_getlist.format(`${id}`));
  }

  getDoctorRecord(record: DoctorRecordInfo) {
    return this.http.get<DoctorRecordInfo>(this.API_URL + ServiceURL.hemo_record_doctor_get.format(`${record.id}`));
  }

  createDoctorRecord(record: DoctorRecordInfo): Observable<DoctorRecordInfo> {
    return this.http.post<DoctorRecordInfo>(this.API_URL + ServiceURL.hemo_record_doctor_addnew, record);
  }

  updateDoctorRecord(record: DoctorRecordInfo): Observable<DoctorRecordInfo> {
    return this.http.post<DoctorRecordInfo>(this.API_URL + ServiceURL.hemo_record_doctor_edit.format(`${record.id}`), record);
  }

  deleteDoctorRecord(record: DoctorRecordInfo) {
    return this.http.delete(this.API_URL + ServiceURL.hemo_record_doctor_delete.format(`${record.id}`));
  }

  // =============== progress note =====================
  getProgressNoteRecords(hemosheet: HemosheetInfo | GUID): Observable<ProgressNoteInfo[]> {
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<ProgressNoteInfo[]>(this.API_URL + ServiceURL.hemo_record_progress_note_getlist.format(`${id}`))
                    .pipe(map(x => x.map(processProgressNote)));
  }

  getProgressNote(record: ProgressNoteInfo) {
    return this.http.get<ProgressNoteInfo>(this.API_URL + ServiceURL.hemo_record_progress_note_get.format(`${record.id}`))
                    .pipe(map(processProgressNote));
  }

  createProgressNote(record: ProgressNoteInfo): Observable<ProgressNoteInfo> {
    return this.http.post<ProgressNoteInfo>(this.API_URL + ServiceURL.hemo_record_progress_note_addnew, record);
  }

  updateProgressNote(record: ProgressNoteInfo): Observable<ProgressNoteInfo> {
    return this.http.post<ProgressNoteInfo>(this.API_URL + ServiceURL.hemo_record_progress_note_edit.format(`${record.id}`), record);
  }

  deleteProgressNote(record: ProgressNoteInfo) {
    return this.http.delete(this.API_URL + ServiceURL.hemo_record_progress_note_delete.format(`${record.id}`));
  }

  swapProgressNote(first: ProgressNoteInfo, second: ProgressNoteInfo) {
    return this.http.put<void>(this.API_URL + ServiceURL.hemo_record_progress_note_swap.format(`${first.id}`, `${second.id}`), {});
  }

  // =============== execution record =====================
  getExecutionRecords(hemosheet: HemosheetInfo | GUID): Observable<ExecutionRecord[]> {
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<ExecutionRecord[]>(this.API_URL + ServiceURL.hemo_record_execution_getlist.format(`${id}`))
    .pipe(map(RecordService.processReadExecutionData));
  }
  getExecutionRecord(id: GUID) {
    return this.http.get<ExecutionRecord>(this.API_URL + ServiceURL.hemo_record_execution_get.format(id))
    .pipe(map(RecordService.processReadExecution));
  }
  createNewMedicineRecords(hemosheet: HemosheetInfo, prescriptions: MedicinePrescriptionInfo[]): Observable<ExecutionRecord[]> {
    const params = { timezone: AppConfig.config.timeZoneId };
    const body = { prescriptions: prescriptions.map(x => x.id) };
    return this.http.post<ExecutionRecord[]>(
      this.API_URL + ServiceURL.hemo_record_execution_addnew_medicines.format(`${hemosheet.id}`),
      body, { params });
  }
  createNewExecutionRecord(hemosheet: HemosheetInfo, record: ExecutionRecord) {
    return this.http.post<ExecutionRecord>(this.API_URL + ServiceURL.hemo_record_execution_addnew.format(`${hemosheet.id}`), record);
  }
  updateExecutionRecord(record: ExecutionRecord, type: ExecutionType) {
    const body = Object.assign({ type }, record);
    return this.http.post<ExecutionRecord>(this.API_URL + ServiceURL.hemo_record_execution_update.format(`${record.id}`), body);
  }
  executeRecord(record: ExecutionRecord, timestamp?: Date) {
    const body = { timestamp: timestamp };
    return this.http.post<ExecutionRecord>(this.API_URL + ServiceURL.hemo_record_execution_execute.format(`${record.id}`), body);
  }
  deleteRecord(record: ExecutionRecord) {
    return this.http.delete<any>(this.API_URL + ServiceURL.hemo_record_execution_delete.format(`${record.id}`));
  }

  requestCosign(recordId: GUID, userId: GUID, password: string) {
    return this.http.post<boolean>(this.API_URL + ServiceURL.hemo_record_execution_cosign.format(`${recordId}`), { userId: userId, password: password });
  }

  claim(recordId: GUID) {
    return this.http.put<void>(this.API_URL + ServiceURL.hemo_record_execution_claim.format(recordId), {});
  }

  // =================== Utils =========================

  private static processReadExecutionData(data: ExecutionRecord[]): ExecutionRecord[] {
    return data.map(x =>  {
      return RecordService.processReadExecution(x);
    });
  }

  private static processReadExecution(data: ExecutionRecord): ExecutionRecord {
    if (data.type === ExecutionType.Medicine) {
      (data as MedicineRecord).prescription = Object.assign(new MedicinePrescription, (data as MedicineRecord).prescription);
    }

    return data;
  }

  checkCanExecute(item: ExecutionRecord) {
    return !item.isExecuted && item.createdBy === this.auth.currentUser.id;
  }

  async executeWithPromt(record: ExecutionRecord) {
    return await new Promise<boolean>(async (resolve) => {
      const popup = await this.popupCtl.create({
        component: ExecutePromtPopupComponent,
        componentProps: { record: record },
        backdropDismiss: true,
        showBackdrop: true,
        cssClass: 'hemo-calendar'
      });
      popup.present();
      const result = await popup.onWillDismiss();
      if (result.role === 'OK') {
        const loading = await this.loadingCtl.create({
          backdropDismiss: false,
          spinner: 'circles'
        });
        loading.present();
        this.executeRecord(record, result.data)
        .pipe(finalize(() => loading.dismiss()))
        .subscribe({
          next: (result) => {
            record.updatedBy = result.updatedBy;
            record.updated = result.updated;
            record.timestamp = result.timestamp;
            record.isExecuted = true;
  
            presentToast(this.injector, {
              message: 'Executed.',
              native: true
            });
            resolve(true);
          },
          error: (err) => {
            console.log(err);
            presentToast(this.injector, {
              message: 'There is en error occured. Please try again.',
              native: true
            });
            resolve(false);
          }
        });
        
      }
      else {
        resolve(false);
      }
    });
  }

  async requestCosignPromt(record: ExecutionRecord, unitId: number) {
    return await new Promise<boolean>(async (resolve) => {
      const call$ = (id, userId, password) => this.requestCosign(id, userId, password);
      const requestCall$ = (id, userId) => this.request.requestCosignExe(id, userId);
      const popup = await this.popupCtl.create({
        component: CosignRequestPopupComponent,
        componentProps: { resource: record, unitId: unitId, setCosignCall: call$, requestCosignCall: requestCall$, label: 'Co-signer' },
        backdropDismiss: true,
        showBackdrop: true
      });
      popup.present();
      const result = await popup.onWillDismiss();
      if (result.role === 'OK') {
        record.coSign = result.data;
        resolve(true);
      }
      else {
        resolve(false);
      }
    });
  }
  
}
