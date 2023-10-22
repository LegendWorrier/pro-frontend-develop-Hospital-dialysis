import { StockableBaseSettingPage, StockableSettingPage } from './stockable-base-setting.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StockableDetailPage } from './stockable-detail/stockable-detail.page';
import { MasterdataListModule } from 'src/app/share/components/masterdata-list/masterdata-list.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MasterdataListModule,
    HeaderThemeModule
  ],
  declarations: [
    StockableBaseSettingPage,
    StockableSettingPage,
    StockableDetailPage
  ],
  exports: [
    StockableBaseSettingPage,
    StockableSettingPage,
    StockableDetailPage
  ]
})
export class StockableBaseSettingPageModule {}
