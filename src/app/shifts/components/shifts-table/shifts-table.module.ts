import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShiftsTableComponent } from './shifts-table.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    ShiftsTableComponent
  ],
  exports: [
    ShiftsTableComponent
  ]
})
export class ShiftsTableModule {}
