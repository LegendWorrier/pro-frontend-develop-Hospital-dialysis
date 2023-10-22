import { NgModule } from '@angular/core';
import { FitHeightDirective } from './fit-height.directive';

@NgModule({
  declarations: [FitHeightDirective],
  exports: [FitHeightDirective]
})
export class FitHeightModule {}
