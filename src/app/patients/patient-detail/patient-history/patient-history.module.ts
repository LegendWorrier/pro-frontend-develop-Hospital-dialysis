import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PatientHistoryPage } from './patient-history.page';
import { HeaderModule } from 'src/app/share/header/header.module';
import { PatientHistoryPageRoutingModule } from './patient-history-routing.module';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    FilterListModule,
    PatientHistoryPageRoutingModule
  ],
  declarations: [PatientHistoryPage]
})
export class PatientHistoryPageModule {}
