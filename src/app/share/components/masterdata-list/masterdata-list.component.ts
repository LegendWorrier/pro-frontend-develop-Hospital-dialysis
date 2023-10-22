import { DataListComponent } from './data-list/data-list.component';
import { MasterdataService } from './../../../masterdata/masterdata.service';
import { ModalService } from './../../service/modal.service';
import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  OnDestroy,
  ViewContainerRef,
  Injector,
  NgModuleRef} from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Data } from 'src/app/masterdata/data';

@Component({
  templateUrl: './masterdata-list.component.html',
})
export class TemplatesComponent {
  @ViewChild('nameDisplay', { static: true }) public nameDisplayTemplate: TemplateRef<any>;
  @ViewChild('nameEdit', { static: true }) public nameEditTemplate: TemplateRef<any>;

  public name: string;

}

@Component({
  selector: 'app-masterdata-list',
  templateUrl: './data-list/data-list.component.html',
  styleUrls: [ './data-list/data-list.component.scss', './masterdata-list.component.scss'],
})
export class MasterdataListComponent extends DataListComponent<Data> implements OnInit, OnDestroy {

  @Input() hasName = true;

  constructor(platform: Platform,
              alertCtl: AlertController,
              modal: ModalService,
              injector: Injector,
              private master: MasterdataService,
              private viewRef: ViewContainerRef,
              private ng: NgModuleRef<any>) {
    super(platform, alertCtl, modal, injector);
  }

  ngOnInit(): void {
    this.sort = (a, b) => a.id - b.id;
    this.dataService = this.master;

    if (this.hasName) {
      const templateComponent = this.viewRef.createComponent(TemplatesComponent, 
        {
          index: 0,
          injector: this.injector,
          ngModuleRef: this.ng
        }).instance;
      templateComponent.name = this.name;

      this.displayList.unshift(templateComponent.nameDisplayTemplate);
      this.editList.unshift(templateComponent.nameEditTemplate);
    }

    super.ngOnInit();
  }

  ngOnDestroy(): void {
      super.ngOnDestroy();
  }

}
