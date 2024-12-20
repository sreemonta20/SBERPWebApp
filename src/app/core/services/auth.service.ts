import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  DataResponse,
  LoginRequest,
  RefreshTokenRequest,
  UserResponse,
} from '@app/core/class/index';
import { MenuItem } from '@app/core/interface';
import { securityApiUrl } from 'src/environments/environment';
import { APIConstants, SessionConstants } from '../constants/common.constants';
import { CommonService } from '../services/common.service';
import { SessionStorageService } from '../services/session.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public loggedInUser: UserResponse = new UserResponse();
  public userMenus: MenuItem[];
  constructor(
    private commonService: CommonService,
    private apiService: ApiService<DataResponse>,
    private sessionService: SessionStorageService
  ) {
    this.apiService.initializeBaseURL(securityApiUrl);
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

  renewToken(
    refreshTokenRequest: RefreshTokenRequest
  ): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_REFRESH_TOKEN_URL, refreshTokenRequest)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  async refreshToken<DataResponse>(
    refreshTokenRequest: RefreshTokenRequest
  ): Promise<DataResponse> {
    const result = await this.apiService.postDataAsync<DataResponse>(
      APIConstants.API_REFRESH_TOKEN_URL,
      refreshTokenRequest
    );
    return result;
  }

  async refreshTokenAsync(
    refreshTokenModelReq: RefreshTokenRequest
  ): Promise<boolean> {
    if (
      !refreshTokenModelReq.Access_Token ||
      !refreshTokenModelReq.Refresh_Token
    ) {
      return false;
    }
    let isRefreshSuccess: boolean;

    try {
      const result = await this.apiService.postAsync(
        APIConstants.API_REFRESH_TOKEN_URL,
        refreshTokenModelReq
      );
      if (result.ResponseCode === 200) {
        this.loggedInUser = result.Result;
        this.userMenus = JSON.parse(this.loggedInUser.userMenus);
        this.sessionService.set(
          SessionConstants.LOGGED_IN_USER,
          this.loggedInUser
        );
        this.sessionService.set(SessionConstants.IS_LOGGED_IN, true);
        this.sessionService.set(SessionConstants.USER_MENU, this.userMenus);

        this.commonService.UpdateIsLoggedIn(true);
        this.commonService.UpdateLoggedInUser(this.loggedInUser);
        this.commonService.UpdateUserMenus(this.userMenus);
        isRefreshSuccess = true;
      } else if (result.ResponseCode === 400 || result.ResponseCode === 500) {
        isRefreshSuccess = false;
      }
    } catch (error) {
      console.error('An error occurred during refresh token:', error);
      isRefreshSuccess = false;
    }
    return isRefreshSuccess;
  }

  revoke(userToken: string): Observable<DataResponse> {
    const params = new HttpParams().set('userToken', userToken);
    return this.apiService.get(APIConstants.API_REVOKE_URL, params).pipe(
      map((response: DataResponse) => {
        if (response) {
          return response;
        }
      })
    );
  }

  async revokeAsync(userToken: string): Promise<DataResponse> {
    const params = new HttpParams().set('userToken', userToken);
    const result = await this.apiService.postAsync(
      APIConstants.API_REVOKE_URL,
      { params }
    );
    return result;
  }
}
