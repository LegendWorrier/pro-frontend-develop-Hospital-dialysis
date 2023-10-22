import { Renderer2 } from '@angular/core';
import { FitHeightDirective } from './fit-height.directive';

describe('FitHeightDirective', () => {
  let renderer: Renderer2;

  beforeEach(() => {
    renderer = jasmine.createSpyObj('Renderer2', ['']);
  });

  it('should create an instance', () => {
    const directive = new FitHeightDirective(null, renderer);
    expect(directive).toBeTruthy();
  });
});
