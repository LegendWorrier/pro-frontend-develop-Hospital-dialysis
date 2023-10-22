import { DatetimeItemWrapperModule } from './../../share/components/datetime-item-wrapper/datetime-item-wrapper.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditMedicinePrescriptionPage } from './edit-medicine-prescription.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { FitHeightModule } from 'src/app/directive/fit-height.module';
import { MedicinePrescriptionViewModule } from '../components/medicine-prescription-view/medicine-prescription-view.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    HeaderThemeModule,
    AppPipeModule,
    FitHeightModule,
    MedicinePrescriptionViewModule,
    AuditNameModule,
    DatetimeItemWrapperModule
  ],
  declarations: [EditMedicinePrescriptionPage]
})
export class EditMedicinePrescriptionPageModule {}
