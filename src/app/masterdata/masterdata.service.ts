import { Unit } from './unit';
import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ServiceURL } from '../service-url';
import { Data } from '../masterdata/data';
import { Status } from './status';
import { Dialysate } from './dialysate';
import { Needle } from './needle';
import { ServiceBase } from '../share/service/service-base';
import { Medicine } from './medicine';
import { LabItem, LabItemInfo } from './labItem';
import { tap } from 'rxjs/operators';
import { Ward } from './ward';
import { Stockable } from './stockable';
import { Dialyzer } from './dialyzer';
import { PatienHistoryItem } from './patient-history-item';

@Injectable({
  providedIn: 'root'
})
export class MasterdataService extends ServiceBase {

  private dataUpdate = new EventEmitter<{data: any, type: string, eventType: 'add'|'edit'|'del'}>();
  get onDataUpdate() { return this.dataUpdate.asObservable(); }

  private masterCaches: { [type: string]: Data[] } = {};

  constructor(http: HttpClient) {
    super(http);
  }

  async getUnitListFromCache(forceUpdate: boolean = false): Promise<Unit[]> {
    const data = await this.getListFromCache('unit', forceUpdate);
    return data as Unit[];
  }

  async getListFromCache(type: string, forceUpdate: boolean = false): Promise<Data[]> {
    if (!this.masterCaches[type] || forceUpdate) {
      switch (type) {
        case 'unit':
          this.masterCaches[type] = await firstValueFrom(this.getUnitList());
          break;
        default:
          break;
      }
    }

    return this.masterCaches[type];
  }

  // ===================== Patient History ==============

  getPatientHistoryItemList(): Observable<PatienHistoryItem[]> {
    return this.http.get<PatienHistoryItem[]>(this.API_URL + ServiceURL.masterdata_patient_history);
  }

  editPatientHistoryItem(item: PatienHistoryItem) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_patient_history + `/${item.id}`, item);
  }

  addPatientHistoryItem(item: PatienHistoryItem) {
    return this.http.post<PatienHistoryItem>(this.API_URL + ServiceURL.masterdata_patient_history, item);
  }

  deletePatientHistoryItem(item: PatienHistoryItem) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_patient_history + `/${item.id}`);
  }

  swapPatienHistoryItems(first: PatienHistoryItem, second: PatienHistoryItem) {
    const firstId = first.id;
    const secondId = second.id;
    return this.http.put<boolean>(this.API_URL + ServiceURL.masterdata_patient_history_swap.format(firstId.toString(), secondId.toString()), null);
  }

  // ============== Unit ==========================

  getUnitList(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.API_URL + ServiceURL.masterdata_units);
  }

  editUnit(item: Unit) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_units + `/${item.id}`, item)
      .pipe(tap(() => this.dataUpdate.emit({ data: item, type: 'unit', eventType: 'edit' })));
  }

  addUnit(item: Unit) {
    return this.http.post<Unit>(this.API_URL + ServiceURL.masterdata_units, item)
      .pipe(tap((newData) => this.dataUpdate.emit({ data: newData, type: 'unit', eventType: 'add' })));
  }

  deleteUnit(item: Unit) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_units + `/${item.id}`)
      .pipe(tap(() => this.dataUpdate.emit({ data: item, type: 'unit', eventType: 'del' })));
  }

  // ============== Medicine ==========================

  getMedicineList(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.API_URL + ServiceURL.masterdata_medicine);
  }

  editMedicine(item: Medicine) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_medicine + `/${item.id}`, item);
  }

  addMedicine(item: Medicine) {
    return this.http.post<Medicine>(this.API_URL + ServiceURL.masterdata_medicine, item);
  }

  deleteMedicine(item: Medicine) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_medicine + `/${item.id}`);
  }

  // ============== Medicine Category ==========================

  getMedicineCategoryList(): Observable<Data[]> {
    return this.http.get<Data[]>(this.API_URL + ServiceURL.masterdata_medicine_category);
  }

  editMedicineCategory(item: Data) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_medicine_category + `/${item.id}`, item);
  }

  addMedicineCategory(item: Data) {
    return this.http.post<Data>(this.API_URL + ServiceURL.masterdata_medicine_category, item);
  }

  deleteMedicineCategory(item: Data) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_medicine_category + `/${item.id}`);
  }

  // ============== DeathCause ==========================

  getDeathCauseList(): Observable<Data[]> {
    return this.http.get<Data[]>(this.API_URL + ServiceURL.masterdata_deathCause);
  }

  editDeathCause(item: Data) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_deathCause + `/${item.id}`, item);
  }

  addDeathCause(item: Data) {
    return this.http.post<Data>(this.API_URL + ServiceURL.masterdata_deathCause, item);
  }

  deleteDeathCause(item: Data) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_deathCause + `/${item.id}`);
  }

  // ============== Status ==========================

  getStatusList(): Observable<Status[]> {
    return this.http.get<Status[]>(this.API_URL + ServiceURL.masterdata_status);
  }

  editStatus(item: Status) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_status + `/${item.id}`, item);
  }

  addStatus(item: Status) {
    return this.http.post<Data>(this.API_URL + ServiceURL.masterdata_status, item);
  }

  deleteStatus(item: Status) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_status + `/${item.id}`);
  }

  // ============== Anticoagulant ==========================

  getAnticoagulantList(): Observable<Data[]> {
    return this.http.get<Data[]>(this.API_URL + ServiceURL.masterdata_anticoagulant);
  }

  editAnticoagulant(item: Data) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_anticoagulant + `/${item.id}`, item);
  }

  addAnticoagulant(item: Data) {
    return this.http.post<Data>(this.API_URL + ServiceURL.masterdata_anticoagulant, item);
  }

  deleteAnticoagulant(item: Data) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_anticoagulant + `/${item.id}`);
  }

  // ============== Dialysate ==========================

  getDialysateList(): Observable<Dialysate[]> {
    return this.http.get<Dialysate[]>(this.API_URL + ServiceURL.masterdata_dialysate);
  }

  editDialysate(item: Dialysate) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_dialysate + `/${item.id}`, item);
  }

  addDialysate(item: Dialysate) {
    return this.http.post<Data>(this.API_URL + ServiceURL.masterdata_dialysate, item);
  }

  deleteDialysate(item: Dialysate) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_dialysate + `/${item.id}`);
  }

  // ============== Dialyzer ==========================

  getDialyzerList(): Observable<Dialyzer[]> {
    return this.http.get<Dialyzer[]>(this.API_URL + ServiceURL.masterdata_dialyzer);
  }

  editDialyzer(item: Dialyzer) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_dialyzer + `/${item.id}`, item);
  }

  addDialyzer(item: Dialyzer) {
    return this.http.post<Dialyzer>(this.API_URL + ServiceURL.masterdata_dialyzer, item);
  }

  deleteDialyzer(item: Dialyzer) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_dialyzer + `/${item.id}`);
  }

  // ============== Needle ==========================

  getNeedleList(): Observable<Needle[]> {
    return this.http.get<Needle[]>(this.API_URL + ServiceURL.masterdata_needle);
  }

  editNeedle(item: Needle) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_needle + `/${item.id}`, item);
  }

  addNeedle(item: Needle) {
    return this.http.post<Needle>(this.API_URL + ServiceURL.masterdata_needle, item);
  }

  deleteNeedle(item: Needle) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_needle + `/${item.id}`);
  }

  // ============== Underlying ==========================

  getUnderlyingList(): Observable<Data[]> {
    return this.http.get<Data[]>(this.API_URL + ServiceURL.masterdata_underlying);
  }

  editUnderlying(item: Data) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_underlying + `/${item.id}`, item);
  }

  addUnderlying(item: Data) {
    return this.http.post<Data>(this.API_URL + ServiceURL.masterdata_underlying, item);
  }

  deleteUnderlying(item: Data) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_underlying + `/${item.id}`);
  }

  // ============== Lab Item ==========================

  getLabItemList(): Observable<LabItemInfo[]> {
    return this.http.get<LabItemInfo[]>(this.API_URL + ServiceURL.masterdata_lab_item);
  }

  editLabItem(item: LabItem) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_lab_item + `/${item.id}`, item);
  }

  addLabItem(item: LabItem) {
    return this.http.post<LabItem>(this.API_URL + ServiceURL.masterdata_lab_item, item);
  }

  deleteLabItem(item: LabItem) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_lab_item + `/${item.id}`);
  }

  // ============== Ward ==========================

  getWardList(): Observable<Ward[]> {
    return this.http.get<Ward[]>(this.API_URL + ServiceURL.masterdata_ward);
  }

  editWard(item: Ward) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_ward + `/${item.id}`, item);
  }

  addWard(item: Ward) {
    return this.http.post<Ward>(this.API_URL + ServiceURL.masterdata_ward, item);
  }

  deleteWard(item: Ward) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_ward + `/${item.id}`);
  }

  // ============== Med Supply ==========================

  getMedSupplyList(): Observable<Stockable[]> {
    return this.http.get<Stockable[]>(this.API_URL + ServiceURL.masterdata_medical_supply);
  }

  editMedSupply(item: Stockable) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_medical_supply + `/${item.id}`, item);
  }

  addMedSupply(item: Stockable) {
    return this.http.post<Stockable>(this.API_URL + ServiceURL.masterdata_medical_supply, item);
  }

  deleteMedSupply(item: Stockable) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_medical_supply + `/${item.id}`);
  }

  // ============== Equipment ==========================

  getEquipmentList(): Observable<Stockable[]> {
    return this.http.get<Stockable[]>(this.API_URL + ServiceURL.masterdata_equipment);
  }

  editEquipment(item: Stockable) {
    return this.http.post<void>(this.API_URL + ServiceURL.masterdata_equipment + `/${item.id}`, item);
  }

  addEquipment(item: Stockable) {
    return this.http.post<Stockable>(this.API_URL + ServiceURL.masterdata_equipment, item);
  }

  deleteEquipment(item: Stockable) {
    return this.http.delete<void>(this.API_URL + ServiceURL.masterdata_equipment + `/${item.id}`);
  }

}
