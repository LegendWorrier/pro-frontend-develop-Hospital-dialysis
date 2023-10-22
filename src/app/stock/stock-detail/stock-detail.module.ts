import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockDetailPageRoutingModule } from './stock-detail-routing.module';

import { StockDetailPage } from './stock-detail.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { PageLoaderModule } from 'src/app/share/components/page-loader/page-loader.module';
import { DatetimeItemWrapperModule } from 'src/app/share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { AdjustInfoComponent } from './adjust-info/adjust-info.component';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StockDetailPageRoutingModule,
    HeaderModule,
    HeaderThemeModule,
    DatetimeItemWrapperModule,
    PageLoaderModule
  ],
  declarations: [StockDetailPage, AdjustInfoComponent]
})
export class StockDetailPageModule {}
