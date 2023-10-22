import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PatientDetailPageRoutingModule } from './patient-detail-routing.module';

import { PatientDetailPage } from './patient-detail.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { PatientMenuModule } from '../patient-menu/patient-menu.module';
import { TagModule } from 'src/app/share/components/tag/tag.module';
import { SegmentTabsModule } from 'src/app/share/components/segment-tabs/segment-tabs.module';
import { DialysisInfoModule } from 'src/app/dialysis/components/dialysis-info/dialysis-info.module';
import { AssessmentModule } from 'src/app/dialysis/components/assessment/assessment.module';
import { RecordModule } from 'src/app/dialysis/components/record/record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SegmentTabsModule,
    PatientDetailPageRoutingModule,
    HeaderModule,
    AppPipeModule,
    PatientMenuModule,
    TagModule,
    DialysisInfoModule,
    AssessmentModule,
    RecordModule
  ],
  declarations: [PatientDetailPage, BasicInfoComponent]
})
export class PatientDetailPageModule {}
