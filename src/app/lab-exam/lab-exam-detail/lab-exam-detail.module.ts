import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { HeaderThemeModule } from './../../directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LabExamDetailPageRoutingModule } from './lab-exam-detail-routing.module';

import { LabExamDetailPage } from './lab-exam-detail.page';
import { LocalDateModule } from 'src/app/directive/local-date.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LabExamDetailPageRoutingModule,
    HeaderThemeModule,
    AuditNameModule,
    DatetimeItemWrapperModule,
    LocalDateModule
  ],
  declarations: [LabExamDetailPage]
})
export class LabExamDetailPageModule {}
