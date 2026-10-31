import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

/**
 * JSON wrapper around window.sessionStorage. When the app is rendered on the server (prerendering
 * the login page for hydration) there is no sessionStorage: reads return null and writes are
 * ignored, so the server simply renders the "not signed in" state.
 */
@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  private readonly storage: Storage | null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.storage = isPlatformBrowser(platformId) ? window.sessionStorage : null;
  }

  public set(key: string, value: any) {
    this.storage?.setItem(key, JSON.stringify(value));
  }

  get(key: string): any {
    const raw = this.storage?.getItem(key);
    if (raw == null) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null; // a hand-edited / corrupt entry must not break the app start
    }
  }

  remove(key: string) {
    this.storage?.removeItem(key);
  }

  clear() {
    this.storage?.clear();
  }
}
