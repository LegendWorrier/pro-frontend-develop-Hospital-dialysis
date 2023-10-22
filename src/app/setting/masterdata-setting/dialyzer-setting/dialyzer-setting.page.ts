import { Component, EnvironmentInjector, Injector, TemplateRef, ViewChild, createComponent} from '@angular/core';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AuthService } from 'src/app/auth/auth.service';
import { StockableBaseSettingPage } from '../stockable-base-setting/stockable-base-setting.page';
import { Dialyzer, DialyzerType, MembraneType } from 'src/app/masterdata/dialyzer';
import { StockableDetailPage } from '../stockable-base-setting/stockable-detail/stockable-detail.page';
import { AlertController, IonNav, NavParams } from '@ionic/angular';
import { ImageAndFileUploadService } from 'src/app/share/service/image-and-file-upload.service';

@Component({
  templateUrl: './dialyzer-setting.page.html'
})
export class DialyzerCustomTemplate {
  membraneTypeList = Object.keys(MembraneType).filter(x => !isNaN(Number(MembraneType[x]))).map(k => ({ txt: k, v: MembraneType[k] }));
  fluxList = Object.keys(DialyzerType).filter(x => !isNaN(Number(DialyzerType[x]))).map(k => ({ txt: k, v: DialyzerType[k] }));

  @ViewChild('header', { static: true }) public headerT: TemplateRef<any>;
  @ViewChild('detail', { static: true }) public detailT: TemplateRef<any>;
  @ViewChild('edit', { static: true }) public editT: TemplateRef<any>;

  getClassifiedName(item: Dialyzer) {
    let celluloseType;
    switch (item.membrane) {
      case MembraneType.Substituted:
        celluloseType = 'Sub.';
        break;
      case MembraneType.Unsubstituted:
        celluloseType = 'Unsub.';
        break;
      case MembraneType.Synthetic:
        celluloseType = 'Synth.';
        break;
      default:
        break;
    }
    let fluxType;
    switch (item.flux) {
      case DialyzerType.HighFlux:
        fluxType = 'High Flux';
        break;
      case DialyzerType.LowFlux:
        fluxType = 'Low Flux';
        break;
      case DialyzerType.DoubleHighFlux:
        fluxType = 'Dlb Hi Flux';
        break;
      default:
        break;
    }

    return `${celluloseType} - ${fluxType}`;
  }
}

@Component({
  templateUrl: '../stockable-base-setting/stockable-detail/stockable-detail.page.html',
  styleUrls: [ '../stockable-base-setting/stockable-detail/stockable-detail.page.scss' ],
})
export class DialyzerDetailPage extends StockableDetailPage<Dialyzer> {

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

    const templateComponent = createComponent(DialyzerCustomTemplate, 
      {
        environmentInjector: this.env
      }).instance;
    this.detailList.push(templateComponent.editT);
  }
}

@Component({
  selector: 'app-dialyzer-setting',
  templateUrl: '../stockable-base-setting/stockable-base-setting.page.html',
  styleUrls: ['./dialyzer-setting.page.scss', '../stockable-base-setting/stockable-base-setting.page.scss'],
})
export class DialyzerSettingPage extends StockableBaseSettingPage<Dialyzer> {


  constructor(private master: MasterdataService, auth: AuthService,
      private injector: Injector,
      private env: EnvironmentInjector
    ) {
    super(auth);
    this.getCall = master.getDialyzerList();
    this.addCall = (item) => this.master.addDialyzer(item);
    this.editCall = (item) => this.master.editDialyzer(item);
    this.deleteCall = (item) => this.master.deleteDialyzer(item);
    this.name = 'Dialyzer';
    this.canEdit = this.auth.currentUser.checkPermission('dialyzer');

    const templateComponent = createComponent(DialyzerCustomTemplate, 
      {
        environmentInjector: this.env
      }).instance;
    
    this.detailList.push(templateComponent.detailT);
    this.extraHeader = templateComponent.headerT;

    this.editPage = DialyzerDetailPage;
  }

}
