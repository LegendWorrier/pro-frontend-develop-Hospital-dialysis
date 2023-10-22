import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noComma'
})
export class NoCommaPipe implements PipeTransform {

  transform(value: string): string {
    if (value) {
      return value.replace(/,/g, '');
    } else {
      return value;
    }
  }

}
