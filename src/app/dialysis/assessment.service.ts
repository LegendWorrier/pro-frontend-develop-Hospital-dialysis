import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceURL } from '../service-url';
import { ServiceBase } from '../share/service/service-base';
import { AssessmentInfo, AssessmentItem, AssessmentGroupInfo } from './assessment';
import { HemosheetInfo } from './hemosheet-info';
import { GUID } from '../share/guid';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService extends ServiceBase {

  // ================= Event =======================

  assessmentUpdate: EventEmitter<AssessmentItem[]> = new EventEmitter<AssessmentItem[]>();

  // ================================================

  constructor(http: HttpClient) {
    super(http);
  }

  getAll(): Observable<AssessmentInfo[]> {
    return this.http.get<AssessmentInfo[]>(this.API_URL + ServiceURL.assessment_getall)
            .pipe(map((data: AssessmentInfo[]) => {
              for (let i = 0; i < data.length; i++) {
                const element = data[i];
                element.optionsList = element.optionsList?.sort((x,y) => x.order - y.order);
              }
              return data;
            }));
  }

  removeAssessment(assessment: AssessmentInfo) {
    return this.http.delete<void>(this.API_URL + ServiceURL.assessment_delete.format(assessment.id.toString()));
  }

  addAssessment(assessment: AssessmentInfo) {
    return this.http.post<AssessmentInfo>(this.API_URL + ServiceURL.assessment_addnew, assessment);
  }

  updateAssessment(assessment: AssessmentInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.assessment_edit.format(assessment.id.toString()), assessment);
  }

  reorder(first: AssessmentInfo, second: AssessmentInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.assessment_reorder.format(first.id.toString(), second.id.toString()), null);
  }


  getAllGroups(): Observable<AssessmentGroupInfo[]> {
    return this.http.get<AssessmentGroupInfo[]>(this.API_URL + ServiceURL.assessment_group_getall);
  }

  removeGroup(assessment: AssessmentGroupInfo) {
    return this.http.delete<void>(this.API_URL + ServiceURL.assessment_group_delete.format(assessment.id.toString()));
  }

  addGroup(assessment: AssessmentGroupInfo) {
    return this.http.post<AssessmentGroupInfo>(this.API_URL + ServiceURL.assessment_group_addnew, assessment);
  }

  updateGroup(assessment: AssessmentGroupInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.assessment_group_edit.format(assessment.id.toString()), assessment);
  }

  reorderGroup(first: AssessmentGroupInfo, second: AssessmentGroupInfo) {
    return this.http.post<void>(this.API_URL + ServiceURL.assessment_group_reorder.format(first.id.toString(), second.id.toString()), null);
  }


  getItems(hemosheet: HemosheetInfo | GUID): Observable<AssessmentItem[]> {
    const id = typeof hemosheet === 'string' ? hemosheet : (hemosheet as HemosheetInfo).id;
    return this.http.get<AssessmentItem[]>(this.API_URL + ServiceURL.assessment_item_getlist.format(`${id}`));
  }

  addOrUpdateItems(hemosheet: HemosheetInfo, items: AssessmentItem[]): Observable<AssessmentItem[]> {
    return this.http.post<AssessmentItem[]>(this.API_URL + ServiceURL.assessment_item_update.format(`${hemosheet.id}`), items);
  }

  deleteItem(item: AssessmentItem) {
    return this.http.delete<void>(this.API_URL + ServiceURL.assessment_item_delete.format(`${item.id}`));
  }

  // =========== Root Admin Only =============
  import(data: Blob) {
    const body = new FormData;
    body.append('data', data);
    return this.http.post<void>(this.API_URL + ServiceURL.assessment_import, body);
  }

  export() {
    return this.http.get(this.API_URL + ServiceURL.assessment_export, { responseType: 'blob' });
  }


}
