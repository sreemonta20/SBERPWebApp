import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../services/common.service';

import {
  DataResponse,
  RefreshTokenRequest,
  UserResponse,
} from '@app/core/class/index';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  MessageConstants,
  RouteConstants,
  SessionConstants,
} from '../constants/common.constants';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { SessionStorageService } from '../services/session.service';

import { HttpClient } from '@angular/common/http';
import {jwtDecode} from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  public jwtHelper: JwtHelperService = new JwtHelperService();
  public isLoggedIn: boolean = false;
  public isRefreshSuccess: boolean = false;
  public loggedInUser: UserResponse = new UserResponse();
  public refreshTokenReq: RefreshTokenRequest = new RefreshTokenRequest();
  public error_message: string = '';
  public isLoading = false;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private tokenHelper: JwtHelperService,
    private sessionService: SessionStorageService,
    private authService: AuthService,
    private notifyService: NotificationService,
    private http: HttpClient,
    private commonService: CommonService
  ) {
    
    // this.loadSession();
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    
    await this.loadSession(); // Wait for session to load
    if (this.loggedInUser && !this.commonService.isInvalidObject(this.loggedInUser)) {
      const token = this.loggedInUser.access_token;
      const tokenPayload = jwtDecode(token) as any;
      const expirationTimestamp = tokenPayload.exp;
      const currentTimestamp = new Date().getTime() / 1000; // Convert to seconds

      if (
        token &&
        !this.commonService.IsExpired(expirationTimestamp, currentTimestamp) &&
        !state.url.includes(RouteConstants.LOGIN_USER_URL)
      ) {
        if (!this.commonService.isRouteValid(state.url)) {
          return false;
        }
        return true;
      } else if (
        token &&
        !this.commonService.IsExpired(expirationTimestamp, currentTimestamp) &&
        state.url.includes(RouteConstants.LOGIN_USER_URL)
      ) {
        return false;
      }

      this.refreshTokenReq.Access_Token = token;
      this.refreshTokenReq.Refresh_Token = this.loggedInUser.refresh_token;
      const isRefreshSuccess = await this.authService.refreshTokenAsync(
        this.refreshTokenReq
      );
      if (isRefreshSuccess) {
        if (state.url.includes(RouteConstants.LOGIN_USER_URL)) {
          return !isRefreshSuccess;
        }

        if (!this.commonService.isRouteValid(state.url)) {
          return !isRefreshSuccess;
        }
        return isRefreshSuccess;
      } else {
        this.authService.revoke(this.refreshTokenReq.Access_Token).subscribe({
          next: (response: DataResponse) => {
            this.commonService.RevokeSession();
          },
          error: (error) => {
            this.error_message = error.error;
            this.notifyService.showError(
              this.error_message,
              MessageConstants.GENERAL_ERROR_TITLE
            );
            this.commonService.RevokeSession();
          },
        });
      }
    } else if (!state.url.includes(RouteConstants.LOGIN_USER_URL)) {
      this.router.navigate([RouteConstants.LOGIN_USER_URL], {
        queryParams: { returnUrl: state.url },
      });
    } else if (state.url.includes(RouteConstants.LOGIN_USER_URL)) {
      return true;
    }
  }

  loadSession(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.commonService.isLoggedIn$.subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
        this.commonService.loggedInUser$.subscribe((loggedInUser) => {
          this.loggedInUser = this.commonService.GetLoggedInUser();
          resolve(); // Resolve the promise when data is available
        });
      });
    });
  }
}
