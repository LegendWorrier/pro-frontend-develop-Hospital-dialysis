import { SignaturePadComponent } from './signature-pad.component';
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
    SignaturePadComponent
  ],
  exports: [
    SignaturePadComponent
  ]
})
export class SignaturePadModule {}