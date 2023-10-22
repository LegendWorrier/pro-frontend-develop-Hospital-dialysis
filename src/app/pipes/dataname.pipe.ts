import { Pipe, PipeTransform } from '@angular/core';
import { Data } from '../masterdata/data';

@Pipe({
  name: 'dataname'
})
export class DatanamePipe implements PipeTransform {

  transform(value: number[], ...args: unknown[]): string {
    const map = args[0] as Data[];
    if (!value) {
      return null;
    }
    return value.map((data) => map?.find(s => s.id === data)?.name || '?').join(', ');
  }

}
