import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { DialysisPrescriptionViewComponent } from './dialysis-prescription-view.component';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppPipeModule
  ],
  declarations: [DialysisPrescriptionViewComponent],
  exports: [DialysisPrescriptionViewComponent]
})
export class DialysisPrescriptionViewModule {}
