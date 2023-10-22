import { Component, EventEmitter, forwardRef, Input, Output, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => AvShuntComponent),
  multi: true
};

@Component({
  selector: 'av-shunt',
  templateUrl: './av-shunt.component.svg',
  styleUrls: ['./av-shunt.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class AvShuntComponent implements ControlValueAccessor {
  currentSelected: Element[]|NodeListOf<Element>;

  @Input() value: string;
  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

  @Output('onChange') onChange = new EventEmitter<string>();

  /**
   * Shunt Site Names
   */
  shuntName = {
    'l-calf': 'Left Calf',
    'r-calf': 'Right Calf',
    'l-thigh': 'Left Thigh',
    'r-thigh': 'Right Thigh',
    'l-femoral': 'Left Femoral Vein',
    'r-femoral': 'Right Femoral Vein',
    'l-forearm': 'Left Forearm',
    'r-forearm': 'Right Forearm',
    'l-upper-arm': 'Left Upper Arm',
    'r-upper-arm': 'Right Upper Arm',
    'l-subcravian': 'Left SCV',
    'r-subcravian': 'Right SCV',
    'l-jugular': 'Left IJV',
    'r-jugular': 'Right IJV'
  }

  constructor(private renderer: Renderer2) {
  }

  writeValue(obj: any): void {
    this.select(obj, false);
  }

  //Placeholders for the callbacks which are later provided
    //by the Control Value Accessor
  private onChangeCallback: (_: any) => void;

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  // Not Used
  registerOnTouched(fn: any): void {
  }

  // Not Used
  setDisabledState?(isDisabled: boolean): void {
  }

  select(id: string, notifyChange: boolean = true) {
    if (id === this.value) {
      return;
    }

    if (this.currentSelected?.length > 0) {
      this.currentSelected.forEach(x => {
        this.renderer.removeClass(x, 'selected');
      });
    }

    if (!this.shuntName[id]) {
      this.value = null;
    }
    else {
      this.value = id;
      this.setBodyPart(id);
    }
    
    this.valueChange.emit(this.value);

    if (notifyChange) {
      this.onChangeCallback(this.value);
      this.onChange.emit(this.value);
    }
    
  }

  setBodyPart(id: string) {
    let elements = document.querySelectorAll('#'+id+', [data-name='+id+']');
    
    if (elements.length > 0) {
      this.currentSelected = elements;
      elements.forEach(x =>  {
        this.renderer.addClass(x, 'selected');
      });

      this.removeHilight(elements);
    }
  }

  onHover(id: string) {
    let elements = document.querySelectorAll('#'+id+', [data-name='+id+']');

    elements.forEach(x =>  {
      this.renderer.addClass(x, 'hilight');
    });
    
  }

  onLeave(id: string) {
    let elements = document.querySelectorAll('#'+id+', [data-name='+id+']');

    this.removeHilight(elements);
  }

  removeHilight(elements: Element[]|NodeListOf<Element>) {
    elements.forEach(x =>  {
      this.renderer.removeClass(x, 'hilight');
    });
  }
}
