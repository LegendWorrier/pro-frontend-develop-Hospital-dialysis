import { LabPopoverModule } from './popover/lab-popover.module';
import { ScrollHideModule } from './../../directive/scroll-hide.module';
import { SegmentTabsModule } from './../../share/components/segment-tabs/segment-tabs.module';
import { MatTableModule } from '@angular/material/table';
import { HeaderModule } from 'src/app/share/header/header.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LabPatientPageRoutingModule } from './lab-patient-routing.module';

import { LabPatientPage } from './lab-patient.page';
import { AddLabExamPageModule } from '../add-lab-exam/add-lab-exam.module';
import { LabExamDetailPageModule } from '../lab-exam-detail/lab-exam-detail.module';
import { NgxPrintModule } from 'ngx-print';
import { LineChartModule } from 'ngx-charts/projects/swimlane/ngx-charts/src/lib/line-chart/line-chart.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabPatientPageRoutingModule,
    HeaderModule,
    HeaderThemeModule,
    SegmentTabsModule,
    ScrollHideModule,
    MatTableModule,
    LineChartModule,
    NgxPrintModule,
    LabExamDetailPageModule,
    AddLabExamPageModule,
    LabPopoverModule
  ],
  declarations: [LabPatientPage]
})
export class LabPatientPageModule {}
