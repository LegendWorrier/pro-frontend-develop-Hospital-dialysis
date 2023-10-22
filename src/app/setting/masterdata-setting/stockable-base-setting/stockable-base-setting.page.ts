import { StockableDetailPage } from './stockable-detail/stockable-detail.page';
import { AfterViewInit, Component, ContentChild, ContentChildren, Input, OnInit, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';0
import { Stockable } from 'src/app/masterdata/stockable';
import { MasterdataListComponent } from 'src/app/share/components/masterdata-list/masterdata-list.component';

@Component({
  selector: 'app-stockable-base-setting',
  templateUrl: './stockable-base-setting.page.html',
  styleUrls: ['./stockable-base-setting.page.scss'],
})
export class StockableBaseSettingPage<T extends Stockable> implements OnInit, AfterViewInit {

  @Input() name: string;

  @Input() getCall: Observable<T[]>;
  @Input() addCall: (item: T) => Observable<T>;
  @Input() editCall: (item: T) => Observable<void>;
  @Input() deleteCall: (item: T) => Observable<void>;
  @Input() editPage: { new(...args: any[]): StockableDetailPage<T> } = StockableDetailPage<T>;
  @Input() params: (item: T) => { [key: string]: any };

  @Input() gotoAdd: boolean = false;

  @ContentChild('beforeHeader') beforeHeaderRef: TemplateRef<any>;
  @ContentChild('header') extraHeaderRef: TemplateRef<any>;
  @ContentChildren('detail') detailRef: QueryList<TemplateRef<any>>;
  detailList: TemplateRef<any>[] = [];
  extraHeader: TemplateRef<any>;
  beforeHeader: TemplateRef<any>;

  warning: string;
  canEdit: boolean;

  @ViewChild('list', { static: true }) list: MasterdataListComponent;

  constructor(protected auth: AuthService) {
  }

  ngAfterViewInit(): void {
    this.detailList.push(...this.detailRef);
    this.extraHeader = this.extraHeader ?? this.extraHeaderRef;
    this.beforeHeader = this.beforeHeader ?? this.beforeHeaderRef;
  }

  ngOnInit() {
    this.warning = `Are you sure to delete this ${this.name.toLowerCase()}? (All stock data will be gone forever)`;
    this.canEdit = this.auth.currentUser.isPowerAdmin;
  }

  get getParams() {
    return (item?: T) => {
      
      const param = {
        stockable: item,
        name: this.name,
        addCall: this.addCall,
        editCall: this.editCall,
        deleteCall: this.deleteCall,
        canEdit: this.canEdit
      };
      if (this.params) {
        return Object.assign(param, this.params(item));
      }
      return param;
    };
  }

}

@Component({
  selector: 'app-stockable-setting',
  templateUrl: './stockable-base-setting.page.html',
  styleUrls: ['./stockable-base-setting.page.scss'],
})
export class StockableSettingPage extends StockableBaseSettingPage<Stockable> {}