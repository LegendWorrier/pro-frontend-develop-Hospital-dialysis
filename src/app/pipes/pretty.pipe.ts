import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pretty'
})
export class PrettyPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    
    if (!value) {
      return value;
    }

    let group = []; // List of preserved groups
    let toProcess = []; // List of to be splitted and processed texts
    let preGroup = value.split('$$');
    for (let i = 0; i < preGroup.length; i++) {
      const item = preGroup[i];
      const tmp = item.split('$');
      if (tmp.length > 1) {
        group.push(...tmp.slice(0, -1));
        toProcess.push(tmp[tmp.length-1]);
      }
      else {
        if (i%2 !== 0) {
          group.push(item);
        }
        else {
          toProcess.push(item);
        }
      }
    }

    group = group.filter(x => !!x);
    toProcess = toProcess.filter(x => !!x);

    const startWithGroup = group.length > toProcess.length;
    const totalToken = group.length + toProcess.length;

    let result = '';
    let current: string;
    for (let i = 0; i < totalToken; i++) {
      if (startWithGroup && i%2 === 0) {
        // preserved
        current = group[i/2];
      }
      else {
        // process
        current = toProcess[i/2];
        let tmp = current.split(/(?<=[a-z])(?=[^a-z])|(?<=[^0-9])(?=[0-9]+)|(?<=[0-9])(?=[^0-9])/);
        tmp.forEach((x, i, list) => list[i] = x.charAt(0).toUpperCase() + x.slice(1));
        current = tmp.join(' ');
      }
      
      current = current.replace('_', '-');
      result += ` ${current}`;
    }

    result = result.slice(1);

    return result;
  }

}
