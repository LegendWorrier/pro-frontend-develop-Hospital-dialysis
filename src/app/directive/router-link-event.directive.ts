import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Directive({
  selector: '[appRouterLinkEvent]'
})
export class RouterLinkEventDirective {
  
  @Output('appRouterLinkEvent') onRouterLink: EventEmitter<any> = new EventEmitter();
  isActive: boolean;

  private handler: Subscription;

  constructor(private router: Router, private rl: RouterLink) {
  }

  ngOnInit(): void {

    this.handler = this.router.events.pipe(
      filter(x => {
        return x instanceof NavigationEnd
      }),
      map(() => {
        return this.rl && this.router.isActive(this.rl.urlTree, {
          fragment: 'ignored',
          paths: 'subset',
          queryParams: 'ignored',
          matrixParams: 'subset'
        });
      }),
      tap(isActive => {
        this.isActive = isActive;
        this.onRouterLink.emit(this.isActive);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.handler.unsubscribe();
  }

}
