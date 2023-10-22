import { Component, EnvironmentInjector, EventEmitter, Injector, OnInit, TemplateRef, ViewChild, createComponent } from '@angular/core';
import { IonNav } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Medicine } from 'src/app/masterdata/medicine';
import { MedicineCategorySettingPage } from '../medicine-category-setting/medicine-category-setting.page';
import { MedicineDetailPage } from './medicine-detail/medicine-detail.page';
import { StockableBaseSettingPage } from '../stockable-base-setting/stockable-base-setting.page';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  templateUrl: './medicine-setting.page.html'
})
export class MedicineCustomTemplate {
  @ViewChild('header', { static: true }) public headerT: TemplateRef<any>;
  @ViewChild('detail', { static: true }) public detailT: TemplateRef<any>;
  @ViewChild('beforeHeader', { static: true }) public beforeHeaderT: TemplateRef<any>;

  categories: Data[] = [];

  constructor(private ionNav: IonNav) {
  }

  async category() {
    const onUpdateCat = new EventEmitter<Data[]>();
    onUpdateCat.subscribe(data => this.categories = data);
    await this.ionNav.push(MedicineCategorySettingPage, { categories: this.categories, categoriesChange: onUpdateCat });
  }
}

@Component({
  selector: 'app-medicine-setting',
  templateUrl: '../stockable-base-setting/stockable-base-setting.page.html',
  styleUrls: ['./medicine-setting.page.scss', '../stockable-base-setting/stockable-base-setting.page.scss'],
})
export class MedicineSettingPage extends StockableBaseSettingPage<Medicine> implements OnInit {

  template: MedicineCustomTemplate;
  
  constructor(private master: MasterdataService, auth: AuthService,
      private injector: Injector,
      private env: EnvironmentInjector
    ) {
    super(auth);
    this.getCall = master.getMedicineList();
    this.addCall = (item) => this.master.addMedicine(item);
    this.editCall = (item) => this.master.editMedicine(item);
    this.deleteCall = (item) => this.master.deleteMedicine(item);
    this.name = 'Medicine';
    this.canEdit = this.auth.currentUser.checkPermission('medicine');

    this.template = createComponent(MedicineCustomTemplate, 
      {
        elementInjector: this.injector,
        environmentInjector: this.env
      }).instance;
    
    this.detailList.push(this.template.detailT);
    this.extraHeader = this.template.headerT;
    this.beforeHeader = this.template.beforeHeaderT;

    this.editPage = MedicineDetailPage;
    this.params = (item) => ({ categories: this.template.categories, stockable: item });
  }

  ngOnInit() {
    this.loadCat();
    super.ngOnInit();
  }

  loadCat() {
    this.master.getMedicineCategoryList().subscribe(data => {
      this.template.categories = data;
    });
  }

}