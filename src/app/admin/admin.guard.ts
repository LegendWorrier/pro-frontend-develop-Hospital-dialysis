import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanLoad {

  constructor(private auth: AuthService) {}

  canLoad(route: Route, segments: UrlSegment[]) {
    return this.auth.currentUser.isAdmin;
  }
  
}
