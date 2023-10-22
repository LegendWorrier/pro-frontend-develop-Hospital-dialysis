import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PrettyPipe } from '../pipes/pretty.pipe';
import { ServiceURL } from '../service-url';
import { ServiceBase } from '../share/service/service-base';
import { AvShunt } from './av-shunt';
import { AvShuntIssueTreatment } from './av-shunt-issue-treatment';

@Injectable({
  providedIn: 'root'
})
export class AvShuntService extends ServiceBase {

  constructor(http: HttpClient, private pretty: PrettyPipe) {
    super(http);
  }

  private readonly shuntSiteNameMaps = {
    jugular: 'IJV',
    subcravian: 'SJV',
    'upper-arm': 'Upper Arm',
    forearm: 'Forearm',
    femoral: 'Femoral Vein',
    thigh: 'Thigh',
    calf: 'Calf'
  };

  getAvShuntView(patientId: string): Observable<{ avShunts: AvShunt[], issueTreatments: AvShuntIssueTreatment[] }> {
    return this.http.get<{avShunts: AvShunt[], issueTreatments: AvShuntIssueTreatment[]}>
    (this.API_URL + ServiceURL.avshunt_getview.format(encodeURIComponent(patientId)));
  }

  getAvShuntList(patientId: string): Observable<AvShunt[]> {
    return this.http.get<AvShunt[]>(this.API_URL + ServiceURL.avshunt_getlist.format(encodeURIComponent(patientId)));
  }

  createAvShunt(avShunt: AvShunt) {
    return this.http.post<AvShunt>(this.API_URL + ServiceURL.avshunt_addnew.format(encodeURIComponent(avShunt.patientId)), avShunt);
  }

  editAvShunt(avShunt: AvShunt) {
    return this.http.post(this.API_URL + ServiceURL.avshunt_edit.format(`${avShunt.id}`), avShunt);
  }

  deleteAvShunt(avShunt: AvShunt) {
    return this.http.delete(this.API_URL + ServiceURL.avshunt_delete.format(`${avShunt.id}`));
  }

  createAvIssue(issue: AvShuntIssueTreatment) {
    return this.http.post<AvShuntIssueTreatment>(this.API_URL + ServiceURL.avissue_addnew.format(encodeURIComponent(issue.patientId)), issue);
  }

  editAvIssue(issue: AvShuntIssueTreatment) {
    return this.http.post(this.API_URL + ServiceURL.avissue_edit.format(`${issue.id}`), issue);
  }

  deleteAvIssue(issue: AvShuntIssueTreatment) {
    return this.http.delete(this.API_URL + ServiceURL.avissue_delete.format(`${issue.id}`));
  }
  getAvShuntSiteName(avShunt: AvShunt) {
    return this.pretty.transform(avShunt.catheterType) +
    ' / ' + this.pretty.transform(avShunt.side) +
    ' / ' + this.pretty.transform(this.shuntSiteNameMaps[avShunt.shuntSite]);
  }

}
