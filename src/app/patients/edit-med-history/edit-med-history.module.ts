import { DatetimeItemWrapperModule } from 'src/app/share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditMedHistoryPage } from './edit-med-history.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    AuditNameModule,
    DatetimeItemWrapperModule
  ],
  declarations: [EditMedHistoryPage]
})
export class EditMedHistoryPageModule {}
