import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FilterListDirective } from './filter-list.directive';
import { SelectSearchDirective } from './select-search.directive';
import { SuggestionListDirective } from './suggestion-list.directive';
import { SuggestionPopoverComponent } from './suggestion-popover/suggestion-popover.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [FilterListDirective, SuggestionListDirective, SuggestionPopoverComponent, SelectSearchDirective],
  exports: [FilterListDirective, SuggestionListDirective, SelectSearchDirective]
})
export class FilterListModule {}
