import { AbstractControl, FormControl, ValidatorFn } from "@angular/forms";

export function validateId(value: string, countryCode?: string): boolean {
  switch (countryCode) {
    case 'JP':
      // TODO : implement this when expand to Japan
      break;
  
    default:
      return validateTH(value);
  }
}

export function getPlaceholder(countryCode?: string): string {
  
  switch (countryCode) {
    case 'JP':
      // TODO : implement this when expand to Japan
      break;
  
    default:
      return placeholderTH;
  }
}

export function getMasking(countryCode?: string): string {
  
  switch (countryCode) {
    case 'JP':
      // TODO : implement this when expand to Japan
      break;
  
    default:
      return maskingTH;
  }
}

export function getFiltered(value, countryCode?: string): string {
  switch (countryCode) {
    case 'JP':
      // TODO : implement this when expand to Japan
      break;
  
    default:
      return filterTH(value);
  }
}

export class IdValidator {
  static validId(isPassport: boolean, countryCode?: string): ValidatorFn {

    return (control: AbstractControl) => {
      if (isPassport) {
        return (null);
      }
      const value = control.value;
      if (!value) {
        return (null);
      }
      if (validateId(value, countryCode)) {
        return (null);
      }
      
      return ({validId: true});
      
    };
  }
}

export function defaultFilter(value: string) {
  // Removes non alphanumeric characters
  const filteredValue = value.replace(/[^a-zA-Z0-9]+/g,'');
  return filteredValue;
}


export const placeholderTH = "X-XXXX-XXXXX-XX-X";
export const maskingTH = "0-0000-00000-00-0";

export function validateTH(value: string) {
  const id = value.replace(/-/gi, '');
  if (id.length != 13) { 
    return false;
  }
  // STEP 1 - get only first 12 digits
  let sum: number = 0;
  for (let i = 0; i < 12; i++) {
    // STEP 2 - multiply each digit with each index (reverse)
    // STEP 3 - sum multiply value together
    sum += parseInt(id.charAt(i)) * (13 - i);
  }
  // STEP 4 - mod sum with 11
  let mod = sum % 11;
  // STEP 5 - subtract 11 with mod, then mod 10 to get unit
  let check = (11 - mod) % 10;
  // STEP 6 - if check is match the digit 13th is correct
  if (check == parseInt(id.charAt(12))) {
    return true;
  }
  return false;
}

export function filterTH(value: string) {
  return defaultFilter(value).substring(0, 13);
}
