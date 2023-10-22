import { Subject, firstValueFrom } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  private isInit = false;
  private onInit = new Subject<void>();

  constructor(private storage: Storage) { 
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();
    this._storage = storage;
    this.isInit = true;
    this.onInit.next();
    this.onInit.complete();
    console.log('init storage completed');
  }
  
  public set(key: string, value: any) {
    if (!this.isInit) {
      return firstValueFrom(this.onInit.asObservable()).then(() => this._storage.set(key, value));
    }
    return this._storage.set(key, value);
  }

  public get(key: string) {
    if (!this.isInit) {
      return firstValueFrom(this.onInit.asObservable()).then(() => this._storage.get(key));
    }
    return this._storage.get(key);
  }

  public remove(key: string) {
    if (!this.isInit) {
      return firstValueFrom(this.onInit.asObservable()).then(() => this._storage.remove(key));
    }
    return this._storage.remove(key);
  }

  public length() {
    if (!this.isInit) {
      return firstValueFrom(this.onInit.asObservable()).then(() => this._storage.length());
    }
    return this._storage.length();
  }

}
