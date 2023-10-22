import { ModalSearchListModule } from './../../share/components/modal-search-list/modal-search-list.module';
import { FilterListModule } from './../../directive/filter-list/filter-list.module';
import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HemosheetEditPageRoutingModule } from './hemosheet-edit.routing.module';

import { HemosheetEditPage } from './hemosheet-edit.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { SelectAsyncListModule } from 'src/app/share/components/select-async-list/select-async-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HemosheetEditPageRoutingModule,
    HeaderModule,
    HeaderThemeModule,
    AppPipeModule,
    SelectAsyncListModule,
    DatetimeItemWrapperModule,
    FilterListModule,
    ModalSearchListModule
  ],
  declarations: [HemosheetEditPage]
})
export class HemosheetEditPageModule {}
