import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanMatch,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { MessageConstants, RouteConstants } from '../constants/common.constants';

/**
 * One guard, three entry points:
 * - canMatch on the lazy /business route: no session = the business chunk is not downloaded at all.
 * - canActivateChild on the /business layout route: every screen (session, token refresh, menu permission).
 * - canActivate on the public /auth pages: a signed-in user is sent to the dashboard instead.
 *
 * Every "no" returns a UrlTree, never a bare false: a bare false cancels the navigation and leaves
 * an empty page (that is what happened on the login page for a signed-in user, and on a denied URL).
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanMatch, CanActivate, CanActivateChild {
  private jwtHelper = new JwtHelperService();

  constructor(
    private router: Router,
    private authService: AuthService,
    private notifyService: NotificationService,
    private commonService: CommonService
  ) {}

  canMatch(_route: Route, segments: UrlSegment[]): boolean | UrlTree {
    if (this.hasSession()) {
      return true;
    }
    return this.loginUrl('/' + segments.map((segment) => segment.path).join('/'));
  }

  /** Public pages (login, reset password): only for visitors without a session. */
  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.hasSession() ? this.router.parseUrl(RouteConstants.BUSINESS_HOME_URL) : true;
  }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    // The router asks once per route level (e.g. 'humanresources' and then 'employee');
    // the check is about the URL, so it is done once, for the screen itself.
    if (route.firstChild) {
      return true;
    }

    if (!this.hasSession()) {
      return this.loginUrl(state.url);
    }

    const { accessToken } = this.commonService.sessionSnapshot();
    if (!accessToken || this.jwtHelper.isTokenExpired(accessToken)) {
      // single-flight: shared with the interceptor when a request got a 401 at the same time
      const renewed = await this.authService.refreshTokenAsync();
      if (!renewed) {
        this.authService.logout(); // clears the session and opens the login page
        return false;
      }
    }

    return this.checkPermission(state.url);
  }

  private hasSession(): boolean {
    const { isLoggedIn, loggedInUser } = this.commonService.sessionSnapshot();
    return !!isLoggedIn && !this.commonService.isInvalidObject(loggedInUser);
  }

  /** The URL must be one of the user's menu screens (menu rights come from SecurityDB). */
  private checkPermission(url: string): boolean | UrlTree {
    if (this.commonService.isRouteValid(url) || this.isOwnProfileUrl(url)) {
      return true;
    }
    this.notifyService.showError(
      'You do not have permission to open this page.',
      MessageConstants.GENERAL_ERROR_TITLE
    );
    const home = RouteConstants.BUSINESS_HOME_URL;
    if (!url.startsWith(home) && this.commonService.isRouteValid(home)) {
      return this.router.parseUrl(home);
    }
    return false;
  }

  /** The "Profile" link of the top bar and sidebar: every user has one, not only those with the Profiles screen. */
  private isOwnProfileUrl(url: string): boolean {
    const tree = this.router.parseUrl(url);
    return url.split(/[?#]/)[0].toLowerCase() === RouteConstants.USER_PROFILE_URL
      && this.commonService.isOwnProfile(tree.queryParamMap.get('profile'));
  }

  private loginUrl(returnUrl: string): UrlTree {
    return this.router.createUrlTree(['/' + RouteConstants.LOGIN_USER_URL], {
      queryParams: { returnUrl },
    });
  }
}
