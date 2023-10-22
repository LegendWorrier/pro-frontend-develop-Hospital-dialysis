import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DataListComponent } from './data-list.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
  ],
  declarations: [
    DataListComponent
  ],
  exports: [
    DataListComponent
  ]
})
export class DataListModule {}
