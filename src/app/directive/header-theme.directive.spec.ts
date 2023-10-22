import { Renderer2 } from '@angular/core';
import { HeaderThemeDirective } from './header-theme.directive';

describe('HeaderThemeDirective', () => {
  let renderer: Renderer2;

  beforeEach(() => {
    renderer = jasmine.createSpyObj('Renderer2', ['']);
  });
  
  it('should create an instance', () => {
    const directive = new HeaderThemeDirective(renderer);
    expect(directive).toBeTruthy();
  });
});
