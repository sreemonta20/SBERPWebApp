import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  constructor() {}

  // public set(key: string, value: string) {
  //   sessionStorage.setItem(key, value);
  // }
  public set(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  // get(key: string): string {
  //   return sessionStorage.getItem(key) as string;
  // }
  get(key: string): any {
    return JSON.parse(sessionStorage.getItem(key));
  }
  remove(key: string) {
    // this.sessionStorgaeModel[key]=null;
    sessionStorage.removeItem(key);
  }
  clear() {
    // this.sessionStorgaeModel=new SessionStorageModel();
    sessionStorage.clear();
  }
}
