import { PatientSchedulePageModule } from './patient-schedule/patient-schedule.module';
import { SwapMenuComponent } from './slot-menu/swap-menu/swap-menu.component';
import { MatLoadingModule } from './components/mat-loading/mat-loading.module';
import { MatLoadingComponent } from './components/mat-loading/mat-loading.component';
import { FindOptionComponent } from './components/find-option/find-option.component';
import { MatAlertComponent } from './components/mat-alert/mat-alert.component';
import { CalendarHeaderComponent } from './components/calendar-header/calendar-header.component';
import { SectionSelectComponent } from './components/section-select/section-select.component';
import { UnitSelectComponent } from './components/unit-select/unit-select.component';
import { TransferMenuComponent } from './slot-menu/transfer-menu/transfer-menu.component';
import { RescheduleMenuComponent } from './slot-menu/reschedule/reschedule-menu.component';
import { AuditNameModule } from './../share/components/audit-name/audit-name.module';
import { SlotDetailComponent } from './slot-detail/slot-detail.component';
import { SlotMenuComponent } from './slot-menu/slot-menu.component';
import { ModalSearchListModule } from './../share/components/modal-search-list/modal-search-list.module';
import { SchedulePage } from './schedule.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SchedulePageRoutingModule } from './schedule-routing.module';

import { HeaderModule } from '../share/header/header.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulePageRoutingModule,
    HeaderModule,
    ModalSearchListModule,
    AuditNameModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatButtonModule,
    MatLoadingModule,
    PatientSchedulePageModule
  ],
  declarations: [
    SchedulePage,
    SlotMenuComponent,
    SlotDetailComponent,
    RescheduleMenuComponent,
    TransferMenuComponent,
    SwapMenuComponent,
    UnitSelectComponent,
    SectionSelectComponent,
    CalendarHeaderComponent,
    MatAlertComponent,
    FindOptionComponent
  ]
})
export class SchedulePageModule {}
