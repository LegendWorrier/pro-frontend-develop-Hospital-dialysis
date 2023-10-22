import { AfterViewInit, ContentChildren, Directive, Renderer2 } from '@angular/core';
import { IonToolbar } from '@ionic/angular';
import { setupDarkmodeHandler } from '../utils';

@Directive({
  selector: '[appHeaderTheme]'
})
export class HeaderThemeDirective implements AfterViewInit {

  @ContentChildren(IonToolbar) toolbars: IonToolbar[];

  constructor(private renderer: Renderer2) { }

  async ngAfterViewInit() {
    setupDarkmodeHandler((e) => this.setTheme(e));
  }

  setTheme(dark: boolean) {
    if (dark) {
      this.toolbars.forEach(item => {
        this.renderer.setProperty(item, 'color', '');
      });
    }
    else {
      this.toolbars.forEach(item => {
        this.renderer.setProperty(item, 'color', 'primary');
      });
      
    }
  }
}
