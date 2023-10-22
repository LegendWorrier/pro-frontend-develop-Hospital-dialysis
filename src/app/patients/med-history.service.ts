import { Injectable } from '@angular/core';
import { ServiceBase } from '../share/service/service-base';
import { HttpClient } from '@angular/common/http';
import { PatientInfo } from './patient-info';
import { ServiceURL } from '../service-url';
import { CreateMedDetail, MedHistoryItemInfo, MedHistoryResult, MedOverview } from './med-history';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedHistoryService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Not implemented yet.
   */
  getAllMedHistory() {
    // med_history_getall: '/api/MedHistory',
    
  }

  getMedOverview(patient: PatientInfo) {
    const call$ = this.http.get<MedOverview>(this.API_URL + ServiceURL.med_history_getoverview.format(encodeURIComponent(patient.id)));
    return call$;
  }

  getMedHistoryDetail(patient: PatientInfo, filterDate: Date, upperLimit: Date) {
    const call$ = this.http.get<MedHistoryResult>(this.API_URL + ServiceURL.med_history_getdetail.format(encodeURIComponent(patient.id)));
    return call$;
  }

  getMed(id: number) {
    const call$ = this.http.get<MedHistoryResult>(this.API_URL + ServiceURL.med_history_get.format(id.toString()));
    return call$;
  }

  addMedDetail(patient: PatientInfo, entryTime: Date, items: CreateMedDetail[]): Observable<MedHistoryItemInfo[]> {
    return this.http.post<MedHistoryItemInfo[]>(this.API_URL + ServiceURL.med_history_addnew, {
      patientId: patient.id,
      entryTime: entryTime,
      meds: items
    });
  }

  updateMedDetail(med: MedHistoryItemInfo) {
    return this.http.post<MedHistoryItemInfo>(this.API_URL + ServiceURL.med_history_edit.format(med.id.toString()), med);
  }

  deleteMedDetail(med: MedHistoryItemInfo): Observable<boolean> {
    return this.http.delete<boolean>(this.API_URL + ServiceURL.med_history_delete.format(`${med.id}`));
  }


}
