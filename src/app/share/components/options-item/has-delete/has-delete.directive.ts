import { ChangeDetectorRef, Directive, Input, OnInit } from '@angular/core';
import { OptionListComponent } from '../option-list.component';

@Directive({
  selector: 'app-option-list[hasDelete]'
})
export class HasDeleteDirective<T extends Entity> implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('hasDelete') option: number | {
    name?: string,
    icon?: string,
    color: string
  };

  constructor(private optionList: OptionListComponent<T>, private cdr: ChangeDetectorRef)
  {
  }

  ngOnInit() {

    const baseItemClasses = this.optionList.itemClasses;
    this.optionList.getClasses = (item: T, i: number): string[] => {
      let classes = [];

      classes = baseItemClasses(item, i);

      if (!item.isActive) {
        classes.push('deleted');
      }

      return classes;
    };

    if (!this.optionList.canEdit) {
      return;
    }

    if (typeof(this.option) === 'number') {
      // add fixed role
      this.optionList.options[this.option].role = 'del';
    }
    else {
      if (!this.option) {
        // default delete option
        this.option = {
          name: 'Delete',
          color: 'danger'
        };
      }

      // add fixed role
      (this.option as any).role = 'del';
      if (this.optionList.options) {
        this.optionList.options.push(this.option);
      }
      else {
        this.optionList.options = [this.option];
      }
    }

  }

}

export interface Entity {
  isActive: boolean;
}
