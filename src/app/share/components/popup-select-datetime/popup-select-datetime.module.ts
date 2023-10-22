import { PopupSelectDatetimeComponent } from './popup-select-datetime.component';
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
    PopupSelectDatetimeComponent
  ],
  exports: [
    PopupSelectDatetimeComponent
  ]
})
export class PopupSelectDatetimeModule {}