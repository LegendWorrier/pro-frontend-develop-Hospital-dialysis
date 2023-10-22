import { HeaderThemeModule } from './../../directive/header-theme.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PatientSchedulePage } from './patient-schedule.page';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PatientScheduleMenuComponent } from '../slot-menu/patient-schedule-menu/patient-schedule-menu.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderThemeModule,
    MatDatepickerModule
  ],
  declarations: [PatientSchedulePage, PatientScheduleMenuComponent]
})
export class PatientSchedulePageModule {}
