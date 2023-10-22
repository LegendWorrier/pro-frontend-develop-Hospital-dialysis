import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DialysisPrescriptionListPage } from './dialysis-prescription-list.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { OptionListModule } from 'src/app/share/components/options-item/option-list.module';
import { DialysisPrescriptionEditPageModule } from 'src/app/dialysis/dialysis-prescription-edit/dialysis-prescription-edit.module';
import { ShowDeleteToggleModule } from 'src/app/share/components/show-delete-toggle/show-delete-toggle.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    OptionListModule,
    DialysisPrescriptionEditPageModule,
    ShowDeleteToggleModule,
    AuditNameModule
  ],
  declarations: [DialysisPrescriptionListPage]
})
export class DialysisPrescriptionListPageModule {}
