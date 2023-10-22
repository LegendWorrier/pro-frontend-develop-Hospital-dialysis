import { LocalDateModule } from './../../../directive/local-date.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ExecutePromtPopupComponent } from './execute-promt-popup.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocalDateModule
  ],
  declarations: [ExecutePromtPopupComponent],
  exports: [ExecutePromtPopupComponent]
})
export class ExecutePromtPopupModule {}
