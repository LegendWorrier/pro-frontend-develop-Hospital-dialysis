import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { map, tap } from 'rxjs/operators';
import { isObservable, Observable, of } from 'rxjs';
import { ModalController, Platform, PopoverController, IonNav, NavParams, IonSearchbar } from '@ionic/angular';
import { Component, Input, OnInit, Output, EventEmitter, ContentChild, TemplateRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy, Injector } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';
import { ModalBack } from 'src/app/utils';

export interface ModalSearchParams<T> {
  title?: string;
  closeOnSelect?: boolean;
  closeBtn?: boolean;
  /**
   * Default text on search bar
   *
   * @type {string}
   * @memberof ModalSearchParams
   */
  searchText?: string;
  /**
   * Toggle this to hide search bar and use simple UI. (for popup)
   * Suitable for short list, not suitable for long list.
   *
   * @memberof ModalSearchListComponent
   */
  simpleMode?: boolean;
  /**
   * Toggle this to hide search bar and use this component as a simple select list. (The header part is still there for modal)
   * Can be overridden by 'simpleMode'.
   *
   * @type {boolean}
   * @memberof ModalSearchParams
   */
  hideSearch?: boolean;
  data: T[] | Observable<T[]>;
  /**
   * Required input. Used to determine which prop in the data model to used for search comparing. (unless is serverSideSearch)
   *
   * @memberof ModalSearchListComponent
   */
  getSearchKey: (data: T) => string;
  /**
   * Function for filtering each item. if return true, the item will be disabled.
   *
   * @memberof ModalSearchListComponent
   */
  disabledItem?: (item: T) => boolean;

  /**
   * Use this to enable reloading, refresh cache, etc.
   *
   * @memberof ModalSearchListComponent
   */
  hasReload?: boolean;
  lastUpdate?: () => Date;

  /**
   * Custom display template for each item in the list. (Take priority over content child)
   *
   * @type {TemplateRef<any>}
   * @memberof ModalSearchListComponent
   */
  templateOverride?: TemplateRef<any>;

  /**
   * In case this is already in modal.
   *
   * @type {IonNav}
   * @memberof ModalSearchListComponent
   */
  nav?: IonNav;

  /**
   * This is the main output callback when an item is selected. (mainly used when closeOnSelect is 'false').
   * return false to indicated fail result, otherwise true.
   *
   */
  onItemSelect?: (item: T) => boolean;
  /**
   * Use this event to prepare the observable for reloading data. (to refresh cache data, etc.)
   *
   * @type {EventEmitter<any>}
   * @memberof ModalSearchListComponent
   */
  onReload?: EventEmitter<any>;

  /**
   * Use this event to do extra work before actual search. (e.g. setup where condition for observable)
   */
  onSearchInput?: EventEmitter<string>;

  /**
   * Use this to override default filter logic and let the data observable do the job. (use in conjunction with onSearchInput)
   */
  serverSideSearch?: boolean;

}

@Component({
  selector: 'app-modal-search-list',
  templateUrl: './modal-search-list.component.html',
  styleUrls: ['./modal-search-list.component.scss'],
})
export class ModalSearchListComponent<T> implements OnInit, AfterViewInit, OnDestroy {

  @Input() title: string;
  @Input() closeOnSelect = true;
  @Input() searchText: string;
  /**
   * Toggle this to hide search bar and use simple UI. (for popup)
   * Suitable for short list, not suitable for long list.
   *
   * @memberof ModalSearchListComponent
   */
  @Input() simpleMode = false;
  /**
   * Toggle this to hide search bar and use this component as a simple select list. (The header part is still there for modal)
   * Can be overridden by 'simpleMode'.
   *
   * @type {boolean}
   * @memberof ModalSearchParams
   */
  @Input() hideSearch = false;

  @Input() closeBtn = false;

  @Input() data: T[] | Observable<T[]>;
  /**
   * Use this to enable reloading, refresh cache, etc.
   *
   * @memberof ModalSearchListComponent
   */
  @Input() hasReload = false;
  @Input() lastUpdate: () => Date;

  /**
   * Required input. Used to determine which prop in the data model to used for search comparing.
   *
   * @memberof ModalSearchListComponent
   */
  @Input() getSearchKey: (data: T) => string;
  /**
   * Function for filtering each item, if return true, means disabled item.
   *
   * @memberof ModalSearchListComponent
   */
  @Input() disabledItem: (item: T) => boolean;
  /**
   * Custom display template for each item in the list. (Take priority over content child)
   *
   * @type {TemplateRef<any>}
   * @memberof ModalSearchListComponent
   */
  @Input() templateOverride: TemplateRef<any>;

  /**
   * In case this is already in modal.
   *
   * @type {IonNav}
   * @memberof ModalSearchListComponent
   */
  @Input() nav: IonNav;

  /**
   * This is the main output callback when an item is selected. (mainly used when closeOnSelect is 'false').
   * return false to indicated fail result, otherwise true.
   */
  @Input() onItemSelect: (selected: T) => Observable<boolean> | Promise<boolean> | boolean;
  /**
   * Use this event to prepare the observable for reloading data. (to refresh cache data, etc.)
   *
   * @type {EventEmitter<any>}
   * @memberof ModalSearchListComponent
   */
  @Output() onReload: EventEmitter<any> = new EventEmitter();

  /**
   * Use this event to do extra work before actual search. (e.g. setup where condition for observable)
   */
  @Output() onSearchInput: EventEmitter<string> = new EventEmitter();

  /**
   * Use this to override default filter logic and let the data observable do the job. (use in conjunction with onSearchInput)
   */
  @Input() serverSideSearch: boolean;

  get itemSize() { return this.plt.is('ios') ? 44 : 48; }
  get lastUpdateText() { return this.lastUpdate ? formatDistanceToNow(this.lastUpdate(), { addSuffix: true, includeSeconds: true }) : '-'; }

  filteredData: Observable<T[]>;

  isLoaded = false;

  @ContentChild(TemplateRef, { static: true }) itemTemplate: TemplateRef<any>;
  @ViewChild('viewport', { read: CdkVirtualScrollViewport, static: false }) viewport: CdkVirtualScrollViewport;
  @ViewChild('searchInput') searchInput: IonSearchbar;

  private interval: NodeJS.Timeout;

  constructor(
    private modal: ModalController,
    private popup: PopoverController,
    private plt: Platform,
    private injector: Injector,
    private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    if (!this.simpleMode) {
      setTimeout(() => {
        this.viewport?.checkViewportSize();
      }, 50);
      this.plt.resize.subscribe(() => {
        this.viewport?.checkViewportSize();
      });
    }
    if (!this.templateOverride) {
      this.templateOverride = this.itemTemplate;
    }
  }

  ngOnInit() {
    if (!this.templateOverride) {
      this.templateOverride = this.itemTemplate;
    }
    this.loadData();
    if (!this.disabledItem) {
      this.disabledItem = () => false;
    }

    this.interval = setInterval(() => {
      this.cdr.markForCheck();
    }, 10000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  loadData() {
    this.filteredData = isObservable(this.data) ? this.data : of(new Array(...this.data));
    this.filteredData = this.filteredData.pipe(tap(() => {
      this.isLoaded = true;
      setTimeout(() => {
        this.viewport?.checkViewportSize();
        this.cdr.detectChanges();
      });
    }));
  }

  onSearch(event) {
    const keyword: string = event.detail.value;
    this.onSearchInput.emit(keyword);
    setTimeout(() => {
      this.filteredData = isObservable(this.data) ?
        this.data.pipe(map(list => {
          console.log('data', list);
          return this.serverSideSearch ? list : this.getFilteredList(list, keyword);
        }))
        : of(this.getFilteredList(this.data, keyword));
    });
    
  }

  reload() {
    this.isLoaded = false;
    this.viewport.scrollToIndex(0);
    this.filteredData = of([]);
    if (this.searchInput) {
      this.searchInput.value = null;
    }
    this.onReload.emit();

    setTimeout(() => {
      this.loadData();
    }, 50);
  }

  private getFilteredList(list: T[], filterKeyword: string): T[] {
    return list.filter(x => {
      const matchIndex = this.getSearchKey(x).toLowerCase().indexOf(filterKeyword.toLowerCase());
      (x as any).matchIndex = matchIndex;
      return matchIndex > -1;
    }).sort((a, b) => {
        const matchIndex = (a as any).matchIndex - (b as any).matchIndex;
        if (matchIndex !== 0) {
          return matchIndex;
        }
        return this.getSearchKey(a).localeCompare(this.getSearchKey(b));
    });
  }

  isProcessing = false;
  async onSelect(item: T) {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    if (this.onItemSelect) {
      const validating = this.onItemSelect(item);
      let result: boolean;
      if (validating instanceof Promise) {
        console.log('is promise...');
        result = await validating;
      }
      else if (validating instanceof Observable) {
        console.log('is observable...');
        validating.subscribe(pass => {
          if (pass) {
            this.close(item);
          }
        });
        return;
      }
      else {
        console.log('is normal boolean...');
        result = validating;
      }

      if (result) {
        await this.close(item);
      }
      this.isProcessing = false;
    }
    else {
      this.close(item);
    }
  }

  async close(item: T) {
    if (this.closeOnSelect) {
      if (this.nav) {
        const params = this.injector.get(NavParams);
        ModalBack(this.nav, params, this.modal, item);
      }
      else if (this.simpleMode && await this.popup.getTop()) {
        await this.popup.dismiss(item, 'ok');
      }
      else if (await this.modal.getTop()) {
        await this.modal.dismiss(item, 'ok');
      }
      else {
        await this.popup.dismiss(item, 'ok');
      }
    }
  }

  async closeByBtn() {
    if (this.nav) {
      const params = this.injector.get(NavParams);
      ModalBack(this.nav, params, this.modal, null);
    }
    else if (this.simpleMode && await this.popup.getTop()) {
      await this.popup.dismiss();
    }
    else if (await this.modal.getTop()) {
      await this.modal.dismiss();
    }
    else {
      await this.popup.dismiss();
    }
  }

  getSearchTxt() {
    return this.searchText ?? 'Search here';
  }

  ensureNew(list: any[]) {
    return list.copyWithin(list.length, 0);
  }

}
