import { Component, OnInit, Input, Output, EventEmitter, ContentChild, TemplateRef, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ScrollHideConfig } from 'src/app/directive/scroll-hide.directive';
import { ShiftsBase } from '../../shift-base';

@Component({
  selector: 'app-sheet-control',
  templateUrl: './sheet-control.component.html',
  styleUrls: ['./sheet-control.component.scss'],
})
export class SheetControlComponent  implements OnInit {

  @Input() content: IonContent;
  @Input() canFilter: boolean;

  @Input() mainColW: number;
  @Input() mainOffset: number;

  selectedSheet: 'Main' | 'Sub' = "Main";
  filter = "All";
  filterList = ShiftsBase.FILTERLIST;


  @Output() onSheetChange = new EventEmitter<string>();
  @Output() onFilter = new EventEmitter<string>();

  // @ContentChild(TemplateRef) additionalT: TemplateRef<any>;
  // @ViewChild('additional') additional: ViewContainerRef;

  // ------------ UI ------------
  configHeader: ScrollHideConfig = { cssProperty: 'top', maxValue: 132, inverse: false };

  constructor() { }

  ngOnInit() {
    if (!this.mainColW) {
      this.mainColW = 10;
    }
    if (!this.mainOffset) {
      this.mainOffset = 0;
    }
  }

  sheetUpdate(event) {
    this.onSheetChange.emit(event.detail.value);
  }

  updateFilter(event) {
    this.onFilter.emit(event.detail.value);
  }

  AfterViewInit() {
    // if (this.additionalT) {
    //   this.additional.createEmbeddedView(this.additionalT);
    // }
  }

}
