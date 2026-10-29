import { Injectable } from '@angular/core';
import { Observable, finalize, firstValueFrom, map, take } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import {
  DataResponse,
  LoginRequest,
  RefreshTokenRequest
} from '@app/core/class';
import { MenuItem } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { APIConstants } from '@app/core/constants';
import { CommonService, SessionStorageService } from '@app/core/services';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userMenus: MenuItem[];
  private jwtHelper = new JwtHelperService();
  /** The refresh in progress, shared by the guard and every request that got a 401. */
  private refreshInFlight: Promise<boolean> | null = null;
  private loggingOut = false;
  constructor(
    private commonService: CommonService,
    private apiService: ApiService<DataResponse>,
    private sessionService: SessionStorageService
  ) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  login(user: LoginRequest): Observable<DataResponse | undefined> {
    return this.apiService.post(APIConstants.API_USER_LOGIN_URL, user).pipe(
      map((response: DataResponse) => {
        if (response) {
          return response;
        }
      })
    );
  }

  getUserProfileMenu(): Observable<DataResponse | undefined> {
    return this.apiService.getAllWithoutParams(APIConstants.API_USER_PROFILE_MENU_URL).pipe(
      map((response: DataResponse) => {
        if (response) {
          return response;
        }
      })
    );
  }

  async getUserProfileMenuAsync(): Promise<DataResponse>{
    const userProfileMenuResponse = await this.apiService.getAllWithoutParamsAsync(APIConstants.API_USER_PROFILE_MENU_URL);
    return userProfileMenuResponse;

  }


  refreshToken(refreshTokenRequest: RefreshTokenRequest): Observable<DataResponse | undefined> {
    return this.apiService.post(APIConstants.API_REFRESH_TOKEN_URL, refreshTokenRequest).pipe(
      map((response: DataResponse) => {
        if (response) {
          return response;
        }
      })
    );
  }

  /**
   * Renews the access token with the refresh token. The server rotates the refresh token on every
   * call and treats a second use of the old one as theft (it signs the session out), so only one
   * refresh may run at a time: concurrent callers share it. The tokens are always read from the
   * current session, never from the caller, so a caller holding an old pair cannot replay it.
   * The parameter is kept for existing callers and is not used.
   */
  refreshTokenAsync(_refreshTokenRequest?: RefreshTokenRequest): Promise<boolean> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.renewTokens().finally(() => (this.refreshInFlight = null));
    }
    return this.refreshInFlight;
  }

  /**
   * A valid access token to retry a request that failed with <code>expiredAccessToken</code>:
   * the current one if another request refreshed meanwhile, otherwise a freshly refreshed one.
   * Returns null when the session cannot be renewed.
   */
  async getFreshAccessToken(expiredAccessToken: string): Promise<string | null> {
    const current = await firstValueFrom(this.commonService.GetAccessToken());
    if (current && current !== expiredAccessToken && !this.jwtHelper.isTokenExpired(current)) {
      return current;
    }
    if (!(await this.refreshTokenAsync())) {
      return null;
    }
    return (await firstValueFrom(this.commonService.GetAccessToken())) || null;
  }

  private async renewTokens(): Promise<boolean> {
    const accessToken = await firstValueFrom(this.commonService.GetAccessToken());
    const refreshToken = await firstValueFrom(this.commonService.GetRefreshToken());
    if (!refreshToken) {
      return false;
    }

    try {
      const request: RefreshTokenRequest = { Access_Token: accessToken, Refresh_Token: refreshToken };
      const tokenResponse = await this.apiService.postAsync(APIConstants.API_REFRESH_TOKEN_URL, request);
      if (!tokenResponse?.Success) {
        return false;
      }
      this.commonService.UpdateIsLoggedIn(true);
      this.commonService.UpdateAccessToken(tokenResponse.Result.access_token);
      this.commonService.UpdateRefreshToken(tokenResponse.Result.refresh_token);
    } catch (error) {
      console.error('Refreshing the session failed.');
      return false;
    }

    // the session is renewed; reloading the profile / menu (role may have changed) is best effort
    try {
      const userProfileMenuResponse = await this.apiService.getAllWithoutParamsAsync(APIConstants.API_USER_PROFILE_MENU_URL);
      if (userProfileMenuResponse?.Success) {
        this.commonService.UpdateLoggedInUser(userProfileMenuResponse.Result.user);
        this.commonService.UpdateUserMenus(userProfileMenuResponse.Result.userMenus);
        this.commonService.UpdateSerializedUserMenus(this.commonService.parseMenu(userProfileMenuResponse.Result.userMenus));
      }
    } catch (error) {
      console.warn('Reloading the user menu after a token refresh failed.');
    }
    return true;
  }

  /**
   * Signs out: the server revokes this session's refresh token and blacklists the access token
   * (sent by the interceptor). The local session is cleared whatever the server answers.
   */
  logout(): void {
    if (this.loggingOut) {
      return;
    }
    this.loggingOut = true;
    const clearSession = () => {
      this.loggingOut = false;
      this.commonService.RevokeSession();
    };

    this.commonService.GetRefreshToken().pipe(take(1)).subscribe((refreshToken) => {
      if (!refreshToken) {
        clearSession();
        return;
      }
      this.apiService
        .post(APIConstants.API_REVOKE_URL, { Refresh_Token: refreshToken })
        .pipe(take(1), finalize(clearSession))
        .subscribe({
          error: () => console.error('Signing out on the server failed; the local session is cleared.'),
        });
    });
  }

}
