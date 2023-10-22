import { DatetimeItemWrapperComponent } from './datetime-item-wrapper.component';
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ],
  declarations: [
    DatetimeItemWrapperComponent
  ],
  exports: [
    DatetimeItemWrapperComponent
  ]
})
export class DatetimeItemWrapperModule {}