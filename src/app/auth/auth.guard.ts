import { RecoveryService } from './../share/service/recovery.service';
import { WelcomePage } from './welcome/welcome.page';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { InitGuard } from '../init/init.guard';
import { AuthService } from './auth.service';
import { NoAuthGuard } from './noauth.guard';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private authService: AuthService, private router: Router, private recover: RecoveryService) { }


  canActivate() {
    return this.authenticate();
  }

  authenticate() {
    if (!AppConfig.isInit || !InitGuard.isServerOnline) {
      NoAuthGuard.bypassFlag = true;
      return of(this.router.createUrlTree(['/login']));
    }

    return this.authService.isAuthenticated().pipe(
      mergeMap((isAuth) => {
        if (isAuth) {
          console.log('expire mode:', this.authService.ExpiredMode);
          if (this.authService.ExpiredMode && !WelcomePage.bypassFlag) {
            console.log('intercept welcome page');
            return of(this.router.createUrlTree(['/welcome']));
          }
          else {
            return from(this.recover.get()).pipe(mergeMap((recover) => {
              if (recover) {
                return of(this.recover.getTargetUrl(recover));
              }

              return of(true);
            })).pipe(tap(() => {
              this.authService.keepSession();
              this.recover.clear();
            }));
          }
        }
        else {
          if (NoAuthGuard.bypassFlag) {
            console.log('no auth bypass');
            return of(this.router.createUrlTree(['/login']));
          }
          console.log('refresh token..');
          return new Observable<boolean|UrlTree>((sub) => {
            this.authService.refreshToken().subscribe({
              next: (result) => {
                if (!result) {
                  NoAuthGuard.bypassFlag = true;
                  sub.next(this.router.createUrlTree(['/login']));
                }
                else {
                  console.log('expire mode:', this.authService.ExpiredMode);
                  if (this.authService.ExpiredMode && !WelcomePage.bypassFlag) {
                    console.log('intercept welcome page');
                    sub.next(this.router.createUrlTree(['/welcome']));
                  }
                  else {
                    from(this.recover.get()).pipe(mergeMap((recover) => {
                      if (recover) {
                        return of(this.recover.getTargetUrl(recover));
                      }
        
                      return of(true);
                    })).pipe(tap(() => {
                      this.authService.keepSession();
                      this.recover.clear();
                    }))
                      .subscribe(data => sub.next(data));
                  }
                }
              },
              error: (err) => {
                sub.next(this.router.createUrlTree(['/login']));
              }
            });
          });
        }
      })
    );
  }
}

export const AuthCheck: CanActivateFn =
(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authGuard = inject(AuthGuard);
  return authGuard.canActivate();
};