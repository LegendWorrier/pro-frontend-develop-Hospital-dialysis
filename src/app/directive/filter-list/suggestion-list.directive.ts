import { Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { IonInput, Platform, PopoverController } from '@ionic/angular';
import { isHandheldPlatform } from 'src/app/utils';
import { Data } from '../../masterdata/data';
import { FilterListDirective } from './filter-list.directive';
import { SuggestionPopoverComponent } from './suggestion-popover/suggestion-popover.component';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appSuggestionList]',
  exportAs: 'Suggestion'
})
export class SuggestionListDirective extends FilterListDirective implements OnInit {
  @Input('appSuggestionList') masterList: Data[];
  isShow = false;
  suggest: HTMLIonPopoverElement;
  isOpenning: boolean;

  @Output() onSelect = new EventEmitter<Data>();

  constructor(
    private popCtl: PopoverController,
    private el: ElementRef<IonInput>,
    private ng: NgModel,
    private plt: Platform) {
    super();
  }

  isMobileOrTablet = isHandheldPlatform(this.plt);

  ngOnInit(): void {
    super.ngOnInit();
    if (this.isMobileOrTablet) {
      // console.log('mobile')
      this.el.nativeElement.readonly = true;
    }
  }

  @HostListener('ionFocus', ['$event'])
  async onSelectHost($event) {
    if (!this.masterList || this.masterList.length === 0) {
      return true;
    }
    if (this.isShow || !this.isOpenning) {
      const input = await this.el.nativeElement.getInputElement();
      input.blur();
      // give back the focus to currently focused element
      const target = $event.detail.relatedTarget;
      if (target) {
        target.focus();
      }
      return;
    }
    this.showSuggestion($event);
    this.isOpenning = false;
  }

  @HostListener('touchstart')
  onTouch() {
    if (!this.masterList || this.masterList.length === 0) {
      return true;
    }
    this.isOpenning = true;
    return true;
  }

  @HostListener('mousedown')
  onMousedown() {
    if (!this.masterList || this.masterList.length === 0) {
      return true;
    }
    this.isOpenning = true;
    return true;
  }

  async showSuggestion(ev: any) {
    this.isShow = true;
    this.updateEvent.emit(this.el.nativeElement.value as string);

    if (this.isMobileOrTablet) {
      this.suggest = await this.popCtl.create({
        component: SuggestionPopoverComponent,
        showBackdrop: true,
        componentProps: {
          value: this.el.nativeElement.value,
          list: this.output,
          listChange: this.outputChange,
          searchEvent: this.updateEvent,
          isPanel: true
        },
        cssClass: 'searchable-panel'
      });
    }
    else {
      this.suggest = await this.popCtl.create({
        component: SuggestionPopoverComponent,
        event: ev,
        showBackdrop: false,
        componentProps: {
          value: this.el.nativeElement.value,
          list: this.output,
          listChange: this.outputChange,
          searchEvent: this.updateEvent
        },
        keyboardClose: false
      });
    }

    this.suggest.present();
    const selected = await this.suggest.onWillDismiss();
    if (selected.role === 'OK') {
      this.el.nativeElement.value = selected.data?.name ?? selected.data;
      if (this.ng) {
        this.ng.control.setValue(this.el.nativeElement.value);
      }
      this.onSelect.emit(selected.data);
    }
    this.isShow = false;
  }

}
