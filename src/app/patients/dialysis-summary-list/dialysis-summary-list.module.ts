import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DialysisSummaryListPageRoutingModule } from './dialysis-summary-list-routing.module';

import { DialysisSummaryListPage } from './dialysis-summary-list.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { OptionListModule } from 'src/app/share/components/options-item/option-list.module';
import { PageLoaderModule } from 'src/app/share/components/page-loader/page-loader.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DialysisSummaryListPageRoutingModule,
    HeaderThemeModule,
    OptionListModule,
    PageLoaderModule
  ],
  declarations: [DialysisSummaryListPage]
})
export class DialysisSummaryListPageModule {}
