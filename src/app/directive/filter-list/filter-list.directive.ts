import { Directive, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Data } from '../../masterdata/data';

@Directive({
  selector: '[appFilterList]',
  exportAs: 'Filter'
})
export class FilterListDirective implements OnInit {
  @Input('appFilterList') masterList: Data[];
  @Input() output: Data[];
  @Output() outputChange = new EventEmitter<Data[]>();
  protected updateEvent = new EventEmitter<string>();

  @Input() customFilter: (item: Data, filter: string) => boolean;

  constructor() { }

  ngOnInit(): void {
    this.updateEvent.pipe(
      debounceTime(50),
      switchMap((data: string) => {
        return of(this.filterData(this.masterList, data));
      })).subscribe(list => {
        this.output = list;
        this.outputChange.emit(this.output);
      });
  }

  protected filterData(dataList: Data[], filteredBy: string) {
    const filtered = filteredBy?.toLowerCase();
    if (!filtered) {
      return dataList;
    }
    const filterLogic = this.customFilter ?? ((item, filtered) => item.name.toLowerCase().indexOf(filtered) > -1);
    return dataList
              .filter(item => filterLogic(item, filtered))
              .sort((a, b) => {
                const compare =
                  a.name.toLowerCase().indexOf(filtered) -
                  b.name.toLowerCase().indexOf(filtered);
                if (compare === 0) {
                  return a.name.localeCompare(b.name);
                }
                return compare;
              });
  }

  @HostListener('ionInput', ['$event'])
  onChange($event) {
    if (!this.masterList || this.masterList.length === 0) {
      return;
    }
    this.updateEvent.emit($event.detail.value);
  }

}
