import { PageView } from './../share/page-view';
import { GUID } from './../share/guid';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceURL } from '../service-url';
import { ServiceBase } from '../share/service/service-base';
import { AdmissionInfo } from './admission';

@Injectable({
  providedIn: 'root'
})
export class AdmissionService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http);
  }

  getActiveAdmit(patientId: string): Observable<AdmissionInfo> {
    return this.http.get<AdmissionInfo>(this.API_URL + ServiceURL.admission_get_active.format(encodeURIComponent(patientId)));
  }

  getAllForPatient(patientId: string, page: number = 1, limit: number = 20): Observable<PageView<AdmissionInfo>> {
    const params = new HttpParams({ fromObject: { page: `${page}`, limit: `${limit}` } });
    return this.http.get<PageView<AdmissionInfo>>(this.API_URL + ServiceURL.admission_get_patient.format(encodeURIComponent(patientId)), {params});
  }

  getAdmit(id: GUID): Observable<AdmissionInfo> {
    return this.http.get<AdmissionInfo>(this.API_URL + ServiceURL.admission_get.format(id));
  }

  addAdmit(admit: AdmissionInfo): Observable<any> {
    return this.http.post(this.API_URL + ServiceURL.admission_add, admit);
  }

  updateAdmit(id: GUID, admit: AdmissionInfo): Observable<any> {
    return this.http.post(this.API_URL + ServiceURL.admission_edit.format(id), admit);
  }

  deleteAdmit(id: GUID): Observable<any> {
    return this.http.delete(this.API_URL + ServiceURL.admission_delete.format(id));
  }
}
