import { ImageAndFileUploadService } from './../../share/service/image-and-file-upload.service';
import { EquipmentSettingPage } from './../../setting/masterdata-setting/equipment-setting/equipment-setting.page';
import { StockItemInfo, StockItemWithType } from './../stock-item';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { StockType } from '../stock-type';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { Stockable } from 'src/app/masterdata/stockable';
import { Medicine } from 'src/app/masterdata/medicine';
import { Dialyzer } from 'src/app/masterdata/dialyzer';
import { MedSupply } from 'src/app/masterdata/med-supply';
import { Equipment } from 'src/app/masterdata/equipment';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Observable, Subscription, finalize, firstValueFrom } from 'rxjs';
import { StockService } from '../stock.service';
import { GetDataUrl, GetDataUrlFromCall, addOrEdit, pushOrModal } from 'src/app/utils';
import { ModalService } from 'src/app/share/service/modal.service';
import { DialyzerSettingPage } from 'src/app/setting/masterdata-setting/dialyzer-setting/dialyzer-setting.page';
import { MedSupplySettingPage } from 'src/app/setting/masterdata-setting/med-supply-setting/med-supply-setting.page';
import { MedicineSettingPage } from 'src/app/setting/masterdata-setting/medicine-setting/medicine-setting.page';

@Component({
  selector: 'app-stock-item',
  templateUrl: './stock-item.page.html',
  styleUrls: ['./stock-item.page.scss'],
})
export class StockItemPage implements OnInit {

  @Input() stockItem: StockItemInfo;
  @Input() itemId: number;
  @Input() unitId: number; // required
  @Input() itemType: 'med' | 'supply' | 'equipment' | 'dialyzer';

  itemInfo: Stockable;
  image: string;
  
  editMode: boolean;
  medicines: Medicine[];
  dialyzers: Dialyzer[];
  supplies: MedSupply[];
  equipments: Equipment[];

  tmp: StockItemInfo;

  sumCache: {
    med: {[id: number]: number | Subscription;}
    supply: {[id: number]: number | Subscription;}
    dialyzer: {[id: number]: number | Subscription;}
    equipment: {[id: number]: number | Subscription;}
  } = {
    med: {},
    supply: {},
    dialyzer: {},
    equipment: {}
  };

  get itemList(): Stockable[] {
    switch (this.itemType) {
      case 'med':
        return this.medicines;
      case 'dialyzer':
        return this.dialyzers;
      case 'equipment':
        return this.equipments;
      case 'supply':
        return this.supplies;
    
      default:
        throw new Error('unknown stock type');
    }
  }

  get customFilter() {
    return (item: Stockable, filter: string) => {
      if (item.name?.toLowerCase().indexOf(filter) > -1) {
        return true;
      }
      if (item.code?.toLowerCase().startsWith(filter)) {
        return true;
      }
      if (item.barcode?.toLowerCase().startsWith(filter)) {
        return true;
      }

      return false;
    };
  }

  get mode() { return this.tmp?.stockType ?? StockType.NORMAL; }
  stockType = StockType;

  get width() { return this.plt.width(); }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private master: MasterdataService,
    private stockService: StockService,
    private imgService: ImageAndFileUploadService,
    private modal: ModalService,
    private loadCtl: LoadingController,
    private injector: Injector,
    private plt: Platform) { }

  async ngOnInit() {
    this.unitId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('unitId'));
    const currentNav = this.router.getCurrentNavigation();
    if (!this.itemType) {
      const itemType = currentNav.extras?.state?.itemType;
      this.itemType = (itemType === 'med' || itemType === 'supply' || itemType === 'equipment' || itemType === 'dialyzer') ? itemType : 'med';
    }
    this.itemInfo = currentNav.extras?.state?.itemInfo;

    if (this.activatedRoute.snapshot.data.stockItem) {
      const data = this.activatedRoute.snapshot.data.stockItem as StockItemWithType;
      switch (data.stockableType?.toLowerCase()) {
        case 'medicine':
          this.itemType = 'med';
          break;
        case 'medsupply':
          this.itemType = 'supply';
          break;
        case 'dialyzer':
          this.itemType = 'dialyzer';
          break;
        case 'equipment':
          this.itemType = 'equipment';
          break;
      }
      this.stockItem = data;
      this.itemId = data.itemId;
      this.unitId = data.unitId;
      if (!this.itemInfo) {
        this.itemInfo = data.itemInfo;
      }
    }
    
    console.log('unitId', this.unitId);
    console.log('item type', this.itemType);
    
    if (this.stockItem) {
      this.editMode = true;
      this.tmp = Object.assign({}, this.stockItem);
    }
    else {
      this.tmp = { 
        id: undefined,
        entryDate: new Date().toISOString(),
        itemId: this.itemInfo?.id,
        isCredit: false,
        stockType: StockType.NORMAL,
        unitId: this.unitId,
        quantity: 1,
      };
    }

    this.initType();

    if (this.itemInfo?.image) {
      this.image = await GetDataUrlFromCall(this.imgService.getImageOrFile(this.itemInfo.image));
    }
  }

  onChangeType() {
    this.tmp.itemId = undefined;
    this.initType();
  }

  onItemChange() {
    this.itemId = this.tmp.itemId;
  }

  async initType() {
    if (!this.itemList) {
      switch (this.itemType) {
        case 'med':
          this.medicines = await firstValueFrom(this.master.getMedicineList());
          break;
        case 'dialyzer':
          this.dialyzers = await firstValueFrom(this.master.getDialyzerList());
          break;
        case 'equipment':
          this.equipments = await firstValueFrom(this.master.getEquipmentList());
          break;
        case 'supply':
          this.supplies = await firstValueFrom(this.master.getMedSupplyList());
          break;
      
        default:
          break;
      }
    }
    
  }

  getSum() : number {
    if (!this.tmp.itemId) {
      return -1;
    }
    let cache;
    switch (this.itemType) {
      case 'med':
        cache = this.sumCache.med;
        break;
      case 'dialyzer':
        cache = this.sumCache.dialyzer;
        break;
      case 'equipment':
        cache = this.sumCache.equipment;
        break;
      case 'supply':
        cache = this.sumCache.supply;
        break;
      default:
        break;
    }

    
    if (cache[this.itemId] instanceof Subscription) {
      return null;
    }
    if (!cache[this.itemId]) {
      let callSum$: Observable<number>;
      switch (this.itemType) {
        case 'med':
          callSum$ = this.stockService.getMedicineSum(this.tmp.itemId, this.unitId);
          break;
        case 'dialyzer':
          callSum$ = this.stockService.getDialyzerSum(this.tmp.itemId, this.unitId);
          break;
        case 'equipment':
          callSum$ = this.stockService.getEquipmentSum(this.tmp.itemId, this.unitId);
          break;
        case 'supply':
          callSum$ = this.stockService.getMedSupplySum(this.tmp.itemId, this.unitId);
          break;
        default:
          break;
      }
      cache[this.itemId] = callSum$.subscribe(data => cache[this.itemId] = data);
      return null;
    }

    return cache[this.itemId];
  }

  getAdjustValue() {
    const sum = this.getSum();
    if (sum > 0) {
      return this.tmp.quantity - sum;
    }

    return this.tmp.quantity;
  }

  async addNewItem() {
    let result: Stockable;
    switch (this.itemType) {
      case 'med':
        result = await pushOrModal(MedicineSettingPage, { gotoAdd: true }, this.modal);
        break;
      case 'dialyzer':
        result = await pushOrModal(DialyzerSettingPage, { gotoAdd: true }, this.modal);
        break;
      case 'equipment':
        result = await pushOrModal(EquipmentSettingPage, { gotoAdd: true }, this.modal);
        break;
      case 'supply':
        result = await pushOrModal(MedSupplySettingPage, { gotoAdd: true }, this.modal);
        break;
    
      default:
        break;
    }

    console.log('result add', result);
    if (result) {
      this.itemList.push(result);
    }
  }

  async save() {
    if (this.mode === StockType.BF) {
      this.tmp.isCredit = false;
    }
    if (this.mode === StockType.ADJUST || this.tmp.isCredit) {
      this.tmp.pricePerPiece = undefined;
    }

    const data = Object.assign({}, this.tmp);
    if (this.mode === StockType.ADJUST) {
      const adjust = this.getAdjustValue();
      data.isCredit = adjust < 0;
      data.quantity = Math.abs(adjust);
    }
    
    await addOrEdit(this.injector, {
      addOrEditCall: this.getServiceCall(data),
      successTxt: 'Added stock item',
      successCallback: (data: StockItemInfo) => {
        if (data) {
          data.type = this.itemType;
          this.stockService.setTmp(data);
        }
        else {
          this.stockService.setTmp(this.tmp);
        }
      }
    });

  }

  getServiceCall(data: StockItemInfo) : Observable<StockItemInfo> {
    let call$;
    switch (this.itemType) {
      case 'med':
        call$ = this.editMode ? this.stockService.editMedicineStock(data) : this.stockService.addMedicineStock(data);
        break;
      case 'dialyzer':
        call$ = this.editMode ? this.stockService.editDialyzerStock(data) : this.stockService.addDialyzerStock(data);
        break;
      case 'equipment':
        call$ = this.editMode ? this.stockService.editEquipmentStock(data) : this.stockService.addEquipmentStock(data);
        break;
      case 'supply':
        call$ = this.editMode ? this.stockService.editMedSupplyStock(data) : this.stockService.addMedSupplyStock(data);
        break;
    
      default:
        break;
    }
    return call$;
  }

  async delete() {
    const loading = await this.loadCtl.create();
    loading.present();
    this.stockService.deleteStock(this.stockItem)
      .pipe(finalize(() => { loading.dismiss(); }))
      .subscribe(() => {
        this.tmp.id = undefined;
        this.stockService.setTmp(this.tmp);
        const nav = this.injector.get(NavController);
        nav.back();
      });
  }

}
