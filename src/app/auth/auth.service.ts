import { StorageService } from './../share/service/storage.service';
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, delayWhen, filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, firstValueFrom, from } from 'rxjs';

import { UserInfo } from './user-info';
import { AuthResponse } from './auth-response';
import { ServiceURL } from '../service-url';
import { Login } from './login';
import { User } from './user';
import { UserService } from './user.service';
import { getBackendUrl, internalError } from '../utils';
import { AppConfig } from '../app.config';
import { AlertController } from '@ionic/angular';
import { guid } from '../share/guid';
import { Lang } from '../share/lang';
import { Feature } from '../enums/feature';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private registerE = new EventEmitter<any>();
  get onNewRegister() { return this.registerE.asObservable(); }

  constructor(
    private httpClient: HttpClient,
    private storage: StorageService,
    private userService: UserService,
    private alertCtl: AlertController) {

    this.init();
  }

  private async init() {
    await Promise.all([
      this.storage.get('ACCESS_TOKEN').then(token => {
        const tokenValid = AuthService.tokenValid(token);
        this.authSubject.next(tokenValid);
        this.tokenSubject.next(token);
        console.log('init auth access');
      }),
      this.storage.get('EXPIRE_MODE').then(expire => this.expireMode = expire),
      this.storage.get('FEATURE').then(data => AuthService.feature = data),
      this.storage.get('currentUser').then(data => {
        const user = Object.assign(new User(), data);
        this.currentUserSubject.next(user);
      })
    ]);
    console.log('finish auth service init.');
  }

  get API_URL() { return getBackendUrl(); }

  get currentUser(): User {
    return this.currentUserSubject.value;
  }

  get currentUserUpdate() {
    return this.currentUserSubject.asObservable();
  }
  get tokenUpdate(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  get onLoggedInOrRefresh() {
    return this.authSubject.asObservable().pipe(filter(x => !!x));
  }

  get ExpiredMode(): boolean {
    return this.expireMode;
  }

  get Feature() : Feature {
    return AuthService.feature;
  }

  private static refreshTokenTimeout;
  private static loggedOut = false;
  private static feature: Feature;

  private expireMode = false;

  private authSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User>(null);
  private tokenSubject = new BehaviorSubject<string>(null);
  private permissions: string[] = [];

  private static tokenExpired(token: string) {
    const expiry = AuthService.readToken(token).exp;
    return (Math.floor((new Date()).getTime() / 1000)) >= expiry;
  }

  private static readToken(token: string){
    if (!token) {
      throw new Error('the token is null!');
    }
    const jwtData = token.split('.')[1];
    const base64 = jwtData.replace(/-/g, '+').replace(/_/g, '/');

    const rawJSON = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decodedJwtData = JSON.parse(rawJSON);
    return decodedJwtData;
  }

  private static tokenValid(token: string): boolean {
    const valid = !!token && !AuthService.tokenExpired(token);
    if (!valid) {
      console.log('Token is invalid');
    }
    return valid;
  }

  register(user: UserInfo): Observable<string> {
    return this.httpClient.post<string>(this.API_URL + ServiceURL.register, user)
      .pipe(tap(() => this.registerE.emit()));
  }

  login(login: Login): Observable<string> {
    const call$ = this.httpClient.post<AuthResponse>(this.API_URL + ServiceURL.login, login, { withCredentials: true, params: { culture: Lang.currentLang } });
    return this.loginPipe(call$);
  }

  loginWithToken(token: string): Observable<string> {
    const call$ = this.httpClient.post<AuthResponse>(this.API_URL + ServiceURL.smart_login, `"${token}"`, { headers: {
      "content-type": 'application/json; charset=UTF-8'
    }, withCredentials: true, params: { culture: Lang.currentLang } });
    return this.loginPipe(call$);
  }

  private loginPipe(observable$: Observable<AuthResponse>): Observable<string> {
    return observable$.pipe(
      delayWhen((res) => of(res).pipe(
        mergeMap(async () => {
          if (res?.access_token) {
            this.expireMode = res.expired_mode;
            AuthService.feature = res.feature;
            await this.loginSession(res);
            const data = AuthService.readToken(res.access_token);
            const userId = data.sub;
            if (data.Permission && typeof data.Permission === 'string') {
              this.permissions = [data.Permission];
            }
            else {
              this.permissions = data.Permission ?? [];
            }
            
            return guid(userId);
          }
          return null;
        }),
        mergeMap((userId) => this.userService.getUser(userId)),
        mergeMap(async (user) => {
          console.log(user);
          user.permissions = this.permissions;
          await this.setCurrentUser(user);
        })
      )),
      map((res) => res.access_token)
    );
  }

  refreshToken() {
    return AppConfig.afterInit(() =>
      this.httpClient.post<AuthResponse>(this.API_URL + ServiceURL.token_refresh, {}, { withCredentials: true, params: { culture: Lang.currentLang } }))
      .pipe(
        mergeMap(async (res) =>
        {
          this.expireMode = res.expired_mode;
          AuthService.feature = res.feature;
          await this.loginSession(res);
          await this.keepSession();
          return res.access_token;
        }),
        catchError((err) => {
          if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 404)) {
            return of(false);
          }
          else {
            throw err;
          }
        })
      );
  }

  logout() {
    AuthService.loggedOut = true;
    return this.httpClient.post<any>(this.API_URL + ServiceURL.token_revoke, {}, { withCredentials: true })
    .pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          console.log('the token is already revoked or not found.');
          return of(false);
        }
        throw error;
      }),
      mergeMap(async () => this.logoutSession())
    );
  }

  getToken(): Observable<string> {
    return from(this.storage.get('ACCESS_TOKEN'));
  }

  async setCurrentUser(user: User) {
    await this.storage.set('currentUser', user);
    this.currentUserSubject.next(user);
  }

  async removeCurrentUser() {
    await this.storage.remove('currentUser');
    if (!AuthService.loggedOut) {
      this.currentUserSubject.next(null);
    }
  }

  async initCurrentUser() {
    console.log('init user...');
    if (!this.currentUser || !this.currentUser.userName) {
      const data = await this.storage.get('currentUser');
      console.log('raw data', data);
      if (data && (data as UserInfo).userName) {
        const user = Object.assign(new User(), data) as User;
        this.currentUserSubject.next(user);
      }
      else {
        console.log('Something went wrong, we don\'t have current user data, force re-login');
        await firstValueFrom(this.logout());
        internalError(this.alertCtl, 'Cannot get user data, please re-login again. (if problem still exists, please contact admin)');
      }
    }
    console.log('currentUser username:', this.currentUser.userName);
  }

  isAuthenticated(): Observable<boolean> {
    if (this.authSubject) {
      return this.authSubject.pipe(take(1));
    }
    console.log('newly init session, read token from storage...')
    return from(new Promise<boolean>(async (resolve) => {
      const token = await this.storage.get('ACCESS_TOKEN');
      resolve(AuthService.tokenValid(token));
    }));
  }

  async keepSession() {
    console.log('keepSession');
    await this.startRefreshTokenTimer();
    await this.initCurrentUser();
  }

  stopSession() {
    this.stopRefreshTokenTimer();
  }

  private async loginSession(data: AuthResponse) {
    await this.saveAuthInfo(data);
    this.authSubject.next(true);
  }

  private async logoutSession() {
    this.authSubject.next(false);
    this.stopRefreshTokenTimer();
    await this.removeAuthInfo();
    await this.removeCurrentUser();
    window.location.reload();
  }

  private async saveAuthInfo(auth: AuthResponse) {
    this.tokenSubject.next(auth.access_token);
    await this.storage.set('ACCESS_TOKEN', auth.access_token);
    await this.storage.set('EXPIRES_IN', auth.expires_in);
    await this.storage.set('EXPIRE_MODE', auth.expired_mode);
    await this.storage.set('FEATURE', auth.feature);
  }

  private async removeAuthInfo() {
    await this.storage.remove('ACCESS_TOKEN');
    await this.storage.remove('EXPIRES_IN');
    await this.storage.remove('FEATURE');
  }

  private async startRefreshTokenTimer() {
    this.stopRefreshTokenTimer();

    const expiresIn = await this.storage.get('EXPIRES_IN');
    // set a timeout to refresh the token at 500 ms before it expires
    const timeout = expiresIn * 1000 - 500;
    AuthService.refreshTokenTimeout = setTimeout(() => {
      console.log('refresh token..');
      this.refreshToken().subscribe(
        async (token) => {
          if (!token) {
            const alert = await this.alertCtl.create({
              backdropDismiss: false,
              header: 'Session Timed Out',
              message: 'Your session has expired. Please re-login again.',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => this.logoutSession()
                }
              ]
            });
            alert.present();
          }
        }
      );
    }, timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(AuthService.refreshTokenTimeout);
  }

}

