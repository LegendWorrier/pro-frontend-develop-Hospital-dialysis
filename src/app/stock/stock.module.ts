import { DatetimeItemWrapperModule } from './../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { SegmentTabsModule } from 'src/app/share/components/segment-tabs/segment-tabs.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockPageRoutingModule } from './stock-routing.module';

import { StockPage } from './stock.page';
import { HeaderModule } from '../share/header/header.module';
import { PageLoaderModule } from '../share/components/page-loader/page-loader.module';
import { ModalSearchListModule } from '../share/components/modal-search-list/modal-search-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    SegmentTabsModule,
    PageLoaderModule,
    ModalSearchListModule,
    DatetimeItemWrapperModule,
    StockPageRoutingModule
  ],
  declarations: [StockPage]
})
export class StockPageModule {}
