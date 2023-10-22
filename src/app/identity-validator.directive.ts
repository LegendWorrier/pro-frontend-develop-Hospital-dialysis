import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { IdValidator } from './identity';

@Directive({
  selector: '[appIdentity]',
  providers: [{provide: NG_VALIDATORS, useExisting: IdentityValidatorDirective, multi: true}]
})
export class IdentityValidatorDirective implements Validator {

  @Input('appIdentity') isId: boolean;
  @Input() countryCode: string;

  constructor() { }

  validate(control: AbstractControl): ValidationErrors {
    return IdValidator.validId(!this.isId, this.countryCode)(control);
  }

  registerOnValidatorChange?(fn: () => void): void {
    
  }

}
