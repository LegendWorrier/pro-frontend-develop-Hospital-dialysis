import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceBase } from './../share/service/service-base';
import { Injectable } from '@angular/core';
import { ServiceURL } from '../service-url';
import { TableResult } from './table-result';
import { StatInfo } from './stat/stat-info';
import { StatItem } from './stat-item';

@Injectable({
  providedIn: 'root'
})
export class StatService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http);
  }

  getStat(stat: string, duration: string, pointOfTime?: Date, patientId?: string, unitId?: number): Observable<TableResult<any>> {
    switch (stat) {
      case 'assessment':
        return this.getAssessmentStat(duration, pointOfTime, patientId, unitId);
      case 'dialysis':
        return this.getDialysisStat(duration, pointOfTime, patientId, unitId);
      case 'lab':
        return this.getLabStat(duration, pointOfTime, unitId);

      default:
        return this.getCustomStat(stat, duration, pointOfTime, patientId, unitId);
    }
  }

  getAssessmentStat(duration: string, pointOfTime?: Date, patientId?: string, unitId?: number): Observable<TableResult<number>> {
    let params = new HttpParams({ fromObject: { duration } });
    if (pointOfTime) {
      params = params.set('pointOfTime', `${pointOfTime.toISOString()}`);
    }
    if (unitId) {
      params = params.set('unitId', unitId);
    }

    return this.http.get<TableResult<number>>(this.API_URL + ServiceURL.stat_assessment + (patientId? `/${encodeURIComponent(patientId)}` : ''), { params });
  }

  getDialysisStat(duration: string, pointOfTime?: Date, patientId?: string, unitId?: number): Observable<TableResult<StatInfo>> {
    let params = new HttpParams({ fromObject: { duration } });
    if (pointOfTime) {
      params = params.set('pointOfTime', `${pointOfTime.toISOString()}`);
    }
    if (unitId) {
      params = params.set('unitId', unitId);
    }

    return this.http.get<TableResult<StatInfo>>(this.API_URL + ServiceURL.stat_dialysis + (patientId? `/${encodeURIComponent(patientId)}` : ''), { params });
  }

  getLabStat(duration: string, pointOfTime?: Date, unitId?: number): Observable<TableResult<StatInfo>> {
    let params = new HttpParams({ fromObject: { duration } });
    if (pointOfTime) {
      params = params.set('pointOfTime', `${pointOfTime.toISOString()}`);
    }
    if (unitId) {
      params = params.set('unitId', unitId);
    }

    return this.http.get<TableResult<StatInfo>>(this.API_URL + ServiceURL.stat_lab, { params });
  }

  getCustomStatList() {
    return this.http.get<StatItem[]>(this.API_URL + ServiceURL.stat_custom_getlist);
  }

  getCustomStat(stat: string, duration: string, pointOfTime?: Date, patientId?: string, unitId?: number) {
    let params = new HttpParams({ fromObject: { duration } });
    if (pointOfTime) {
      params = params.set('pointOfTime', `${pointOfTime.toISOString()}`);
    }
    if (unitId) {
      params = params.set('unitId', unitId);
    }

    let url = patientId ? 
      ServiceURL.stat_custom_patient.format(stat, encodeURIComponent(patientId)) : 
      ServiceURL.stat_custom.format(stat);

    return this.http.get<TableResult<any>>(this.API_URL + url, { params });
  }
}
