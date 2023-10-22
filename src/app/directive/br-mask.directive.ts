import { Directive, ElementRef, Host, HostListener, Injectable, Input, OnInit, Optional, SkipSelf, Output, EventEmitter, AfterViewInit, Renderer2 } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgModel } from '@angular/forms';

export class BrMaskModel {
  form?: AbstractControl;
  mask?: string;
  len?: number;
  person?: boolean;
  phone?: boolean;
  phoneNotDDD?: boolean;
  money?: boolean;
  percent?: boolean;
  type?: 'alfa' | 'num' | 'all' = 'alfa';
  decimal?: number = 2;
  decimalCaracter?: string = `,`;
  thousand?: string;
  userCaracters?: boolean = false;
  numberAndTousand?: boolean = false;
  moneyInitHasInt?: boolean = true;
}

@Directive({
  selector: '[brmask]'
})
@Injectable()
export class BrMaskDirective implements OnInit {
  @Input() brmask: BrMaskModel = new BrMaskModel();
  @Input() formControlName: string;

  @Output() onmask: EventEmitter<{masked: string, unmasked: string}> = new EventEmitter<{masked: string, unmasked: string}>();

  /**
  * Event key up in directive
  
  * @constant {string} value
  */
  @HostListener('keyup', ['$event'])
  inputKeyup(event: any): void {
    const value: string = this.returnValue(event.target.value);
    this.setValueInFormControl(value);

    this.onmask.emit({ masked: value, unmasked: this.unformatField(value) });
  }
  @HostListener('ngModelChange', ['$event']) onNgModelChange(e: any) {
    const value: string = this.returnValue(e);
    if (value) {
      this.setValueInFormControl(value, false);
    }
  }

  constructor(
    @Optional()
    private controlContainer: FormGroupDirective,
    private elementRef: ElementRef
    
  ) { }

  ngOnInit(): void {
    if (!this.brmask.type) {
      this.brmask.type = 'all';
    }

    if (!this.brmask.decimal) {
      this.brmask.decimal = 2;
    }
    if (this.brmask.moneyInitHasInt === undefined) {
      this.brmask.moneyInitHasInt = true;
    }

    if (!this.brmask.decimalCaracter) {
      this.brmask.decimalCaracter = ',';
    }
    if (this.controlContainer) {
      if (this.formControlName) {
        this.brmask.form = this.controlContainer.control.get(this.formControlName);
      } else {
        console.warn('Missing FormControlName directive from host element of the component');
      }
    } else {
      console.warn('Can\'t find parent FormGroup directive');
    }
    this.initialValue();
  }

  initialValue(): void {
    const pure = this.elementRef.nativeElement.value;
    const value: string = this.returnValue(pure);
    this.setValueInFormControl(value);
  }
  /**
  * The verification of form
  
  * @example <caption>this.verifyFormControl()</caption>
  * @returns {boolean} return a boolean value
  */
  verifyFormControl(): boolean {
    if (this.brmask.form instanceof FormControl) {
      return true;
    } else {
      return false;
    }
  }

  /**
  * Set Value em FormControl
  
  * @example <caption>this.setValueInFormControl(string)</caption>
  */
  setValueInFormControl(value: string, emitViewToModelChange?: boolean): void {
    this.elementRef.nativeElement.value = value;
    if (!this.verifyFormControl()) {
      return;
    }
    const unmasked = this.unformatField(value);
    this.brmask.form.setValue(unmasked, { emitViewToModelChange });
    this.brmask.form.updateValueAndValidity();
  }

  /**
  * For initial value
  
  * @example <caption>this.setValueInFormControl(string, model)</caption>
  * @param {string} value
  * @param {BrMaskModel} config
  * @returns {string} mask intial value
  */
  writeCreateValue(value: string, config: BrMaskModel = new BrMaskModel()): string {
    if (value && config.phone) {
      return value.replace(/^(?:(?:\+|00)?(55)\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))$/gi, '$1 ($2) $3-$4');
    }
    if (value && config.phoneNotDDD) {
      return this.phoneNotDDDMask(value);
    }
    if (value && config.money) {
      return this.writeValueMoney(value, config);
    }
    if (value && config.person) {
      return this.writeValuePerson(value);
    }

    if (value && config.percent) {
      return this.writeValuePercent(value);
    }

    if (this.brmask.userCaracters) {
      return this.usingSpecialCharacters(value, this.brmask.mask, this.brmask.len);
    }

    if (value && config.mask) {
      this.brmask.mask = config.mask;
      if (config.len) {
        this.brmask.len = config.len;
      }
      return this.onInput(value);
    }
    return value;
  }

  /**
  * For initial value percent
  
  * @example <caption>this.writeValuePercent(string)</caption>
  * @param {string} value
  * @returns {string} mask intial value
  */

  writeValuePercent(value: string): string {
    return value
    .replace(/\D/gi, '')
    .replace(/%/gi, '')
    .replace(/(\d*)$/gi, '%$1');
  }

  /**
  * For initial value person
  
  * @example <caption>this.writeValuePerson(string)</caption>
  * @param {string} value
  * @returns {string} mask intial value
  */
  writeValuePerson(value: string): string {
    if (value.length <= 11) {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/gi, '\$1.\$2.\$3\-\$4');
    } else {
      return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/gi, '\$1.\$2.\$3\/\$4\-\$5');
    }
  }

  /**
  * For initial value money
  
  * @example <caption>this.writeValueMoney(string, model)</caption>
  * @param {string} value
  * @param {BrMaskModel} value
  * @returns {string} mask intial value
  */
  writeValueMoney(value: string, config: BrMaskModel = new BrMaskModel()): string {
    return this.moneyMask(value, config);
  }

  /**
  * Here is one of the main functions
  * responsible for identifying the type of mask
  
  * @example <caption>this.returnValue(string)</caption>
  * @param {string} value
  * @returns {string} mask value
  */
  returnValue(value: string): string {
    if (!this.brmask.mask) { this.brmask.mask = ''; }
    if (value) {
      let formValue = value;
      if (this.brmask.type === 'alfa') {
        formValue = formValue.replace(/\d/gi, '');
      }
      if (this.brmask.type === 'num') {
        formValue = formValue.replace(/\D/gi, '');
      }

      if (this.brmask.money) {
        return this.moneyMask(this.onInput(formValue), this.brmask);
      }
      if (this.brmask.phone) {
        return this.phoneMask(formValue);
      }
      if (this.brmask.phoneNotDDD) {
        return this.phoneNotDDDMask(formValue);
      }
      if (this.brmask.person) {
        return this.peapollMask(formValue);
      }
      if (this.brmask.percent) {
        return this.percentMask(formValue);
      }
      if (this.brmask.numberAndTousand) {
        return this.thousand(formValue);
      }
      if (this.brmask.userCaracters) {
        return this.usingSpecialCharacters(formValue, this.brmask.mask, this.brmask.len);
      }
      return this.onInput(formValue);
    } else {
      return '';
    }
  }

  applyCpfMask(formValue: string) {
    formValue = formValue.replace(/\D/gi, '');
    formValue = formValue.replace(/(\d{3})(\d)/gi, '$1.$2');
    formValue = formValue.replace(/(\d{3})(\d)/gi, '$1.$2');
    formValue = formValue.replace(/(\d{3})(\d{1,2})$/gi, '$1-$2');
    return formValue;
  }

  applyCnpjMask(formValue: string) {
    formValue = formValue.replace(/\D/gi, '');
    formValue = formValue.replace(/(\d{2})(\d)/gi, '$1.$2');
    formValue = formValue.replace(/(\d{3})(\d)/gi, '$1.$2');
    formValue = formValue.replace(/(\d{3})(\d)/gi, '$1/$2');
    formValue = formValue.replace(/(\d{4})(\d{1,4})$/gi, '$1-$2');
    formValue = formValue.replace(/(\d{2})(\d{1,2})$/gi, '$1$2');
    return formValue;
  }

  /**
  * Here we have a mask for percentage
  
  * @example <caption>this.percentMask(string)</caption>
  * @param {string} value
  * @returns {string} string percentage
  */
  private percentMask(value: any): string {
    let tmp = value;
    tmp = tmp.replace(/\D/gi, '');
    tmp = tmp.replace(/%/gi, '');
    tmp = tmp.replace(/([0-9]{0})$/gi, '%$1');
    return tmp;
  }

  /**
  * Here we have a mask for phone in 8 digits or 9 digits
  
  * @example <caption>this.phoneMask(string)</caption>
  * @param {string} value
  * @returns {string} string phone
  */
  private phoneMask(value: any): string {
    let formValue = value;
    if (formValue.length > 14 || formValue.length === 11) {
      this.brmask.len = 15;
      this.brmask.mask = '(99) 99999-9999';
      formValue = formValue.replace(/\D/gi, '');
      formValue = formValue.replace(/(\d{2})(\d)/gi, '$1 $2');
      formValue = formValue.replace(/(\d{5})(\d)/gi, '$1-$2');
      formValue = formValue.replace(/(\d{4})(\d)/gi, '$1$2');
    } else {
      this.brmask.len = 14;
      this.brmask.mask = '(99) 9999-9999';
      formValue = formValue.replace(/\D/gi, '');
      formValue = formValue.replace(/(\d{2})(\d)/gi, '$1 $2');
      formValue = formValue.replace(/(\d{4})(\d)/gi, '$1-$2');
      formValue = formValue.replace(/(\d{4})(\d)/gi, '$1$2');
    }
    return this.onInput(formValue);
  }
  /**
  * Here we have a mask for phone in 8 digits or 9 digits not ddd
  
  * @example <caption>this.phoneMask(string)</caption>
  * @param {string} value
  * @returns {string} string phone
  */
  private phoneNotDDDMask(value: any): string {
    let formValue = value;
    if (formValue.length > 9) {
      this.brmask.len = 10;
      this.brmask.mask = '99999-9999';
      formValue = formValue.replace(/\D/gi, '');
      formValue = formValue.replace(/(\d{5})(\d)/gi, '$1-$2');
      formValue = formValue.replace(/(\d{4})(\d)/gi, '$1$2');
    } else {
      this.brmask.len = 9;
      this.brmask.mask = '9999-9999';
      formValue = formValue.replace(/\D/gi, '');
      formValue = formValue.replace(/(\d{4})(\d)/gi, '$1-$2');
      formValue = formValue.replace(/(\d{4})(\d)/gi, '$1$2');
    }
    return this.onInput(formValue);
  }

  /**
  * Here we have a mask for peapoll ID
  * @example <caption>this.peapollMask(string)</caption>
  * @param {string} value
  * @returns {string} string ID
  */
  private peapollMask(value: any): string {

    let formValue = value;
    if (formValue.length >= 14) {
      if (formValue.length === 14 && formValue.indexOf('-') > 0) {
        this.brmask.len = 14;
        this.brmask.mask = '999.999.999-99';
        formValue = this.applyCpfMask(formValue);
      } else {
        this.brmask.len = 18;
        this.brmask.mask = '99.999.999/9999-99';
        formValue = this.applyCnpjMask(formValue);
      }
    } else {
      this.brmask.len = 14;
      this.brmask.mask = '999.999.999-99';
      formValue = this.applyCpfMask(formValue);
    }
    return this.onInput(formValue);
  }

  /**
  * Here we have a mask for money mask
  * @example <caption>this.moneyMask(string)</caption>
  * @param {string} value
  * @param {BrMaskModel} config
  * @returns {string} string money
  */
  private moneyMask(value: any, config: BrMaskModel): string {
    const decimal = config.decimal || this.brmask.decimal;

    value = value
      .replace(/\D/gi, '')
      .replace(new RegExp('([0-9]{' + decimal + '})$', 'g'), config.decimalCaracter + '$1');
    if (value.length === 1 && !this.brmask.moneyInitHasInt) {
      const dec = Array(decimal - 1).fill(0);
      return `0${config.decimalCaracter}${dec.join('')}${value}`;
    }
    if (value.length === decimal + 1) {
      return '0' + value;
    } else if (value.length > decimal + 2 && value.charAt(0) === '0') {
      return value.substr(1);
    }
    if (config.thousand && value.length > (Number(4) + Number(config.decimal))) {
      const valueOne = `([0-9]{3})${config.decimalCaracter}([0-9]{${config.decimal}}$)`;
      value = value.replace(new RegExp(`${valueOne}`, `g`), `${config.thousand}$1${config.decimalCaracter}$2`);
    }
    if (config.thousand && value.length > (Number(8) + Number(config.decimal))) {
      const valueTwo = `([0-9]{3})${config.thousand}([0-9]{3})${config.decimalCaracter}([0-9]{${config.decimal}}$)`;
      value = value.replace(new RegExp(`${valueTwo}`, `g`), `${config.thousand}$1${config.thousand}$2${config.decimalCaracter}$3`);
    }

    return value;
  }

  /**
  * Responsible for returning the empty mask
  * @example <caption>this.onInput(string)</caption>
  * @param {string} value
  * @returns {string} value
  */
  private onInput(value: any): string {
    return this.formatField(value, this.brmask.mask, this.brmask.len);
  }

  /**
  * Responsible for special characters
  
  * @example <caption>this.usingSpecialCharacters(string)</caption>
  * @param {string} field
  * @param {string} mask
  * @param {number} size
  * @returns {string} value
  */
  private usingSpecialCharacters(field: string, mask: string, size: number): string {
    if (!size) { size = 99999999999; }
    let boleneMask;
    const exp = /\-|\.|\,| /gi;
    const numberOnly = field.toString().replace(exp, '');
    let pos = 0;
    let newValue = '';
    let sizeMask = numberOnly.length;
    for (let i = 0; i < sizeMask; i++) {
      if (i < size) {
        boleneMask = ((mask.charAt(i) === '-') || (mask.charAt(i) === '.') || (mask.charAt(i) === ','));
        if (boleneMask) {
          newValue += mask.charAt(i);
          sizeMask++;
        } else {
          newValue += numberOnly.charAt(pos);
          pos++;
        }
      }
    }
    return newValue;
  }

  /**
  * Responsible formating number
  * @example <caption>this.thousand(string)</caption>
  * @param {string} value
  */
  private thousand(value: string): string {
    let val = value.replace(/\D/gi, '');
    const reverse = val.toString().split('').reverse().join('');
    const thousands = reverse.match(/\d{1,3}/g);
    if (thousands) {
      return thousands.join(`${this.brmask.thousand || '.'}`).split('').reverse().join('');
    }
  }

  /**
  * Responsible for removing special characters
  * @example <caption>this.formatField(string)</caption>
  * @param {string} field
  * @param {string} mask
  * @param {number} size
  * @returns {string} value
  */
  private formatField(field: string, mask: string, size: number): any {
    if (!size) { size = 99999999999; }
    let boleneMask;
    const unmasked = this.unformatField(field);
    let pos = 0;
    let newValue = '';
    let maskSize = unmasked.length;
    for (let i = 0; i < maskSize; i++) {
      if (i < size) {
        boleneMask = (mask.charAt(i) === '-') || (mask.charAt(i) === '.') || (mask.charAt(i) === '/');
        boleneMask = boleneMask || mask.charAt(i) === '_';
        boleneMask = boleneMask || ((mask.charAt(i) === '(') || (mask.charAt(i) === ')') || (mask.charAt(i) === ' '));
        boleneMask = boleneMask || ((mask.charAt(i) === ',') || (mask.charAt(i) === '*') || (mask.charAt(i) === '+'));
        boleneMask = boleneMask || ((mask.charAt(i) === '@') || (mask.charAt(i) === '#') || (mask.charAt(i) === ':'));
        boleneMask = boleneMask || ((mask.charAt(i) === '$') || (mask.charAt(i) === '&') || (mask.charAt(i) === '%'));
        if (boleneMask) {
          newValue += mask.charAt(i);
          maskSize++;
        } else {
          newValue += unmasked.charAt(pos);
          pos++;
        }
      }
    }
    return newValue;
  }

  private unformatField(field: string) {
    if (!field) {
      return field;
    }
    const exp = /\_|\-|\.|\/|\(|\)|\,|\*|\+|\@|\#|\$|\&|\%|\:| /gi;
    const unmasked = field.toString().replace(exp, '');

    if (this.brmask.percent) {
      return (Number.parseFloat(unmasked) * 0.01).toString();
    }

    return unmasked;
  }

  unmaskedValue(value: string) { return this.unformatField(value); }
}