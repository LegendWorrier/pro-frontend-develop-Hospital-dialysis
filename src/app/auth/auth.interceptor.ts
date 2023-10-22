import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ServiceURL } from '../service-url';
import { delayedRetry, handleUnauthorizedError } from '../utils';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
      private authService: AuthService,
      private pt: Platform,
      private alertCtl: AlertController
      ){
    }

    refreshTokenResponse$: Subject<string | boolean>;

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      // Bypass all local access and health check (no need to retry nor authen), plus special case
      const host = request.url.replace(/https?:\/\//, '').split('/')[0];
      if (host === window.location.host.replace(/https?:\/\//, '')
      || request.url.endsWith('health')
      || request.url.endsWith('ssltest.js')
      || request.url.endsWith('config.json')) {
        return next.handle(request);
      }

      request = request.clone({
        setHeaders: {
          Platform: this.pt.platforms()
        }
      });
      return this.authService.isAuthenticated().pipe(
        mergeMap((isAuth) => {
          if (isAuth) {
            return this.authService.getToken().pipe(
              mergeMap((token) => {
                request = request.clone({
                  setHeaders: {
                      Authorization: `Bearer ${token}`
                  }
                });
                return next.handle(request);
              }),
              catchError((err) => {
                // smart handler (auto-refresh token on the fly)
                if (!request.url.endsWith(ServiceURL.token_refresh) && err instanceof HttpErrorResponse && (err.status === 401 || err.status === 409)) {
                  try {
                    console.log('auth interceptor', err);
                    if (err.status === 409) {
                      let code: string;
                      if (err.error instanceof Blob) {
                        const reader = new FileReader();
                        reader.readAsText(err.error);
                        const body = JSON.parse(reader.result as string);
                        code = body.code;
                      }
                      else {
                        code = err.error.code;
                      }
                      if (code) {
                        if (code === 'PERMISSION_CHANGE') {
                          return handleUnauthorizedError(this.alertCtl, code);
                        }
                      }
                      return throwError(() => err);
                    }
                  } catch (e) {
                    console.error('parse 409 error failed', e);
                  }

                  console.log('auto refresh token..');
                  // ------------- get new token via refresh token call
                  if (!this.refreshTokenResponse$) {
                    this.refreshTokenResponse$ = new Subject();
                    this.authService.refreshToken()
                    .subscribe(x => {
                      this.refreshTokenResponse$.next(x);
                      this.refreshTokenResponse$.complete();

                      this.refreshTokenResponse$ = null;
                    });
                  }
                  
                  // --------------
                  return this.refreshTokenResponse$.pipe(
                    mergeMap((token) => {
                      if (token) {
                        request = request.clone({
                          setHeaders: {
                              Authorization: `Bearer ${token}`
                          }
                        });
                        return next.handle(request);
                      }
                      return handleUnauthorizedError(this.alertCtl);
                    }),
                  );
                }
                else {
                  return throwError(() => err);
                }
              }),
              delayedRetry(2000)
            );
          }
          return next.handle(request).pipe(delayedRetry(2000));
        }));
    }
}
