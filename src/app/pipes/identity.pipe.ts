import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'identity'
})
export class IdentityPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return undefined;
    }

    if (value.length === 13) {
      // national id
      
      return `${value[0]}-${value.substring(1, 5)}-${value.substring(5, 10)}-${value.substring(10, 12)}-${value[12]}`;
     }
     else if (value.length === 9 || value.length === 7) {
      // passport

      return value;
     }
    return value;
  }

}
