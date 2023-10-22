import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';
import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { StockService } from './stock.service';
import { StockOverview } from './stock-overview';
import { Stockable } from '../masterdata/stockable';
import { Observable, firstValueFrom, of } from 'rxjs';
import { PageLoaderComponent } from '../share/components/page-loader/page-loader.component';
import { AuthService } from '../auth/auth.service';
import { PageView } from '../share/page-view';
import { Medicine } from '../masterdata/medicine';
import { MedSupply } from '../masterdata/med-supply';
import { Equipment } from '../masterdata/equipment';
import { Dialyzer } from '../masterdata/dialyzer';
import { Unit } from '../masterdata/unit';
import { MasterdataService } from '../masterdata/masterdata.service';
import { IonModal, NavController } from '@ionic/angular';
import { StockItemInfo } from './stock-item';
import { Data } from '../masterdata/data';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDataUrlFromCall, addOrEdit, deepCopy, pushOrModal } from '../utils';
import { ModalService } from '../share/service/modal.service';
import { getStockIcon, getStockSearchStr } from './stock-util';
import { StockType } from './stock-type';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
})
export class StockPage implements OnInit {

  tabs = [
    {
      name: 'med',
      display: 'Medicine',
      //shortDisplay: 'Med',
      icon: 'pills'
    },
    {
      name: 'dialyzer',
      display: 'Dialyzer',
      icon: 'dialyzer'
    },
    {
      name: 'supply',
      display: 'Med Supply',
      shortDisplay: 'Supply',
      icon: 'med-supply'
    },
    {
      name: 'equipment',
      display: 'Equipment',
      icon: 'equipment'
    }
  ];

  tab: 'med' | 'dialyzer' | 'supply' | 'equipment';
  
  loadList$: (page: number, limit: number, where?: string) => Observable<PageView<StockOverview<Stockable>>>;

  multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units?.length > 1;
  pageSize = 25;
  selectedUnitId: number;
  get selectableUnits(): Unit[] {
    return this.auth.currentUser.isPowerAdmin ? this.unitList : this.unitList.filter(x => this.auth.currentUser.units.includes(x.id));
  }

  unitList: Unit[];

  unitStocks: {
    [unitId: number]: {
      medicines: StockOverview<Medicine>[];
      medSupplies: StockOverview<MedSupply>[];
      equipments: StockOverview<Equipment>[];
      dialyzers: StockOverview<Dialyzer>[];
    }
  }  = {};

  get firstLoad() { return this.loader?.firstLoad ?? true; }
  get isLoading() { return this.loader?.isLoading ?? true; }
  get isTotal() { return this.loader?.isTotal ?? false; }
  @ViewChild('loader') loader: PageLoaderComponent<StockOverview<Stockable>>;

  constructor(
    private stockService: StockService,
    private auth: AuthService,
    private master: MasterdataService,
    private imgService: ImageAndFileUploadService,
    private navCtl: NavController,
    private modal: ModalService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private injector: Injector) { }

  async ngOnInit() {
    this.tab = 'med'; // default initial tab
    this.setLoadCall();
    
    this.unitList = await this.master.getUnitListFromCache();
    this.selectedUnitId = this.auth.currentUser.units[0] ?? this.unitList[0].id;
    this.initUnitStock(this.selectedUnitId);
  }

  onTabChange() {
    this.setLoadCall();
    setTimeout(() => {
      if (this.dataList == undefined) {
        this.reload();
      }
    });
    
  }

  onUnitChange(event) {
    const unitId = event.detail.value;
    this.initUnitStock(unitId);
    this.selectedUnitId = unitId;
    if (this.dataList == undefined) {
      this.reload();
    }
  }

  setLoadCall() {
    
    switch (this.tab) {
      case 'med':
        this.loadList$ = (page, limit, where) => this.stockService.getMedicineStockList(limit, page, this.selectedUnitId, null, where);
        break;
      case 'dialyzer':
        this.loadList$ = (page, limit, where) => this.stockService.getDialyzerStockList(limit, page, this.selectedUnitId, null, where);
        break;
      case 'supply':
        this.loadList$ = (page, limit, where) => this.stockService.getMedSupplyStockList(limit, page, this.selectedUnitId, null, where);
        break;
      case 'equipment':
        this.loadList$ = (page, limit, where) => this.stockService.getEquipmentStockList(limit, page, this.selectedUnitId, null, where);
        break;
    
      default:
        break;
    }
  }

  initUnitStock(unitId: number) {
    if (!this.unitStocks[unitId]) {
      this.unitStocks[unitId] = {
        medicines: undefined,
        dialyzers: undefined,
        equipments: undefined,
        medSupplies: undefined
      };
    }

  }
  
  get dataList() {
    switch (this.tab) {
      case 'med':
        return this.unitStocks[this.selectedUnitId]?.medicines;
      case 'dialyzer':
        return this.unitStocks[this.selectedUnitId]?.dialyzers;
      case 'supply':
        return this.unitStocks[this.selectedUnitId]?.medSupplies;
      case 'equipment':
        return this.unitStocks[this.selectedUnitId]?.equipments;
      default:
        throw new Error('unknown stock type');
    }
  }
  set dataList(value) {
    switch (this.tab) {
      case 'med':
        this.unitStocks[this.selectedUnitId].medicines = value as StockOverview<Medicine>[];
        break;
      case 'dialyzer':
        this.unitStocks[this.selectedUnitId].dialyzers = value as StockOverview<Dialyzer>[];
        break;
      case 'supply':
        this.unitStocks[this.selectedUnitId].medSupplies = value as StockOverview<MedSupply>[];
        break;
      case 'equipment':
        this.unitStocks[this.selectedUnitId].equipments = value as StockOverview<Equipment>[];
        break;
    
      default:
        break;
    }
  }

  async reload() {
    await this.loader.reload(true);
  }

  addSingle() {
    this.navCtl.navigateForward(['stocks', this.selectedUnitId, 'add'], { state: { itemType: this.tab } });
  }

  addMulti() {
    this.navCtl.navigateForward(['stocks', this.selectedUnitId, 'add', 'lot']);
  }

  ionViewWillEnter() {
    const data = this.stockService.getTmp();
    if (data?.total || data?.total === 0) {
      const itemType = data.itemType;
      const itemId = data.itemId;
      const total = data.total;
      this.tab = itemType;
      this.onTabChange();
      setTimeout(() => {
        let itemOverview = this.dataList.find(x => x.itemInfo.id === itemId);
        if (itemOverview) {
          itemOverview.sum = total;
          if (itemOverview.sum === 0) {
            this.dataList.splice(this.dataList.indexOf(itemOverview), 1);
          }
        }
      });
    }
    else if (data) {
      this.tab = data.type;
      this.onTabChange();
      setTimeout(() => {
        this.updateNewData(data);
      });
    }
  }

  async updateNewData(data: StockItemInfo) {
    if (this.dataList) {
      let itemOverview = this.dataList.find(x => x.itemInfo.id === data.itemId);
      if (!itemOverview) {
        const itemInfo = await this.getItemInfo(data.itemId);
        itemOverview = {
          itemInfo: itemInfo as any,
          sum: 0,
          unitId: data.unitId
        };
        this.dataList.push(itemOverview);
        this.getImage(itemOverview).then(data => itemOverview.img = data);
      }
      
      itemOverview.sum += data.isCredit ? -data.quantity : data.quantity;
    }
  }

  async getItemInfo(id: number) {
    let call$: Observable<Data[]>;
    switch (this.tab) {
      case 'med':
        call$ = this.master.getMedicineList();
        break;
      case 'dialyzer':
        call$ = this.master.getDialyzerList();
        break;
      case 'equipment':
        call$ = this.master.getEquipmentList();
        break;
      case 'supply':
        call$ = this.master.getMedSupplyList();
        break;
      default:
        break;
    }

    const list = await firstValueFrom(call$);
    return list.find(x => x.id === id);
  }

  async getImage(item: StockOverview<Stockable>) {
    if (item.itemInfo?.image) {
      return await GetDataUrlFromCall(this.imgService.getImageOrFile(item.itemInfo?.image));
    }

    return null;
  }

  updateImg() {
    this.dataList.forEach(item => {
      if (item.img == undefined) {
        this.getImage(item).then(data => item.img = data);
      }
    });
  }

  detail(item: StockOverview<Stockable>) {
    let itemType;
    switch (this.tab) {
      case 'med':
        itemType = 'medicine';
        break;
      case 'supply':
        itemType = 'med-supply';
        break;
      case 'dialyzer':
        itemType = 'dialyzer';
        break;
      case 'equipment':
        itemType = 'equipment';
        break;
    }
    this.stockService.setTmp(item.itemInfo);
    this.navCtl.navigateForward(['detail', itemType, item.itemInfo.id], { relativeTo: this.activatedRoute, state: { unitId: this.selectedUnitId } })
  }

  // =============== Remove Stock Short-cut Util =======================
  @ViewChild('searchStock') searchStock: IonModal;
  @ViewChild('removeStock') removeStock: IonModal;
  where: string;
  selected: Stockable;
  entryDate: string | Date;
  qt: number;
  get stockSearchCall() {
    if (this.where) {
      return this.stockService.getStockableList(this.where);
    }
    else {
      return of([] as Stockable[]);
    }
  }

  getIcon = getStockIcon;

  updateSearch(keyword: string) {
    this.where = getStockSearchStr(keyword);
  }

  async remove() {
    this.where = null;
    this.selected = null;
    this.qt = 1;
    this.searchStock.present();
    const result = await this.searchStock.onWillDismiss();
    if (result.role === 'ok' || result.data) {
      console.log(result.data);
      this.selected = result.data;
      this.entryDate = new Date().toISOString();

      this.removeStock.present();
      const final = await this.removeStock.onWillDismiss();

      if (final.role === 'ok' || final.data) {
        const newItem = {
          entryDate: this.entryDate,
          itemId: result.data.id,
          itemInfo: this.selected,
          isCredit: true,
          quantity: this.qt,
          stockType: StockType.NORMAL,
          unitId: this.selectedUnitId,
          type: this.selected.type
        };
        await addOrEdit(this.injector, {
          addOrEditCall: this.stockService.addLot([newItem]),
          successTxt: 'Remove stock successfully',
          successCallback: () => {
            this.tab = this.selected.type as any;
            this.onTabChange();
            setTimeout(() => {
              this.updateNewData(newItem as any);
            });
          },
          stay: true
        });
      }
    }
  }

}
