import { LocalDateModule } from './../../../directive/local-date.module';
import { PickTimeComponent } from './../pick-time/pick-time.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DialysisInfoComponent } from './dialysis-info.component';
import { DialysisPrescriptionViewModule } from '../dialysis-prescription-view/dialysis-prescription-view.module';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { MatTableModule } from '@angular/material/table';
import { CosignRequestPopupModule } from '../cosign-request-popup/cosign-request-popup.module';
import { AuditNameModule } from 'src/app/share/components/audit-name/audit-name.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DialysisPrescriptionViewModule,
    AppPipeModule,
    MatTableModule,
    CosignRequestPopupModule,
    AuditNameModule,
    LocalDateModule
  ],
  declarations: [DialysisInfoComponent, PickTimeComponent],
  exports: [DialysisInfoComponent, PickTimeComponent]
})
export class DialysisInfoModule {}
