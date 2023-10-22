import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DialysisRecordEditPage } from './dialysis-record-edit.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    HeaderModule,
    AuditNameModule,
    DatetimeItemWrapperModule
  ],
  declarations: [DialysisRecordEditPage]
})
export class DialysisRecordEditPageModule {}
