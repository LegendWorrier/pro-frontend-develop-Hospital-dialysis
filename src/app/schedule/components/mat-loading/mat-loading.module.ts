import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatLoadingComponent } from './mat-loading.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MatProgressSpinnerModule
  ],
  declarations: [
    MatLoadingComponent
  ],
  exports: [
    MatLoadingComponent
  ]
})
export class MatLoadingModule {}
