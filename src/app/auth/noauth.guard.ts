import { RecoveryService } from './../share/service/recovery.service';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { defer, from, Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { AppConfig } from '../app.config';
import { InitGuard } from '../init/init.guard';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard {
  static bypassFlag: boolean;

  constructor(private authService: AuthService, private router: Router, private recover: RecoveryService) {
   }

  canActivate() {
    return this.checkAuth();
  }

  checkAuth() {
    if (NoAuthGuard.bypassFlag) {
      NoAuthGuard.bypassFlag = false;
      return true;
    }
    if (!AppConfig.isInit || !InitGuard.isServerOnline) {
      return true;
    }

    return this.authService.isAuthenticated().pipe(
      mergeMap((isAuth) => {
        if (!isAuth) {
          return new Observable<boolean|UrlTree>((sub) => {
            this.authService.refreshToken().subscribe({
              next: (result) => {
                if (result) {
                  if (this.authService.ExpiredMode) {
                    console.log('intercept welcome page');
                    sub.next(this.router.createUrlTree(['welcome']));
                  }
                  else {
                    from(this.recover.get()).pipe(map((recover) => {
                      if (recover) {
                        return this.recover.getTargetUrl(recover);
                      }
        
                      return this.router.createUrlTree(['']);
                    }))
                      .pipe(tap(() => this.recover.clear()))
                      .subscribe(data => sub.next(data));
                  }
                }
                else {
                  sub.next(true);
                }
              },
              error: (err) => {
                sub.next(true);
              }
            });
          });
        }

        return defer(async () => {
          await this.authService.keepSession();

          if (this.authService.ExpiredMode) {
            return this.router.createUrlTree(['welcome']);
          }
          const recover = await this.recover.get();
          if (recover) {
            return this.recover.getTargetUrl(recover);
          }
          return this.router.createUrlTree(['']);
        }).pipe(tap(() => this.recover.clear()));
      })
    );
  }
}

export const NoAuthCheck =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const noauthCheck = inject(NoAuthGuard);
    return noauthCheck.canActivate();
  };
