import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HeaderModule } from 'src/app/share/header/header.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { PatientMenuComponent } from './patient-menu.component';
import { DialysisPrescriptionListPageModule } from 'src/app/dialysis/dialysis-prescription-list/dialysis-prescription-list.module';
import { HemosheetListPageModule } from 'src/app/dialysis/hemosheet-list/hemosheet-list.module';
import { ModalBaseModule } from 'src/app/share/modal-base/modal-base.module';
import { AvShuntViewPageModule } from 'src/app/dialysis/av-shunt-view/av-shunt-view.module';
import { MedicinePrescriptionListPageModule } from '../medicine-prescription-list/medicine-prescription-list.module';
import { LabPatientPageModule } from './../../lab-exam/lab-patient/lab-patient.module';
import { MedHistoryPageModule } from '../med-history/med-history.module';
import { AdmissionListPageModule } from '../admission-list/admission-list.module';
import { DialysisSummaryListPageModule } from '../dialysis-summary-list/dialysis-summary-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    HeaderThemeModule,
    AppPipeModule,
    ModalBaseModule,
    DialysisPrescriptionListPageModule,
    MedicinePrescriptionListPageModule,
    HemosheetListPageModule,
    AvShuntViewPageModule,
    LabPatientPageModule,
    MedHistoryPageModule,
    AdmissionListPageModule,
    DialysisSummaryListPageModule
  ],
  declarations: [PatientMenuComponent],
  exports: [PatientMenuComponent]
})
export class PatientMenuModule {}
