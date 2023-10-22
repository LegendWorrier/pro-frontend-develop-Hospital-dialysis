import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HemoReportPageRoutingModule } from './hemo-report-routing.module';

import { HemoReportPage } from './hemo-report.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { PageLoaderModule } from 'src/app/share/components/page-loader/page-loader.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HemoReportPageRoutingModule,
    HeaderModule,
    PageLoaderModule
  ],
  declarations: [HemoReportPage]
})
export class HemoReportPageModule {}
