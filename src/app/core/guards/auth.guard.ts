import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  CanActivate
} from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, firstValueFrom } from 'rxjs';

import { CommonService } from '../services/common.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { SessionStorageService } from '../services/session.service';

import {
  RouteConstants,
} from '../constants/common.constants';
import {
  TokenResponse,
  RefreshTokenRequest,
  User,
} from '@app/core/class/index';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private jwtHelper = new JwtHelperService();

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private sessionService: SessionStorageService,
    private authService: AuthService,
    private notifyService: NotificationService,
    private commonService: CommonService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const session = await this.loadSession();

    const isLoggedIn = session.isLoggedIn;
    const loggedInUser = session.loggedInUser;
    const accessToken = session.accessToken;
    const refreshToken = session.refreshToken;

    const isLoginPage = state.url.includes(RouteConstants.LOGIN_USER_URL);

    if (!isLoggedIn || !loggedInUser || this.commonService.isInvalidObject(loggedInUser)) {
      if (!isLoginPage) {
        this.router.navigate([RouteConstants.LOGIN_USER_URL], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
      return true;
    }

    const isTokenValid = accessToken && !this.jwtHelper.isTokenExpired(accessToken);

    if (isTokenValid) {
      // User is logged in with valid token
      if (isLoginPage) {
        return false; // Already logged in, redirect away from login
      }

      if (!this.commonService.isRouteValid(state.url)) {
        return false;
      }

      return true;
    }

    // Attempt token refresh
    const refreshTokenRequest: RefreshTokenRequest = {
      Access_Token: accessToken,
      Refresh_Token: refreshToken,
    };
    debugger
    const isRefreshSuccess = await this.authService.refreshTokenAsync(refreshTokenRequest);

    if (isRefreshSuccess) {
      if (isLoginPage || !this.commonService.isRouteValid(state.url)) {
        return false;
      }
      return true;
    }

    // Token refresh failed
    this.authService.logout();
    return false;
  }

  private async loadSession(): Promise<{
    isLoggedIn: boolean;
    loggedInUser: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const [isLoggedIn, loggedInUser, accessToken, refreshToken] = await firstValueFrom(
      combineLatest([
        this.commonService.isLoggedIn$,
        this.commonService.loggedInUser$,
        this.commonService.accessToken$,
        this.commonService.refreshToken$,
      ])
    );

    return {
      isLoggedIn,
      loggedInUser,
      accessToken,
      refreshToken,
    };
  }
}
