import { map } from 'rxjs';
import { PageView } from './../share/page-view';
import { Injectable, inject } from '@angular/core';
import { ServiceBase } from '../share/service/service-base';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StockItem, StockItemInfo, StockItemWithType } from './stock-item';
import { Medicine } from '../masterdata/medicine';
import { ServiceURL } from '../service-url';
import { Dialyzer } from '../masterdata/dialyzer';
import { Equipment } from '../masterdata/equipment';
import { MedSupply } from '../masterdata/med-supply';
import { StockOverview } from './stock-overview';
import { Stockable } from '../masterdata/stockable';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { MasterdataService } from '../masterdata/masterdata.service';
import { GUID, guid } from '../share/guid';

@Injectable({
  providedIn: 'root'
})
export class StockService extends ServiceBase {

  constructor(http: HttpClient) {
    super(http)
  }

  // ============= Get Stock Item ================

  getStockItemById(id: GUID) {
    return this.http.get<StockItemWithType>(this.API_URL + ServiceURL.stock_get.format(id));
  }

  // ================ Get Specific Sum =======

  getMedicineSum(med: Medicine | number, unitId?: number) {
    let id: number;
    if (typeof med === 'number') {
      id = med;
    }
    else {
      id = med.id;
    }
    let params = new HttpParams({ fromObject: { where: `itemid = ${id}` }});
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    return this.http.get<PageView<StockOverview<Medicine>>>(this.API_URL + ServiceURL.stock_medicine_getall, { params })
      .pipe(map(result => result.total > 0 ? result.data[0].sum : -1));
  }

  getMedSupplySum(med: MedSupply | number, unitId?: number) {
    let id: number;
    if (typeof med === 'number') {
      id = med;
    }
    else {
      id = med.id;
    }
    let params = new HttpParams({ fromObject: { where: `itemid = ${id}` }});
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    return this.http.get<PageView<StockOverview<MedSupply>>>(this.API_URL + ServiceURL.stock_med_supply_getall, { params })
      .pipe(map(result => result.total > 0 ? result.data[0].sum : -1));
  }

  getEquipmentSum(equipment: Equipment | number, unitId?: number) {
    let id: number;
    if (typeof equipment === 'number') {
      id = equipment;
    }
    else {
      id = equipment.id;
    }
    let params = new HttpParams({ fromObject: { where: `itemid = ${id}` }});
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    return this.http.get<PageView<StockOverview<Equipment>>>(this.API_URL + ServiceURL.stock_equipment_getall, { params })
      .pipe(map(result => result.total > 0 ? result.data[0].sum : -1));
  }

  getDialyzerSum(equipment: Dialyzer | number, unitId?: number) {
    let id: number;
    if (typeof equipment === 'number') {
      id = equipment;
    }
    else {
      id = equipment.id;
    }
    let params = new HttpParams({ fromObject: { where: `itemid = ${id}` }});
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    return this.http.get<PageView<StockOverview<Dialyzer>>>(this.API_URL + ServiceURL.stock_dialyzer_getall, { params })
      .pipe(map(result => result.total > 0 ? result.data[0].sum : -1));
  }

  // ========= Get All List ==============

  getMedicineStockList(limit: number = 10, page: number = 1, unitId?: number, orderBy?: string[], where?: string) {
    const params = this.getParams(limit, page, unitId, orderBy, where);
    return this.http.get<PageView<StockOverview<Medicine>>>(this.API_URL + ServiceURL.stock_medicine_getall, { params });
  }

  getMedSupplyStockList(limit: number = 10, page: number = 1, unitId?: number, orderBy?: string[], where?: string) {
    const params = this.getParams(limit, page, unitId, orderBy, where);
    return this.http.get<PageView<StockOverview<MedSupply>>>(this.API_URL + ServiceURL.stock_med_supply_getall, { params });
  }

  getEquipmentStockList(limit: number = 10, page: number = 1, unitId?: number, orderBy?: string[], where?: string) {
    const params = this.getParams(limit, page, unitId, orderBy, where);
    return this.http.get<PageView<StockOverview<Equipment>>>(this.API_URL + ServiceURL.stock_equipment_getall, { params });
  }

  getDialyzerStockList(limit: number = 10, page: number = 1, unitId?: number, orderBy?: string[], where?: string) {
    const params = this.getParams(limit, page, unitId, orderBy, where);
    return this.http.get<PageView<StockOverview<Dialyzer>>>(this.API_URL + ServiceURL.stock_dialyzer_getall, { params });
  }

  // ============== Get Detail List ================

  getMedicineStockDetail(med: Medicine | number, limit: number = 10, page: number = 1, unitId?: number, where?: string) {
    return this.getStockDetail(med, ServiceURL.stock_medicine_get_detail, { limit, page, unitId, where });
  }

  getMedSupplyStockDetail(supply: MedSupply | number, limit: number = 10, page: number = 1, unitId?: number, where?: string) {
    return this.getStockDetail(supply, ServiceURL.stock_med_supply_get_detail, { limit, page, unitId, where });
  }

  getEquipmentStockDetail(equipment: Equipment | number, limit: number = 10, page: number = 1, unitId?: number, where?: string) {
    return this.getStockDetail(equipment, ServiceURL.stock_equipment_get_detail, { limit, page, unitId, where });
  }

  getDialyzerStockDetail(dialyzer: Dialyzer | number, limit: number = 10, page: number = 1, unitId?: number, where?: string) {
    return this.getStockDetail(dialyzer, ServiceURL.stock_dialyzer_get_detail, { limit, page, unitId, where });
  }

  private getStockDetail<TStockable extends Stockable>(stock: TStockable | number, callUrl: string, params: {limit: number, page: number, unitId?: number, where?: string}) {
    let id: number;
    if (typeof stock === 'number') {
      id = stock;
    }
    else {
      id = stock.id;
    }
    const paramsResult = this.getParams(params.limit, params.page, params.unitId, null, params.where);
    return this.http.get<PageView<StockItem<TStockable>>>(this.API_URL + callUrl.format(id.toString()), { params: paramsResult });
  }

  // ============= BF List ===============

  getMedicineStockBFList(med: Medicine | number, limit: number = 100, page: number = 1, unitId?: number, where?: string) {
    return this.getStockBFList(med, ServiceURL.stock_medicine_get_detail, { limit, page, unitId, where });
  }

  getMedSupplyStockBFList(supply: MedSupply | number, limit: number = 100, page: number = 1, unitId?: number, where?: string) {
    return this.getStockBFList(supply, ServiceURL.stock_med_supply_get_detail, { limit, page, unitId, where });
  }

  getEquipmentStockBFList(equipment: Equipment | number, limit: number = 100, page: number = 1, unitId?: number, where?: string) {
    return this.getStockBFList(equipment, ServiceURL.stock_equipment_get_detail, { limit, page, unitId, where });
  }

  getDialyzerStockBFList(dialyzer: Dialyzer | number, limit: number = 100, page: number = 1, unitId?: number, where?: string) {
    return this.getStockBFList(dialyzer, ServiceURL.stock_dialyzer_get_detail, { limit, page, unitId, where });
  }

  private getStockBFList<TStockable extends Stockable>(stock: TStockable | number, callUrl: string, params: {limit: number, page: number, unitId?: number, where?: string}) {
    let id: number;
    if (typeof stock === 'number') {
      id = stock;
    }
    else {
      id = stock.id;
    }
    let filter = "type = BF";
    if (params.where) {
      filter += ` and ${params.where}`;
    }
    const paramsResult = this.getParams(params.limit, params.page, params.unitId, null, filter);
    return this.http.get<PageView<StockItem<TStockable>>>(this.API_URL + callUrl.format(id.toString()), { params: paramsResult });
  }

  // ============ Add ===========

  addMedicineStock(stock: StockItem<Medicine>) {
    return this.http.post<StockItemInfo>(this.API_URL + ServiceURL.stock_medicine_add, stock);
  }

  addMedSupplyStock(stock: StockItem<MedSupply>) {
    return this.http.post<StockItemInfo>(this.API_URL + ServiceURL.stock_med_supply_add, stock);
  }

  addEquipmentStock(stock: StockItem<Equipment>) {
    return this.http.post<StockItemInfo>(this.API_URL + ServiceURL.stock_equipment_add, stock);
  }

  addDialyzerStock(stock: StockItem<Dialyzer>) {
    return this.http.post<StockItemInfo>(this.API_URL + ServiceURL.stock_dialyzer_add, stock);
  }

  // ============ Edit ===========

  editMedicineStock(stock: StockItem<Medicine>) {
    const id = (stock as StockItemInfo).id;
    return this.http.post<void>(this.API_URL + ServiceURL.stock_medicine_edit.format(id), stock);
  }

  editMedSupplyStock(stock: StockItem<MedSupply>) {
    const id = (stock as StockItemInfo).id;
    return this.http.post<void>(this.API_URL + ServiceURL.stock_med_supply_edit.format(id), stock);
  }

  editEquipmentStock(stock: StockItem<Equipment>) {
    const id = (stock as StockItemInfo).id;
    return this.http.post<void>(this.API_URL + ServiceURL.stock_equipment_edit.format(id), stock);
  }

  editDialyzerStock(stock: StockItem<Dialyzer>) {
    const id = (stock as StockItemInfo).id;
    return this.http.post<void>(this.API_URL + ServiceURL.stock_dialyzer_edit.format(id), stock);
  }

  // =============== Bulk ========================

  bulkMedicineStock(data: StockItem<Medicine>[], removeList: GUID[]) {
    return this.http.post<StockItem<Medicine>[]>(this.API_URL + ServiceURL.stock_medicine_bulk, { data, removeList });
  }

  bulkMedSupplyStock(data: StockItem<MedSupply>[], removeList: GUID[]) {
    return this.http.post<StockItem<MedSupply>[]>(this.API_URL + ServiceURL.stock_med_supply_bulk, { data, removeList });
  }

  bulkEquipmentStock(data: StockItem<Equipment>[], removeList: GUID[]) {
    return this.http.post<StockItem<Equipment>[]>(this.API_URL + ServiceURL.stock_equipment_bulk, { data, removeList });
  }

  bulkDialyzerStock(data: StockItem<Dialyzer>[], removeList: GUID[]) {
    return this.http.post<StockItem<Dialyzer>[]>(this.API_URL + ServiceURL.stock_dialyzer_bulk, { data, removeList });
  }

  // ============ delete ===========

  deleteStock(stock: StockItemInfo) {
    const id = stock.id;
    return this.http.delete<void>(this.API_URL + ServiceURL.stock_delete.format(id));
  }

  // ============= stockable search ==============

  getStockableList(where: string = null) {
    let params = new HttpParams;
    if (where) {
      params = params.set('where', where);
    }
    return this.http.get<Stockable[]>(this.API_URL + ServiceURL.stock_search, { params });
  }
  // ============= Add Lot =============

  addLot(data: StockItem<Stockable>[]) {
    const body = {
      data
    };
    return this.http.post<StockItem<Stockable>[]>(this.API_URL + ServiceURL.stock_add_lot, body);
  }

  // ============== Utils ===================

  private getParams(limit: number, page: number, unitId?: number, orderBy?: string[], where?: string): HttpParams {
    let params = new HttpParams({
      fromObject: {
        pageSize: limit,
        pageIndex: page,
      }
    });
    if (unitId) {
      params = params.set('unitId', unitId);
    }
    if (orderBy) {
      orderBy.forEach(item => {
        params = params.append('orderBy', item);
      });
    }
    if (where) {
      params = params.set('where', where);
    }

    return params;
  }
  

}

export const StockItemResolver: ResolveFn<StockItem<Stockable>> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const stockService = inject(StockService);
    const fromTmp = stockService.getTmp();
    if (fromTmp) {
      return fromTmp;
    }

    const id = route.paramMap.get('stockId');
    return stockService.getStockItemById(guid(id));
  };

export const StockableResolver: ResolveFn<Stockable> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      const stockService = inject(StockService);
      const master = inject(MasterdataService);
      const fromTmp = stockService.getTmp();
      if (fromTmp?.name) {
        return fromTmp;
      }
      if (fromTmp) {
        stockService.setTmp(fromTmp);
        return;
      }
      
      const id = Number.parseInt(route.paramMap.get('itemId'));
      const type = route.paramMap.get('itemType');

      switch (type) {
        case 'medicine':
          return master.getMedicineList().pipe(map(data => data.find(x => x.id === id)));
        case 'med-supply':
          return master.getMedSupplyList().pipe(map(data => data.find(x => x.id === id)));
        case 'dialyzer':
          return master.getDialyzerList().pipe(map(data => data.find(x => x.id === id)));
        case 'equipment':
          return master.getEquipmentList().pipe(map(data => data.find(x => x.id === id)));
      }
      
      return null;
    };
