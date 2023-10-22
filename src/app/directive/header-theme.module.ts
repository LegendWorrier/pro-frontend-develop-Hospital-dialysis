import { NgModule } from '@angular/core';
import { HeaderThemeDirective } from './header-theme.directive';

@NgModule({
  declarations: [HeaderThemeDirective],
  exports: [HeaderThemeDirective]
})
export class HeaderThemeModule {}
