import { ElementRef, Renderer2 } from '@angular/core';
import { DomController } from '@ionic/angular';
import { ScrollHideDirective as ScrollHideDirective } from './scroll-hide.directive';

describe('HideSearchDirective', () => {
  let element: ElementRef;
  let renderer: Renderer2;
  let domCtl: DomController;

  beforeEach(() => {

    element = jasmine.createSpyObj('ElementRef', ['nativeElement']);
    renderer = jasmine.createSpyObj('Renderer2', ['']);
    domCtl = jasmine.createSpyObj('DomController', ['']);
  });

  it('should create an instance', () => {
    const directive = new ScrollHideDirective(element, renderer, domCtl);
    expect(directive).toBeTruthy();
  });
});
