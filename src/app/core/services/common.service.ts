import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/core/class';
import { Common, RouteConstants, SessionConstants } from '@app/core/constants';
import { MenuItem } from '@app/core/interface/common';
import { SessionStorageService } from '@app/core/services';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuPermission } from '@app/core/class';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  permission: MenuPermission = null;

  private isLoggedIn: BehaviorSubject<boolean>;
  public isLoggedIn$: Observable<boolean>;

  private accessToken: BehaviorSubject<string>;
  public accessToken$: Observable<string>;

  private refreshToken: BehaviorSubject<string>;
  public refreshToken$: Observable<string>;

  private loggedInUser: BehaviorSubject<User>;
  public loggedInUser$: Observable<User>;

  private userMenus: BehaviorSubject<MenuItem[]>;
  public userMenus$: Observable<MenuItem[]>;

  private serializedUserMenus: BehaviorSubject<MenuItem[]>;
  public serializedUserMenus$: Observable<MenuItem[]>;
  // Cached so we don't recompute on every call
  private _dateFormat: string | null = null;

  constructor(
    private sessionService: SessionStorageService,
    private router: Router,
  ) {
    const sessionIsLoggedIn =
      this.sessionService.get(SessionConstants.IS_LOGGED_IN) || false;

    const sessionAccessToken =
      this.sessionService.get(SessionConstants.ACCESS_TOKEN) ?? '';

    const sessionRefreshToken =
      this.sessionService.get(SessionConstants.REFRESH_TOKEN) ?? '';

    const sessionLoggedInUser =
      this.sessionService.get(SessionConstants.USER_PROFILE) || null;

    const sessionUserMenus =
      this.sessionService.get(SessionConstants.USER_MENU) || [];

    const sessionSerializedMenus = this.sessionService.get(
      SessionConstants.SERIALIZED_MENU,
    ) as MenuItem[];

    this.isLoggedIn = new BehaviorSubject<boolean>(sessionIsLoggedIn);
    this.isLoggedIn$ = this.isLoggedIn.asObservable();

    this.accessToken = new BehaviorSubject<string>(sessionAccessToken);
    this.accessToken$ = this.accessToken.asObservable();

    this.refreshToken = new BehaviorSubject<string>(sessionRefreshToken);
    this.refreshToken$ = this.refreshToken.asObservable();

    this.loggedInUser = new BehaviorSubject<User>(sessionLoggedInUser);
    this.loggedInUser$ = this.loggedInUser.asObservable();

    this.userMenus = new BehaviorSubject<MenuItem[]>(sessionUserMenus);
    this.userMenus$ = this.userMenus.asObservable();

    this.serializedUserMenus = new BehaviorSubject<MenuItem[]>(
      sessionSerializedMenus,
    );
    this.serializedUserMenus$ = this.serializedUserMenus.asObservable();
  }

  UpdateIsLoggedIn(isLoggedIn: boolean) {
    this.sessionService.set(SessionConstants.IS_LOGGED_IN, isLoggedIn);
    this.isLoggedIn.next(isLoggedIn);
  }

  UpdateAccessToken(accessToken: string): void {
    this.sessionService.set(SessionConstants.ACCESS_TOKEN, accessToken);
    this.accessToken.next(accessToken);
  }

  UpdateRefreshToken(refreshToken: string): void {
    this.sessionService.set(SessionConstants.REFRESH_TOKEN, refreshToken);
    this.refreshToken.next(refreshToken);
  }

  UpdateLoggedInUser(user: User) {
    this.sessionService.set(SessionConstants.USER_PROFILE, user);
    this.loggedInUser.next(user);
  }

  UpdateUserMenus(userMenus: MenuItem[]) {
    this.sessionService.set(SessionConstants.USER_MENU, userMenus);
    this.userMenus.next(userMenus);
  }

  UpdateSerializedUserMenus(userMenus: MenuItem[]) {
    let serializedMenu = null;

    if (userMenus) {
      serializedMenu = this.createSerializedUserMenus(userMenus);
    }

    this.sessionService.set(SessionConstants.SERIALIZED_MENU, serializedMenu);
    this.serializedUserMenus.next(serializedMenu);
  }

  GetIsUserLoggedIn(): Observable<boolean> {
    return this.isLoggedIn$;
  }

  GetAccessToken(): Observable<string> {
    return this.accessToken$;
  }

  GetRefreshToken(): Observable<string> {
    return this.refreshToken$;
  }

  GetLoggedInUser(): Observable<User> {
    return this.loggedInUser$;
  }

  GetUserMenus(): Observable<MenuItem[]> {
    return this.userMenus$;
  }

  GetSerializedUserMenus(): Observable<MenuItem[]> {
    return this.serializedUserMenus$;
  }

  public IsExpired(sourceTime: any, currentTime) {
    return sourceTime < currentTime;
  }

  public RevokeSession() {
    this.UpdateAccessToken('');
    this.UpdateRefreshToken('');
    this.UpdateIsLoggedIn(false);
    this.UpdateLoggedInUser(null);
    this.UpdateUserMenus([]);
    this.sessionService.remove(SessionConstants.LOGGED_IN_USER);
    this.sessionService.remove(SessionConstants.IS_LOGGED_IN);
    this.sessionService.remove(SessionConstants.USER_MENU);
    this.sessionService.remove(SessionConstants.SERIALIZED_MENU);
    this.sessionService.remove(SessionConstants.ACCESS_TOKEN);
    this.sessionService.remove(SessionConstants.REFRESH_TOKEN);
    this.sessionService.clear();
    this.router.navigate([RouteConstants.LOGIN_USER_URL]);
  }

  /** Current session values, read synchronously (the guard needs them on every navigation). */
  sessionSnapshot(): { isLoggedIn: boolean; loggedInUser: User; accessToken: string; refreshToken: string } {
    return {
      isLoggedIn: this.isLoggedIn.value,
      loggedInUser: this.loggedInUser.value,
      accessToken: this.accessToken.value,
      refreshToken: this.refreshToken.value,
    };
  }

  /**
   * True when the URL is one of the user's menu screens with view rights. Synchronous on purpose:
   * the old version returned a Promise, so the guard's `if (!isRouteValid(url))` tested a Promise
   * object (always truthy) and the check never denied anything. It also subscribed on every call
   * and never unsubscribed.
   */
  isRouteValid(url: string): boolean {
    const menu = this.findMenuForUrl(url);
    return !!menu && menu.IsView !== false;
  }

  /** Flattens the menu tree into a new array (the old version appended to a field that was never cleared). */
  createSerializedUserMenus(userMenus: MenuItem[], into: MenuItem[] = []): MenuItem[] {
    for (const item of userMenus ?? []) {
      into.push(item);
      if (item.Children?.length) {
        this.createSerializedUserMenus(item.Children, into);
      }
    }
    return into;
  }

  /**
   * The CRUD rights of the screen at this URL (all false when it is not one of the user's screens).
   * Reads the current value: no subscription is left behind by the ~45 screens that call this on load.
   */
  public getMenuPermission(url: any): MenuPermission {
    const menuPermission = new MenuPermission();
    const matchedMenu = this.findMenuForUrl(url);
    if (matchedMenu) {
      menuPermission.IsView = matchedMenu.IsView;
      menuPermission.IsCreate = matchedMenu.IsCreate;
      menuPermission.IsUpdate = matchedMenu.IsUpdate;
      menuPermission.IsDelete = matchedMenu.IsDelete;
    }
    return menuPermission;
  }

  /**
   * The menu screen for a router URL: query string / fragment / matrix params are ignored, and the
   * RouteLink must equal the path or be a parent segment of it (longest match wins). The old
   * `RouteLink.includes(url)` failed for '?profile=...' and matched '/business' to every screen.
   */
  private findMenuForUrl(url: string): MenuItem | undefined {
    const path = (url ?? '').split(/[?#;]/)[0].replace(/\/+$/, '');
    if (!path) {
      return undefined;
    }
    let best: MenuItem | undefined;
    for (const menu of this.serializedUserMenus.value ?? []) {
      const link = menu.RouteLink?.trim().replace(/\/+$/, '');
      if (link && (path === link || path.startsWith(link + '/')) && link.length > (best?.RouteLink?.trim().length ?? 0)) {
        best = menu;
      }
    }
    return best;
  }

  public pageSize() {
    return Common.PAGE_SIZE_ARRAY;
  }

  isValidGuid(value: string | null | undefined): boolean {
    // Check if the value is null, undefined, or an empty string
    if (!value || value.trim() === '') {
      return false;
    }

    // Regular expression to match the GUID format
    const guidPattern =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    // Test if the value matches the GUID pattern
    return guidPattern.test(value);
  }

  isInvalidObject(obj: any): boolean {
    if (obj === null || obj === undefined || typeof obj === 'undefined') {
      return true;
    }

    if (Array.isArray(obj)) {
      return obj.length === 0;
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).length === 0;
    }

    return false;
  }

  // isValid(value: any): boolean {
  //   return (
  //     value !== null ||
  //     value !== 'undefined' ||
  //     value !== undefined ||
  //     typeof value !== 'undefined'
  //   );
  // }
  isValid(value: any): boolean {
    return value !== null && value !== undefined && value !== 'undefined';
  }

  generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  parseMenu(userMenus: any): MenuItem[] {
    try {
      let parsed = userMenus;

      // Handle possible double-encoded JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        console.warn('Menu data is not an array:', parsed);
        return [];
      }
    } catch (error) {
      console.error('Failed to parse menu:', error);
      return [];
    }
  }

  /** 1. Browser-locale date format, e.g. 'dd/MM/yyyy' or 'MM/dd/yyyy'. */
  public getDateFormat(): string {
    if (!this._dateFormat) {
      const locale = navigator.language || 'en-US';
      try {
        const parts = new Intl.DateTimeFormat(locale).formatToParts(
          new Date(2000, 0, 2),
        );
        const order = parts
          .filter(
            (p) => p.type === 'day' || p.type === 'month' || p.type === 'year',
          )
          .map((p) => p.type);
        this._dateFormat =
          order.length === 3
            ? order
                .map((t) =>
                  t === 'day' ? 'dd' : t === 'month' ? 'MM' : 'yyyy',
                )
                .join('/')
            : 'dd/MM/yyyy';
      } catch {
        this._dateFormat = 'dd/MM/yyyy';
      }
    }
    return this._dateFormat;
  }

  /** 2. ISO datetime -> 'yyyy-MM-dd' for <input type="date"> (edit load). */
  public toDateInput(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.substring(0, 10);
  }

  /** 3. Prepare a date-input value for saving ('' -> null). */
  public toSaveDate(value: string | null | undefined): string | null {
    if (!value || value.trim() === '') return null;
    return value;
  }
}
