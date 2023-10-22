import { MedicineSettingPage } from 'src/app/setting/masterdata-setting/medicine-setting/medicine-setting.page';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal, LoadingController, Platform } from '@ionic/angular';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { ModalService } from 'src/app/share/service/modal.service';
import { StockService } from '../stock.service';
import { StockItem, StockItemInfo } from '../stock-item';
import { Stockable } from 'src/app/masterdata/stockable';
import { of } from 'rxjs';
import { StockType } from '../stock-type';
import { addOrEdit, pushOrModal } from 'src/app/utils';
import { MedSupplySettingPage } from 'src/app/setting/masterdata-setting/med-supply-setting/med-supply-setting.page';
import { DialyzerSettingPage } from 'src/app/setting/masterdata-setting/dialyzer-setting/dialyzer-setting.page';
import { EquipmentSettingPage } from 'src/app/setting/masterdata-setting/equipment-setting/equipment-setting.page';
import { getStockIcon, getStockSearchStr } from '../stock-util';

@Component({
  selector: 'app-stock-lot',
  templateUrl: './stock-lot.page.html',
  styleUrls: ['./stock-lot.page.scss'],
})
export class StockLotPage implements OnInit {

  stockItems: StockItem<Stockable>[] = [];
  unitId: number;
  entryDate: string;

  where: string;

  error: string;

  get stockCall() {
    if (this.where) {
      return this.stockService.getStockableList(this.where);
    }
    else {
      return of([] as Stockable[]);
    }
  }

  get searchKey() {
    return (item: Stockable) => `${item.name}-${item.code}-${item.barcode}`;
  }

  get width() { return this.plt.width(); }

  @ViewChild('addStock') addStockModal: IonModal;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private master: MasterdataService,
    private stockService: StockService,
    private modal: ModalService,
    private loadCtl: LoadingController,
    private injector: Injector,
    private plt: Platform
  ) { }

  ngOnInit() {
    this.unitId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('unitId'));
    this.entryDate = new Date().toISOString();
  }

  getIcon = getStockIcon;

  async newItem(type: string) {
    
    switch (type) {
      case 'med':
        await pushOrModal(MedicineSettingPage, { gotoAdd: true }, this.modal);
        break;
      case 'supply':
        await pushOrModal(MedSupplySettingPage, { gotoAdd: true }, this.modal);
        break;
      case 'dialyzer':
        await pushOrModal(DialyzerSettingPage, { gotoAdd: true }, this.modal);
        break;
      case 'equipment':
        await pushOrModal(EquipmentSettingPage, { gotoAdd: true }, this.modal);
        break;
    
      default:
        break;
    }
  }

  updateSearch(keyword: string) {
    this.where = getStockSearchStr(keyword);
  }

  async add() {
    this.addStockModal.present();
    const result = await this.addStockModal.onWillDismiss();
    if (result.role === 'ok' || result.data) {
      console.log(result.data);
      const newItem = {
        entryDate: this.entryDate,
        itemId: result.data.id,
        itemInfo: result.data,
        isCredit: false,
        quantity: 0,
        stockType: StockType.NORMAL,
        unitId: this.unitId,
        type: result.data.type
      };

      this.stockItems.push(newItem);
    }
    this.where = null;
  }

  save() {
    const call$ = this.stockService.addLot(this.stockItems);
    addOrEdit(this.injector, {
      addOrEditCall: call$,
      successTxt: { name: 'Stocks', editMode: false },
      errorCallback: err => this.error = err
    });
  };

}
