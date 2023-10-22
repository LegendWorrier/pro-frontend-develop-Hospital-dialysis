import { Observable } from 'rxjs';
import { PatientInfo } from 'src/app/patients/patient-info';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HemosheetInfo } from 'src/app/dialysis/hemosheet-info';

@Injectable({
  providedIn: 'root'
})
export class HisService {

  constructor(private http: HttpClient) { }

  getPatientByHN(hn: string): Observable<PatientInfo> {
    let params = new HttpParams();
    params = params.set('hn', hn);
    return this.http.get<PatientInfo>('/api/his/get-patient-by-hn', { params } );
  }

  sendHemoData(hemosheet: HemosheetInfo): Observable<boolean> {
    return this.http.post<boolean>('/api/his/send-hemo', hemosheet);
  }
}
