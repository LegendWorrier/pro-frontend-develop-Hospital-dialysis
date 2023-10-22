import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IdentityValidatorDirective } from './identity-validator.directive';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, IonicModule, FormsModule],
  declarations: [IdentityValidatorDirective],
  exports: [IdentityValidatorDirective]
})
export class IdentityValidatorModule {}