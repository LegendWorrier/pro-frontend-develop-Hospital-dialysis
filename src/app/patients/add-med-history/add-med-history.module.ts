import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddMedHistoryPage } from './add-med-history.page';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { DatetimeItemWrapperModule } from 'src/app/share/components/datetime-item-wrapper/datetime-item-wrapper.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    FilterListModule,
    DatetimeItemWrapperModule
  ],
  declarations: [AddMedHistoryPage]
})
export class AddMedHistoryPageModule {}
