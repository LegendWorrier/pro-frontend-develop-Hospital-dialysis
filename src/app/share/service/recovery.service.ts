import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecoveryService {
  // Recover the last action before app refresh

  constructor(
    private storage: StorageService,
    private auth: AuthService,
    private router: Router) { }

  async save(page: string, action: string, arg: any[]) {
    const userId = this.auth.currentUser.id;
    const data = {
      page,
      action,
      arg
    }
    await this.storage.set(`recover:${userId}`, data);
  }

  get(): Promise<{ page: string, action: string, arg: any[] }> {
    const userId = this.auth.currentUser.id;
    return this.storage.get(`recover:${userId}`);
  }

  async clear() {
    const userId = this.auth.currentUser.id;
    await this.storage.remove(`recover:${userId}`);
  }


  getTargetUrl(data: { page: string, action: string, arg: any[] }) {
    switch (data.page) {
      case 'patient':
        switch (data.action) {
          case 'hemo-pres':
            if (data.arg[1]) {
              return this.router.createUrlTree(['patients', data.arg[0], 'prescriptions', data.arg[1].id]);
            }
            else {
              return this.router.createUrlTree(['patients', data.arg[0], 'prescriptions', 'add']);
            }
        
          default:
            console.log('unknown recovery :', data);
            return this.router.createUrlTree(['home']);
        }
    
      default:
        console.log('unknown recovery :', data);
        return this.router.createUrlTree(['home']);
    }
  }
}
