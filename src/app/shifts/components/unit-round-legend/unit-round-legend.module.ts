import { NgModule } from '@angular/core';
import { UnitRoundLegendComponent } from './unit-round-legend.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    UnitRoundLegendComponent
  ],
  exports: [
    UnitRoundLegendComponent
  ]
})
export class UnitRoundLegendModule {}
