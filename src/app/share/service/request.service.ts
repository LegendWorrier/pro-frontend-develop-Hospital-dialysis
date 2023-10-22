import { ScheduleSection } from './../../schedule/section';
import { GUID } from 'src/app/share/guid';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './service-base';
import { Injectable } from '@angular/core';
import { SlotView } from 'src/app/schedule/schedule-view';
import { ServiceURL } from 'src/app/service-url';
import { PatientInfo } from 'src/app/patients/patient-info';
import { SectionSlots } from 'src/app/enums/section-slots';
import { UserInfo } from 'src/app/auth/user-info';

@Injectable({
  providedIn: 'root'
})
export class RequestService extends ServiceBase {

  constructor(http: HttpClient) { super(http) }

  requestTemporaryTransfer(patient: PatientInfo, slotView: SlotView, date: Date, overrideUnitId?: number, originalDate?: Date, targetPatientId?: string) {
    const body = {
      date,
      overrideUnitId,
      originalDate,
      targetPatientId
    };
    return this.http.post<void>
    (this.API_URL + ServiceURL.request_transfer_temp.format(slotView.sectionId.toString(), slotView.slot.toString(), patient.id)
    , body);
  }

  requestTransfer(patientId: string, slot: SlotView, targetSection: ScheduleSection, targetSlot: SectionSlots) {
    
    const body = { sectionId: targetSection.id, slot: targetSlot, unitId: targetSection.unitId };
    return this.http.post<void>(this.API_URL + ServiceURL.request_transfer.format(slot.sectionId.toString(), slot.slot.toString(), patientId), body);
  }

  requestCosignExe(id: GUID, userId: GUID) {
    const body = { userId: userId };
    return this.http.post<void>(this.API_URL + ServiceURL.request_cosign_exe.format(id), body);
  }

  requestCosignHemo(hemoId: GUID, userId: GUID) {
    const body = { userId: userId };
    return this.http.post<void>(this.API_URL + ServiceURL.request_cosign_hemo.format(hemoId), body);
  }

  requestNursePrescription(prescriptionId: GUID, userId: GUID) {
    const body = { userId: userId };
    return this.http.post<void>(this.API_URL + ServiceURL.request_prescription_nurse.format(prescriptionId), body);
  }

  // ---------------------------

  requestInfo(id: GUID) {
    return this.http.get<RequestInfo>(this.API_URL + ServiceURL.request_get.format(`${id}`));
  }

  approveRequest(id: GUID) {
    return this.http.post<string>(this.API_URL + ServiceURL.request_approve.format(`${id}`), {}, { responseType: 'text' as 'json'});
  }

  denyRequest(id: GUID) {
    return this.http.post<string>(this.API_URL + ServiceURL.request_approve.format(`${id}`), {}, { params: { deny: true }, responseType: 'text' as 'json' });
  }

}

export interface RequestInfo {
  id: GUID;
  requester: GUID;
  approver?: GUID;
  targetUnitId?: number;
  extraNotifyUnitId?: number;
  extraNotifyRole: string;

  requestArgs: string[];
  notificationId: GUID;

  type: string;

  // extra info
  [key: string]: any;
}
