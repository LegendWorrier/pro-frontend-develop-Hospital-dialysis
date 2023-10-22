import { PopupStringInputComponent } from './popup-string-input.component';
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
    PopupStringInputComponent
  ],
  exports: [
    PopupStringInputComponent
  ]
})
export class PopupStringInputModule {}