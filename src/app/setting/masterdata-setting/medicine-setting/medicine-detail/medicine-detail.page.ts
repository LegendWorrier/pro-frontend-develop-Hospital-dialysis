import { Component, EnvironmentInjector, Injector, Input, OnInit, TemplateRef, ViewChild, createComponent } from '@angular/core';
import { IonNav, AlertController, NavParams } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Medicine, UsageWays } from 'src/app/masterdata/medicine';
import { StockableDetailPage } from '../../stockable-base-setting/stockable-detail/stockable-detail.page';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

@Component({
  templateUrl: './medicine-detail.page.html',
  styleUrls: ['./medicine-detail.page.scss']
})
export class MedicineDetailCustomTemplate {
  @ViewChild('detail', { static: true }) public detailT: TemplateRef<any>;
  @ViewChild('extra', { static: true }) public extraT: TemplateRef<any>;

  categories: Data[];
  ways = UsageWays;

  readFlag(item: Medicine, flag: UsageWays): boolean {
    return UsageWays.hasFlag(item.usageWays, flag);
  }

  toggleFlag(item: Medicine, flag: UsageWays, value: boolean) {
    if (value) {
      item.usageWays = UsageWays.setFlag(item.usageWays, flag);
    }
    else {
      item.usageWays = UsageWays.removeFlag(item.usageWays, flag);
    }
  }
}

@Component({
  selector: 'app-medicine-detail',
  templateUrl: '../../stockable-base-setting/stockable-detail/stockable-detail.page.html',
  styleUrls: [ '../../stockable-base-setting/stockable-detail/stockable-detail.page.scss' ],
})
export class MedicineDetailPage extends StockableDetailPage<Medicine> implements OnInit {
  @Input() categories: Data[];

  constructor(
    masterdata: MasterdataService,
    injector: Injector,
    nav: IonNav,
    navParam: NavParams,
    alertCtl: AlertController,
    img: ImageAndFileUploadService,
    private env: EnvironmentInjector
    ) {
    super(masterdata, injector, nav, navParam, alertCtl, img);
  }

  ngOnInit(): void {
    const templateComponent = createComponent(MedicineDetailCustomTemplate, 
      {
        environmentInjector: this.env
      }).instance;
    this.detailList.push(templateComponent.detailT);
    this.extra = templateComponent.extraT;

    templateComponent.categories = this.categories;

    this.beforeSave = () => {
      this.tmp.category = this.categories.find(x => x.id === this.tmp.categoryId)?.name;
      return true;
    };
    super.ngOnInit();
  }
}