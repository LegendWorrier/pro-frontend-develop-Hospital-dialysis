import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceURL } from '../service-url';
import { getBackendUrl } from '../utils';

export const SMART_LOGIN_PREFIX = "hemopro-smartlogin";

@Injectable({
  providedIn: 'root'
})
export class SmartLoginService {

  get API_URL() { return getBackendUrl(); }

  constructor(private httpClient: HttpClient) { }

    generateOneTimeToken() {
      return this.httpClient.put<{token: string}>(this.API_URL + ServiceURL.smart_login_one_time_token, {});
    }

    generateToken(password: string) {
      const body = {
        password
      };
      
      return this.httpClient.post<{token: string}>(this.API_URL + ServiceURL.smart_login_generate, body);
    }

    revoke() {
      return this.httpClient.delete(this.API_URL + ServiceURL.smart_login_revoke);
    }
}
