import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ShowDeleteToggleComponent),
  multi: true
};

@Component({
  selector: 'show-delete-toggle',
  templateUrl: './show-delete-toggle.component.html',
  styleUrls: ['./show-delete-toggle.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class ShowDeleteToggleComponent implements ControlValueAccessor {
  @Input() checked: boolean;
  @Output() checkedChange = new EventEmitter<boolean>();

  @Output() onChange = new EventEmitter();

  constructor(private renderer: Renderer2, private el: ElementRef) {
    renderer.setAttribute(el.nativeElement, 'slot', 'fixed');
   }


  writeValue(obj: any): void {
    this.checked = obj;
  }

  onChangeCallback;
  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }
  setDisabledState?(isDisabled: boolean): void {
  }

  notify(event) {
    this.onChangeCallback(this.checked);
    this.onChange.emit(event);
  }

}
