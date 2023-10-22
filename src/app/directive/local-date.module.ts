import { NgModule } from '@angular/core';
import { LocalDateDirective } from './local-date.directive';

@NgModule({
  declarations: [LocalDateDirective],
  exports: [LocalDateDirective]
})
export class LocalDateModule {}
