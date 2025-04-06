import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import {
  DataResponse,
  LoginRequest,
  RefreshTokenRequest
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

  async refreshTokenAsync(refreshTokenRequest: RefreshTokenRequest): Promise<boolean>{
    
    if(!refreshTokenRequest){
      return false;
    }

    try {
      const tokenResponse = await this.apiService.postAsync(APIConstants.API_REFRESH_TOKEN_URL,refreshTokenRequest);
      if(tokenResponse.Success){
        this.commonService.UpdateIsLoggedIn(true);
        this.commonService.UpdateAccessToken(tokenResponse.Result.access_token);
        this.commonService.UpdateRefreshToken(tokenResponse.Result.refresh_token);
        const userProfileMenuResponse = await this.apiService.getAllWithoutParamsAsync(APIConstants.API_USER_PROFILE_MENU_URL);
        if(userProfileMenuResponse.Success){
          this.commonService.UpdateLoggedInUser(userProfileMenuResponse.Result.user);
          this.commonService.UpdateUserMenus(userProfileMenuResponse.Result.userMenus);
          this.commonService.UpdateSerializedUserMenus(this.commonService.parseMenu(userProfileMenuResponse.Result.userMenus));
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error('An error occurred during refresh token:', error);
      return false;
    }
    
  }


  // Simplified logout function
  logout(): void {
    this.commonService.GetLoggedInUser().pipe(
      take(1)
    ).subscribe(userProfile => {
      if (userProfile && userProfile.UserName) {
        const request = { UserName: userProfile.UserName };
        
        this.apiService.post(APIConstants.API_REVOKE_URL, request).pipe(
          take(1)
        ).subscribe({
          next: (response) => {
            if (response.Success) {
              console.log('Refresh token revoked successfully.');
            }
          },
          error: (err) => {
            console.error('Error revoking refresh token:', err);
          },
          complete: () => {
            this.commonService.RevokeSession();
          }
        });
      } else {
        this.commonService.RevokeSession();
      }
    });
  }

}
