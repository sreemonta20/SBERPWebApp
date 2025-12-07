import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, ProfileMenuResponse } from '@app/core/class';
import { Common, RouteConstants, SessionConstants } from '@app/core/constants';
import { MenuItem } from '@app/core/interface';
import { SessionStorageService } from '@app/core/services';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuPermission } from '../class/models/menu.permission';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private flattenedMenuItems: MenuItem[] = [];
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

  constructor(
    private sessionService: SessionStorageService,
    private router: Router
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
      SessionConstants.SERIALIZED_MENU
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
      sessionSerializedMenus
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

  async isRouteValid(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.serializedUserMenus$.subscribe((serializedMenus) => {
        if (!this.isInvalidObject(serializedMenus)) {
          const matchedMenu = serializedMenus.find((element: MenuItem) =>
            element.RouteLink.includes(url)
          );
          resolve(!!matchedMenu);
        } else {
          resolve(false);
        }
      });
    });
  }

  createSerializedUserMenus(userMenus: MenuItem[]) {
    userMenus.forEach((item) => {
      // Push the current menu item
      this.flattenedMenuItems.push(item);

      // If the current menu item has children, recursively call the function
      if (item.Children && item.Children.length > 0) {
        this.createSerializedUserMenus(item.Children);
      }
    });
    return this.flattenedMenuItems;
  }

  public getMenuPermission(url: any): MenuPermission {
    let menuPermission = new MenuPermission();
    this.serializedUserMenus$.subscribe((serializedMenus) => {
      if (!this.isInvalidObject(serializedMenus)) {
        const matchedMenu = serializedMenus.find((element: MenuItem) =>
          element.RouteLink.includes(url)
        );

        if (matchedMenu) {
          menuPermission.IsView = matchedMenu.IsView;
          menuPermission.IsCreate = matchedMenu.IsCreate;
          menuPermission.IsUpdate = matchedMenu.IsUpdate;
          menuPermission.IsDelete = matchedMenu.IsDelete;
        }
      } else {
        return null;
      }
    });
    return menuPermission;
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
      }
    );
  }

  parseMenu(userMenus: any): MenuItem[] {
    try {
      let parsed = userMenus;

      // Handle possible double-encoded JSON
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (Array.isArray(parsed)) {
        console.log('Parsed menu with', parsed.length, 'items');
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
}
