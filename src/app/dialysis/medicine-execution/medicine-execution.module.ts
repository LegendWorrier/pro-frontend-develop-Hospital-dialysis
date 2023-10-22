import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicineExecutionPage } from './medicine-execution.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    HeaderThemeModule
  ],
  declarations: [MedicineExecutionPage]
})
export class MedicineExecutionPageModule {}
