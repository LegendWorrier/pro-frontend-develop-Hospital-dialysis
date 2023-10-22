import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DialysisSummaryPageRoutingModule } from './dialysis-adequacy-routing.module';

import { DialysisAdequacyPage } from './dialysis-adequacy.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { PageLoaderModule } from 'src/app/share/components/page-loader/page-loader.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    HeaderThemeModule,
    PageLoaderModule,
    DialysisSummaryPageRoutingModule
  ],
  declarations: [DialysisAdequacyPage]
})
export class DialysisAdequacyPageModule {}
