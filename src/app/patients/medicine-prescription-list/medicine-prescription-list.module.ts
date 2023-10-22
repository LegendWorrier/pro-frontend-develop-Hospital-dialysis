import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicinePrescriptionListPageRoutingModule } from './medicine-prescription-list-routing.module';

import { MedicinePrescriptionListPage } from './medicine-prescription-list.page';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { OptionListModule } from 'src/app/share/components/options-item/option-list.module';
import { ShowDeleteToggleModule } from 'src/app/share/components/show-delete-toggle/show-delete-toggle.module';
import { EditMedicinePrescriptionPageModule } from '../edit-medicine-prescription/edit-medicine-prescription.module';
import { SelectMedicinePageModule } from '../select-medicine/select-medicine.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicinePrescriptionListPageRoutingModule,
    HeaderThemeModule,
    HeaderModule,
    OptionListModule,
    ShowDeleteToggleModule,
    EditMedicinePrescriptionPageModule,
    SelectMedicinePageModule
  ],
  declarations: [MedicinePrescriptionListPage]
})
export class MedicinePrescriptionListPageModule {}
