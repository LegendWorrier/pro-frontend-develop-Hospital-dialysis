import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { DoctorRecordEditPage } from './doctor-record-edit.page';

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
  declarations: [DoctorRecordEditPage]
})
export class DoctorRecordEditPageModule {}
