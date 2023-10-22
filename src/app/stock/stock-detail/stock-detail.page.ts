import { GUID } from 'src/app/share/guid';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Stockable } from 'src/app/masterdata/stockable';
import { StockService } from '../stock.service';
import { StockItem, StockItemInfo } from '../stock-item';
import { Observable, finalize } from 'rxjs';
import { PageView } from 'src/app/share/page-view';
import { Unit } from 'src/app/masterdata/unit';
import { AuthService } from 'src/app/auth/auth.service';
import { PageLoaderComponent } from 'src/app/share/components/page-loader/page-loader.component';
import { NavController, Platform, PopoverController, IonPopover, IonModal, LoadingController } from '@ionic/angular';
import { StockType } from '../stock-type';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AppConfig } from 'src/app/app.config';
import { compareDesc, endOfDay } from 'date-fns';
import { AdjustInfoComponent } from './adjust-info/adjust-info.component';
import { Medicine } from 'src/app/masterdata/medicine';
import { Dialyzer } from 'src/app/masterdata/dialyzer';

@Component({
  selector: 'app-stock-detail',
  templateUrl: './stock-detail.page.html',
  styleUrls: ['./stock-detail.page.scss'],
})
export class StockDetailPage implements OnInit {

  currencyCode = AppConfig.config.localCurrency;

  itemInfo: Stockable;
  itemId: number;
  itemType: string;

  selectedUnitId: number;
  get selectableUnits(): Unit[] {
    return this.auth.currentUser.isPowerAdmin ? this.unitList : this.unitList.filter(x => this.auth.currentUser.units.includes(x.id));
  }

  get width() {return this.plt.width();}

  detailList: StockItem<Stockable>[];
  multiUnit = this.auth.currentUser.isPowerAdmin || this.auth.currentUser.units?.length > 1;
  pageSize = 25;
  pointOfTime;
  maxDate;
  where;

  currentInitSum: number;
  bfEdit: boolean;
  
  bfList: StockItem<Stockable>[];
  bfAddList: StockItemInfo[] = [];
  bfRemoveList: GUID[] = [];
  bfTmp: StockItem<Stockable>[];
  get bfLots() { return [...this.bfAddList, ...this.bfList] as StockItem<Stockable>[]; }

  loadList$: (page: number, limit: number, where?: string) => Observable<PageView<StockItem<Stockable>>>;
  
  updating: StockItem<Stockable>;
  unitList: Unit[];

  get firstLoad() { return this.loader?.firstLoad ?? true; }
  get isLoading() { return this.loader?.isLoading ?? true; }
  get isTotal() { return this.loader?.isTotal ?? false; }
  @ViewChild('loader') loader: PageLoaderComponent<StockItem<Stockable>>;
  @ViewChild('menu') menu: IonPopover;
  @ViewChild('bf') bf: IonModal;

  navForward: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private auth: AuthService,
    private master: MasterdataService,
    private navCtl: NavController,
    private popCtl: PopoverController,
    private loadCtl: LoadingController,
    private plt: Platform) { }

  async ngOnInit() {
    const currentNav = this.router.getCurrentNavigation();
    const unitId = currentNav?.extras?.state?.unitId;
    this.maxDate = endOfDay(new Date()).toISOString();
    
    this.itemId = Number.parseInt(this.activatedRoute.snapshot.paramMap.get('itemId'));

    this.itemInfo = this.activatedRoute.snapshot.data.itemInfo;
    this.itemType = this.activatedRoute.snapshot.paramMap.get('itemType');
    switch (this.itemType) {
      case 'medicine':
        this.itemType = 'med';
        break;
      case 'dialyzer':
        this.itemType = 'dialyzer';
        break;
      case 'med-supply':
        this.itemType = 'supply';
        break;
      case 'equipment':
        this.itemType = 'equipment';
        break;
    
      default:
        break;
    }

    if (!this.itemInfo) {
      this.itemInfo = this.stockService.getTmp();
    }
    
    this.setLoadCall();
    this.unitList = await this.master.getUnitListFromCache();
    this.selectedUnitId = unitId ?? this.auth.currentUser.units[0] ?? this.unitList[0].id;
  }

  setLoadCall() {
    
    switch (this.itemType) {
      case 'med':
        this.loadList$ = (page, limit, where) => this.stockService.getMedicineStockDetail(this.itemId, limit, page, this.selectedUnitId, where);
        break;
      case 'dialyzer':
        this.loadList$ = (page, limit, where) => this.stockService.getDialyzerStockDetail(this.itemId, limit, page, this.selectedUnitId, where);
        break;
      case 'supply':
        this.loadList$ = (page, limit, where) => this.stockService.getMedSupplyStockDetail(this.itemId, limit, page, this.selectedUnitId, where);
        break;
      case 'equipment':
        this.loadList$ = (page, limit, where) => this.stockService.getEquipmentStockDetail(this.itemId, limit, page, this.selectedUnitId, where);
        break;
    
      default:
        break;
    }
  }

  getBFListCall(limit: number = 100, page: number = 1) {
    switch (this.itemType) {
      case 'med':
        return this.stockService.getMedSupplyStockBFList(this.itemId, limit, page, this.selectedUnitId, this.where);
      case 'dialyzer':
        return this.stockService.getDialyzerStockBFList(this.itemId, limit, page, this.selectedUnitId, this.where);
      case 'supply':
        return this.stockService.getMedSupplyStockBFList(this.itemId, limit, page, this.selectedUnitId, this.where);
      case 'equipment':
        return this.stockService.getEquipmentStockBFList(this.itemId, limit, page, this.selectedUnitId, this.where);
    
      default:
        break;
    }
  }

  onUnitChange(event) {
    const unitId = event.detail.value;
    
    this.selectedUnitId = unitId;
    this.reload();
  }

  updateFilter() {
    if (this.pointOfTime) {
      this.where = "date < " + this.pointOfTime;
      setTimeout(() => {
        this.reload();
      });
    }
  }

  getTypeLabel(item: StockItem<Stockable>) {
    switch (item.stockType) {
      case StockType.ADJUST:
        return 'Adjust'
      case StockType.BF:
        return 'Brought FW.'
      case StockType.NORMAL:
        return item.isCredit ? 'Removed' : 'Added'
    
      default:
        break;
    }
  }

  getIcon() {
    switch (this.itemType) {
      case 'med':
        return 'pills';
      case 'supply':
        return 'med-supply';
      case 'dialyzer':
        return 'dialyzer';
      case 'equipment':
        return 'equipment';
    }
  }

  async reload() {
    await this.loader.reload(true);
  }

  onLoadList() {
    if (this.detailList.length > 0) {
      const lastItem = this.detailList[this.detailList.length - 1];
      this.currentInitSum = lastItem.sum - (lastItem.isCredit ? -lastItem.quantity : lastItem.quantity);
    }
  }

  ionViewWillEnter() {
    const data = this.stockService.getTmp();
    if (data) {
      if (this.updating) {
        if (data.id) {
          Object.assign(this.updating, data);
        }
        else {
          this.detailList.splice(this.detailList.indexOf(this.updating), 1);
        }
      }
      else {
        this.detailList.unshift(data);
      }

      this.detailList.sort((a, b) => compareDesc(new Date(a.entryDate), new Date(b.entryDate)));
      this.updateSum();
    }

    this.updating = null;
  }

  ionViewWillLeave() {
    if (!this.navForward) {
      this.stockService.setTmp({ itemType: this.itemType, itemId: this.itemId, total: this.detailList[0]?.sum ?? 0 });
    }
    this.navForward = false;
  }

  async onSelect(item: StockItemInfo) {
    if (item.stockType === StockType.NORMAL) {
      this.stockService.setTmp(item);
      this.updating = item;
      this.navForward = true;
      this.navCtl.navigateForward(['stocks', item.id ], { state: { itemType: this.itemType, itemInfo: this.itemInfo } });
    }
    else if (item.stockType === StockType.ADJUST) {
      const pop = await this.popCtl.create({
        component: AdjustInfoComponent,
        componentProps: { stockItem: { ...item, type: this.itemType } },
        cssClass: [ 'hemo-popup' ]
      });
      pop.present();
      const result = await pop.onWillDismiss();
      if (result.role === 'OK' && result.data) {
        this.detailList.splice(this.detailList.indexOf(item), 1);
        this.updateSum();
      }
    }
    else {
      this.broughtForward();
    }
  }

  addStock() {
    this.navForward = true;
    this.navCtl.navigateForward(['stocks', this.selectedUnitId, 'add'], { state: { itemType: this.itemType, itemInfo: this.itemInfo } });
  }

  openMenu(event) {
    this.menu.present(event);
  }

  broughtForward() {
    this.bfList = null;
    this.resetBfState();
    this.getBFListCall().subscribe(data => {
      this.bfList = data.data;
      this.bfTmp = [...this.bfList];
    });
    this.bf.present();
  }

  addLot() {
    this.bfAddList.unshift({
      itemId: this.itemId,
      stockType: StockType.BF,
      isCredit: false,
      unitId: this.selectedUnitId,
      quantity: 0,
      id: undefined,
      entryDate: new Date().toISOString()
    });
  }

  removeLot(item: StockItemInfo) {
    if (item.id) {
      this.bfRemoveList.push(item.id);
      this.bfList.splice(this.bfList.indexOf(item), 1);
    }
    else {
      this.bfAddList.splice(this.bfAddList.indexOf(item), 1);
    }
  }

  cancelBfEdit() {
    this.resetBfState();
    this.bfList = [...this.bfTmp];
  }

  private resetBfState() {
    this.bfEdit = false;
    this.bfAddList = [];
    this.bfRemoveList = [];
  }

  async saveBf() {
    let call$: Observable<StockItem<Stockable>[]>;
    switch (this.itemType) {
      case 'med':
        call$ = this.stockService.bulkMedicineStock(this.bfLots as StockItem<Medicine>[], this.bfRemoveList);
        break;
      case 'dialyzer':
        call$ = this.stockService.bulkDialyzerStock(this.bfLots as StockItem<Dialyzer>[], this.bfRemoveList);
        break;
      case 'supply':
        call$ = this.stockService.bulkMedSupplyStock(this.bfLots, this.bfRemoveList);
        break;
      case 'equipment':
        call$ = this.stockService.bulkEquipmentStock(this.bfLots, this.bfRemoveList);
        break;
    
      default:
        break;
    }

    const load = await this.loadCtl.create();
    load.present();
    call$.pipe(finalize(() => { load.dismiss(); })).subscribe(data => {
      this.resetBfState();
      this.bfList = [...data];
      data.forEach((item: StockItemInfo) => {
        const existing = this.detailList.find(x => (x as StockItemInfo).id === item.id);
        if (existing) {
          Object.assign(existing, item);
        }
        else {
          this.detailList.push(item);
        }
      });
      this.bfRemoveList.forEach(id => {
        this.detailList.splice(this.detailList.findIndex((x: StockItemInfo) => x.id === id), 1);
      });
      this.detailList.sort((a, b) => compareDesc(new Date(a.entryDate), new Date(b.entryDate)));
      this.updateSum();
    });
  }

  // ========================== Util =====================

  updateSum() {
    let sum = this.currentInitSum;
    for (let i = this.detailList.length - 1; i >= 0; i--) {
      const item = this.detailList[i];
      const diff = item.isCredit ? -item.quantity : item.quantity;
      sum += diff;
      item.sum = sum;
    }
  }

}
