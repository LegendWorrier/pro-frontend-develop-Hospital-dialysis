import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HemosheetViewPage } from './hemosheet-view.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { SegmentTabsModule } from 'src/app/share/components/segment-tabs/segment-tabs.module';
import { DialysisInfoModule } from '../components/dialysis-info/dialysis-info.module';
import { AssessmentModule } from '../components/assessment/assessment.module';
import { RecordModule } from '../components/record/record.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    SegmentTabsModule,
    DialysisInfoModule,
    AssessmentModule,
    RecordModule
  ],
  declarations: [HemosheetViewPage]
})
export class HemosheetViewPageModule {}
