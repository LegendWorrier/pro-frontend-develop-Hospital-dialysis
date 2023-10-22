import { DraftPanelModule } from './../../share/components/draft-panel/draft-panel.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DialysisPrescriptionEditPageRoutingModule } from './dialysis-prescription-edit-routing.module';

import { DialysisPrescriptionEditPage } from './dialysis-prescription-edit.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { DialysisPrescriptionViewModule } from 'src/app/dialysis/components/dialysis-prescription-view/dialysis-prescription-view.module';
import { FitHeightModule } from 'src/app/directive/fit-height.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DialysisPrescriptionEditPageRoutingModule,
    DialysisPrescriptionViewModule,
    HeaderModule,
    HeaderThemeModule,
    AppPipeModule,
    FilterListModule,
    FitHeightModule,
    AuditNameModule,
    DraftPanelModule
  ],
  declarations: [DialysisPrescriptionEditPage]
})
export class DialysisPrescriptionEditPageModule {}
