import { AuthService } from 'src/app/auth/auth.service';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DraftService {

  constructor(private storage: StorageService, private auth: AuthService) { }

  async saveDraft(id: string, data: any) {
    const userId = this.auth.currentUser.id;
    await this.storage.set(`draft:${userId}:${id}`, data);
  }

  getDraft(id: string) {
    const userId = this.auth.currentUser.id;
    return this.storage.get(`draft:${userId}:${id}`);
  }

  async removeDraft(id: string) {
    const userId = this.auth.currentUser.id;
    await this.storage.remove(`draft:${userId}:${id}`)
  }
}
