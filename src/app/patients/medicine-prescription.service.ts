import { HttpClient } from '@angular/common/http';
import { GUID } from 'src/app/share/guid';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { UsageWays } from '../masterdata/medicine';
import { ServiceURL } from '../service-url';
import { ServiceBase } from '../share/service/service-base';
import { EditMedicinePrescription, Frequency, MedicinePrescription, MedicinePrescriptionInfo } from './medicine-prescription';
import { PatientInfo } from './patient-info';

@Injectable({
  providedIn: 'root'
})
export class MedicinePrescriptionService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http);
    // TODO: load localized mapping
  }

  allRoutes = Object.keys(UsageWays)
                .filter(key => !isNaN(Number(UsageWays[key])))
                .map(x => ({ key: x, value: UsageWays[x] }));
  mapRoute = {
    PO: 'PO - Oral',
    SL: 'SL - Sublingual',
    SC: 'SC - Subcutaneous injection',
    IV: 'IV - Intravenous injection',
    IM: 'IM - Intramuscular injection',
    IVD: 'IVD - Intravenous addition',
    TOPI: 'TOPI - Partially rubbed',
    EXT: 'EXT - External use',
    AC: 'AC - Take before meals',
    PC: 'PC - Take after meals',
    Meal: 'Meal - Taken in meal',
    HOME: 'HOME (Self-treat)'
  };

  allFreqs = Object.keys(Frequency).filter(key => !isNaN(Number(Frequency[key]))).map(x => ({ key: x, value: Frequency[x] }));
  mapFreq = {
    QD: 'Once every day',
    QN: 'Once every night',
    BID: 'Two times a day',
    TID: 'Three times a day',
    QID: 'Four times a day',
    QW: 'Once a week',
    BIW: 'Two times a week',
    TIW: 'Three times a week',
    QIW: 'Four times a week',
    QOD: 'Once every other day',
    Q2W: 'Once every 2 weeks',
    Q4W: 'Once every 4 weeks',
    PRN: 'Use when needed',
    ST: 'Use immediately'
  };


  private static ProcessReadData(data: MedicinePrescriptionInfo[]): MedicinePrescription[] {
    return data.map(x => Object.assign(new MedicinePrescription, x));
  }

  getAllPrescriptionByPatient(patient: PatientInfo): Observable<MedicinePrescription[]> {
    return this.http.get<MedicinePrescriptionInfo[]>(this.API_URL + ServiceURL.medicine_prescription_getlist.format(encodeURIComponent(patient.id)))
      .pipe(map(MedicinePrescriptionService.ProcessReadData));
  }

  getAutoList(patient: PatientInfo): Observable<GUID[] | string[]> {
    const params = {
      timezone: AppConfig.config.timeZoneId
    };

    return this.http.get<GUID[] | string[]>(this.API_URL + ServiceURL.medicine_prescription_auto.format(encodeURIComponent(patient.id)), { params });
  }

  getPrescription(prescriptionId: string | GUID): Observable<MedicinePrescriptionInfo> {
    return this.http.get<MedicinePrescriptionInfo>(this.API_URL + ServiceURL.medicine_prescription_get.format(`${prescriptionId}`));
  }

  createPrescription(prescription: EditMedicinePrescription): Observable<any> {
    return this.http.post(this.API_URL + ServiceURL.medicine_prescription_addnew, prescription);
  }

  editPrescription(prescription: EditMedicinePrescription): Observable<any> {
    return this.http.post(this.API_URL + ServiceURL.medicine_prescription_edit.format(`${prescription.id}`), prescription);
  }

  deletePrescription(prescription: MedicinePrescriptionInfo): Observable<boolean> {
    return this.http.delete<boolean>(this.API_URL + ServiceURL.medicine_prescription_delete.format(`${prescription.id}`));
  }

  checkCanEdit(prescription: MedicinePrescription): boolean {
    if (prescription.isHistory) {
      return false;
    }
    return true;
  }

  getRouteByKey(key: string): string {
    return this.mapRoute[key];
  }

  getRoute(route: UsageWays): string {
    return this.mapRoute[UsageWays[route]];
  }

  getRouteMap(filter?: UsageWays, isPrescription: boolean = true) {
    let routes: { key: string, value: any}[];
    if (filter) {
      routes = UsageWays.toMaps(filter);

      if (!isPrescription) {
        routes.push({
          key: UsageWays[UsageWays.HOME],
          value: UsageWays.HOME
        });
      }
    }
    else {
      routes = isPrescription ? 
        this.allRoutes.filter(x => !!x.value && x.key !== 'HOME') :
        this.allRoutes.filter(x => !!x.value);
    }

    return routes.map(x => ({ text: this.mapRoute[x.key], value: x.value }));
  }

  getFreqByKey(key: string): string {
    return this.mapFreq[key];
  }

  getFreq(freq: Frequency): string {
    return this.mapFreq[Frequency[freq]];
  }

  getFreqMaps() {
    return this.allFreqs.map(x => ({ text: this.mapFreq[x.key], value: x.value }));
  }

}
