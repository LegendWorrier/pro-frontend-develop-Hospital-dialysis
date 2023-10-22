import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { MedicinePrescriptionViewComponent } from './medicine-prescription-view.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppPipeModule
  ],
  declarations: [MedicinePrescriptionViewComponent],
  exports: [MedicinePrescriptionViewComponent]
})
export class MedicinePrescriptionViewModule {}
