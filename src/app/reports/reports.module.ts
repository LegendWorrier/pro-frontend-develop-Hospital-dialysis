import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsPageRoutingModule } from './reports-routing.module';

import { ReportsPage } from './reports.page';
import { HeaderThemeModule } from '../directive/header-theme.module';
import { ShareComponentsModule } from '../share/components/share-components.module';
import { TelerikReportingModule } from '@progress/telerik-angular-report-viewer';
import { HeaderModule } from '../share/header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    HeaderModule,
    ShareComponentsModule,
    ReportsPageRoutingModule,
    TelerikReportingModule
  ],
  declarations: [ReportsPage]
})
export class ReportsPageModule {}
