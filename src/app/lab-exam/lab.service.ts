import { LabItem } from 'src/app/masterdata/labItem';
import { map } from 'rxjs/operators';
import { LabResult } from './lab-result';
import { PatientInfo } from './../patients/patient-info';
import { Observable } from 'rxjs';
import { ServiceURL } from './../service-url';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceBase } from './../share/service/service-base';
import { Injectable } from '@angular/core';
import { CreateLabExam, LabExamInfo, LabHemosheetInfo } from './lab-exam';
import { format } from 'date-fns';
import { Gender } from '../enums/gender';
import { LabOverviewList } from './lab-overview-list';
import { GUID } from '../share/guid';

@Injectable({
  providedIn: 'root'
})
export class LabService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Not implemented yet.
   */
  getAllLabExam() {
    // lab_getall: '/api/Lab',
    
  }

  getLabOverviewForAllPatient(page: number, limit?: number, orderBy?: string[], where?: string): Observable<LabOverviewList> {
    let params = new HttpParams({ fromObject: { page: `${page}` } });
    if (limit) {
      params = params.set('limit', `${limit}`);
    }

    if (orderBy) {
      orderBy.forEach(item => {
        params.append('orderBy', item);
      });
    }

    if (where) {
      params = params.set('where', where);
    }
    
    return this.http.get<LabOverviewList>(this.API_URL + ServiceURL.lab_getoverview, { params });
  }

  getAllLabExamByPatient(patient: PatientInfo, filter: Date, upperLimit: Date): Observable<LabResult> {
    const filterDate = new Date(filter);
    filterDate.setHours(0,0,0,0);
    const upperD = new Date(upperLimit);
    upperD.setHours(0,0,0,0);
    let params = new HttpParams({ fromObject: { filter: `${filterDate.getTime()}` } });
    if (upperLimit) {
      params = params.set('upperLimit', `${upperD.getTime()}`);
    }
    return this.http.get<LabResult>(this.API_URL + ServiceURL.lab_getlist.format(encodeURIComponent(patient.id)), { params });
  }
  
  getLabExam(id: GUID): Observable<LabExamInfo> {
    return this.http.get<LabExamInfo>(this.API_URL + ServiceURL.lab_get.format(`${id}`));
  }

  updateLabExam(item: LabExamInfo): Observable<LabExamInfo> {
    return this.http.post<LabExamInfo>(this.API_URL + ServiceURL.lab_edit.format(`${item.id}`), item);
  }

  addLabExam(patient: PatientInfo, entryTime: Date, items: CreateLabExam[]): Observable<LabExamInfo[]> {
    return this.http.post<LabExamInfo[]>(this.API_URL + ServiceURL.lab_addnew, {
      patientId: patient.id,
      entryTime: entryTime,
      labExams: items
    });
  }

  deleteLabExam(item: LabExamInfo): Observable<boolean> {
    return this.http.delete<boolean>(this.API_URL + ServiceURL.lab_delete.format(`${item.id}`));
  }

  getLabHemosheetList() {
    return this.http.get<LabHemosheetInfo[]>(this.API_URL + ServiceURL.lab_hemosheet_getall);
  }

  addOrUpdateLabHemosheetList(list: LabHemosheetInfo[]) {
    const body =  {
      list: list
    };
    return this.http.post<void>(this.API_URL + ServiceURL.lab_hemosheet_update, body);
  }

  // --------------------------- util -------------------------
  getLimits(item: LabItem, patient: PatientInfo) {
    let lowerLimit = item.lowerLimit;
    let upperLimit = item.upperLimit;

    if (patient.gender === Gender.Male) {
      lowerLimit = item.lowerLimitM || lowerLimit;
      upperLimit = item.upperLimitM || upperLimit;
    }
    else if(patient.gender === Gender.Female) {
      lowerLimit = item.lowerLimitF || lowerLimit;
      upperLimit = item.upperLimitF || upperLimit;
    }

    return { lower: lowerLimit, upper: upperLimit };
  }

  generateExcelForPatientLab(patient: PatientInfo, filter: Date, extra: LabResult): Observable<{file:Blob, filename:string}> {
    const filterDate = new Date(filter);
    filterDate.setHours(0,0,0,0);
    let params = { filter: `${filterDate.getTime()}` }
    return this.http.post(this.API_URL + ServiceURL.lab_generate_excel.format(encodeURIComponent(patient.id)), extra, 
    {
      params,
      responseType: 'blob'
    }).pipe(map(x => { return { file: x, filename: this.getFileName() } }));
  }

  private getFileName() {
    return 'labexam-' + format(new Date(), 'yyyyMMddHHmm');
  }

  // =========== Business Logic ==========================

  static bun: string = 'BUN';

  calculateSystemBound(lab: LabResult): LabResult {
    return lab;
    // Moved logic to server side
  }

}
