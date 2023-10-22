import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { SelectAsyncListModule } from 'src/app/share/components/select-async-list/select-async-list.module';
import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { HeaderThemeModule } from './../../directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditAdmissionPage } from './edit-admission.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    DatetimeItemWrapperModule,
    SelectAsyncListModule,
    AuditNameModule
  ],
  declarations: [EditAdmissionPage]
})
export class EditAdmissionPageModule {}
