import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicineRecordViewPageRoutingModule } from './medicine-record-view-routing.module';

import { MedicineRecordViewPage } from './medicine-record-view.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { MedicinePrescriptionViewModule } from 'src/app/patients/components/medicine-prescription-view/medicine-prescription-view.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { ExecutePromtPopupModule } from '../components/execute-promt-popup/execute-promt-popup.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicineRecordViewPageRoutingModule,
    HeaderModule,
    HeaderThemeModule,
    MedicinePrescriptionViewModule,
    AuditNameModule,
    ExecutePromtPopupModule
  ],
  declarations: [MedicineRecordViewPage]
})
export class MedicineRecordViewPageModule {}
