import { Router, RouterLink } from '@angular/router';
import { RouterLinkEventDirective } from './router-link-event.directive';

describe('RouterLinkActiveEventDirective', () => {
  let router: Router
  let routerLink: RouterLink

  beforeEach(() => {
    
    router = jasmine.createSpyObj('Router', ['']);
    routerLink = jasmine.createSpyObj('RouterLink', ['']);
  });
  
  it('should create an instance', () => {
    const directive = new RouterLinkEventDirective(router, routerLink);
    expect(directive).toBeTruthy();
  });
});
