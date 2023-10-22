import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelectMedicinePage } from './select-medicine.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    HeaderThemeModule,
    FilterListModule
  ],
  declarations: [SelectMedicinePage]
})
export class SelectMedicinePageModule {}
