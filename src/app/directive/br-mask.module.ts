import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrMaskDirective } from './br-mask.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [BrMaskDirective],
  exports: [BrMaskDirective],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BrMaskModule {}
