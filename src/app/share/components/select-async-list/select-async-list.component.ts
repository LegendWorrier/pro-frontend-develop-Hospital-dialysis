import { NgForOfContext } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ModalService } from '../../service/modal.service';
import { ListDataDirective } from './list-data.directive';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectAsyncListComponent),
  multi: true
};

@Component({
  selector: 'app-select',
  templateUrl: './select-async-list.component.html',
  styleUrls: ['./select-async-list.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class SelectAsyncListComponent<T> implements OnInit, AfterViewInit, ControlValueAccessor {

  constructor(private plt: Platform, private modalService: ModalService, private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

  get width() {
    return this.plt.width();
  }
  @Input() dataList: Observable<T[]>;
  @Input() label: string;
  @Input() name: string;
  @Input() buttonName: string;
  @Input() placeholder: string;
  @Input() required: boolean;

  @Input() selectedText: string;

  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() custom = false;
  @Input() addPage: any;
  @Input() addPageProps: { [name: string]: any };
  @Input() addedCallback: (data: any) => void;

  @Input() emptyDisplay: any;
  @Input() lines: string;

  disabled: boolean;

  @ContentChild(ListDataDirective, {read: TemplateRef}) itemTemplate: TemplateRef<T>;
  @ViewChild('empty') empty: ElementRef;

  onChangeCallback;

  get isCustomString() {
    return this.emptyDisplay && typeof(this.emptyDisplay) === 'string';
  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    if (this.dataList) {
      this.dataList = this.dataList.pipe(tap(data => {
        if (!data || data.length === 0) {
          setTimeout(() => {
            this.updateEmptyDisplay();
          }, 50);
        }
      }));

    }
  }

  updateEmptyDisplay() {
    // console.log(this.empty)
    if (this.empty && this.emptyDisplay) {
      let display;
      if (typeof(this.emptyDisplay) === 'string') {
        const txt = this.renderer.createElement('ion-text');
        this.renderer.setProperty(txt, 'color', 'danger');
        this.renderer.setStyle(txt, 'fontStyle', 'italic');
        this.renderer.appendChild(txt, this.renderer.createText(this.emptyDisplay));
        display = txt;
      }
      else {
        display = this.emptyDisplay;
      }
      // ensure clean content
      const oldChild = this.empty.nativeElement.childNodes[0];
      if (oldChild) {
        this.renderer.removeChild(this.empty.nativeElement, oldChild);
      }

      this.renderer.appendChild(this.empty.nativeElement, display);
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  notify(event) {
    this.onChangeCallback(this.value);
    this.onChange.emit(event);
  }

  async addNew() {
    const modal = await this.modalService.openModal(this.addPage, this.addPageProps);
    const detail = await modal.onDidDismiss();
    if (detail.role === 'OK') {
      this.addedCallback(detail.data);
    }
  }

  // returns the context for an item
  getItemContext(item: T, list: T[], index: number): NgForOfContext<T> {
    return new NgForOfContext(item, list, index, list.length);
  }

}
