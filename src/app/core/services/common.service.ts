import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserResponse } from '@app/core/class';
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

  // private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public isLoggedIn$: Observable<boolean> = this.isLoggedIn.asObservable();
  private isLoggedIn: BehaviorSubject<boolean>;
  public isLoggedIn$: Observable<boolean>;

  // private loggedInUser = new BehaviorSubject<UserResponse>(new UserResponse());
  // public loggedInUser$: Observable<UserResponse> = this.loggedInUser.asObservable();
  private loggedInUser: BehaviorSubject<UserResponse>;
  public loggedInUser$: Observable<UserResponse>;

  // private userMenus: BehaviorSubject<MenuItem[]> = new BehaviorSubject<MenuItem[]>([]);
  // public userMenus$: Observable<MenuItem[]> = this.userMenus.asObservable();
  private userMenus: BehaviorSubject<MenuItem[]>;
  public userMenus$: Observable<MenuItem[]>;

  private serializedUserMenus: BehaviorSubject<MenuItem[]>;
  public serializedUserMenus$: Observable<MenuItem[]>;

  constructor(
    private sessionService: SessionStorageService,
    private router: Router
  ) {
    const sessionIsLoggedIn = this.sessionService.get(
      SessionConstants.IS_LOGGED_IN
    );
    const sessionLoggedInUser = this.sessionService.get(
      SessionConstants.LOGGED_IN_USER
    );
    const sessionUserMenus = this.sessionService.get(
      SessionConstants.USER_MENU
    );
    const sessionSerializedMenus = this.sessionService.get(
      SessionConstants.SERIALIZED_MENU
    ) as MenuItem[];

    this.isLoggedIn = new BehaviorSubject<boolean>(sessionIsLoggedIn);
    this.isLoggedIn$ = this.isLoggedIn.asObservable();

    this.loggedInUser = new BehaviorSubject<UserResponse>(sessionLoggedInUser);
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

  UpdateLoggedInUser(userResponse: UserResponse) {
    
    this.sessionService.set(SessionConstants.LOGGED_IN_USER, userResponse);
    this.loggedInUser.next(userResponse);
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

  GetIsUserLoggedIn(): boolean {
    return this.isLoggedIn.value;
  }

  GetLoggedInUser(): UserResponse {
    return this.loggedInUser.value;
  }

  GetUserMenus(): MenuItem[] {
    return this.userMenus.value;
  }

  GetSerializedUserMenus(): MenuItem[] {
    const serializedMenus = this.serializedUserMenus.value;
    console.log('Retrieved Serialized User Menus:', serializedMenus);
    return serializedMenus;
  }

  public IsExpired(sourceTime: any, currentTime) {
    return sourceTime < currentTime;
  }

  public RevokeSession() {
    
    this.UpdateIsLoggedIn(false);
    this.UpdateLoggedInUser(null);
    this.UpdateUserMenus(null);
    this.UpdateSerializedUserMenus(null);
    this.sessionService.remove(SessionConstants.LOGGED_IN_USER);
    this.sessionService.remove(SessionConstants.IS_LOGGED_IN);
    this.sessionService.remove(SessionConstants.USER_MENU);
    this.sessionService.remove(SessionConstants.SERIALIZED_MENU);
    this.sessionService.clear();
    this.router.navigate([RouteConstants.LOGIN_USER_URL]);
  }

  isRouteValid(url: any): boolean {
    
    let isRouteValid = false;
    this.serializedUserMenus$.subscribe((serializedMenus) => {
      if(!this.isInvalidObject(serializedMenus)){
        const matchedMenu = serializedMenus.find((element: MenuItem) =>
          element.RouteLink.includes(url)
        );
        if (matchedMenu) {
          isRouteValid = true;
          return isRouteValid;
        }
      }
      return isRouteValid;
    });
    return isRouteValid;
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
      if(!this.isInvalidObject(serializedMenus)){
        const matchedMenu = serializedMenus.find((element: MenuItem) =>
          element.RouteLink.includes(url)
        );
  
        if (matchedMenu) {
          menuPermission.IsView = matchedMenu.IsView;
          menuPermission.IsCreate = matchedMenu.IsCreate;
          menuPermission.IsUpdate = matchedMenu.IsUpdate;
          menuPermission.IsDelete = matchedMenu.IsDelete;
        }
      }else{
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

  isValid(value: any): boolean {
    return (
      value !== null ||
      value !== 'undefined' ||
      value !== undefined ||
      typeof value !== 'undefined'
    );
  }
}
