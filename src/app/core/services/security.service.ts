import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  DataResponse,
  LoginRequest,
  RefreshTokenRequest,
  SaveUpdateRequest,
  UserResponse,
  RoleSaveUpdateRequest,
} from '@app/core/class/index';
import { MenuItem } from '@app/core/interface';
import { securityApiUrl } from 'src/environments/environment';
import { APIConstants, SessionConstants } from '../constants/common.constants';
import { CommonService } from './common.service';
import { SessionStorageService } from './session.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  // public loggedInUser: UserResponse = new UserResponse();
  // userMenus: MenuItem[];
  constructor(
    private commonService: CommonService,
    private http: HttpClient,
    private apiService: ApiService<DataResponse>,
    private sessionService: SessionStorageService
  ) {
    this.apiService.initializeBaseURL(securityApiUrl);
  }

  ///-----------------------------------------------------AppUserRole Start--------------------------------------------------------
  getAllAppUserRoles(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllExtn(APIConstants.API_GET_ALL_APP_USER_ROLES_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  getAllAppUserRolesPagination(
    pageNumber: number,
    pageSize: number
  ): Observable<DataResponse | undefined> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_APP_USER_ROLES_PAGINATION_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  getAppUserRolesById(roleId: string): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('roleId', roleId);
    return this.apiService
      .getById(APIConstants.API_GET_APP_USER_ROLE_BY_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  // createUpdateAppUserRole(
  //   roleRequest: RoleSaveUpdateRequest
  // ): Observable<DataResponse> {
  //   return this.http.post<DataResponse>(
  //     APIConstants.API_SAVE_UPDATE_APP_USER_ROLE_URL,
  //     roleRequest
  //   );
  // }

  createUpdateAppUserRole(
    roleRequest: RoleSaveUpdateRequest
  ): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_APP_USER_ROLE_URL, roleRequest)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  // deleteAppUserRole(roleId: string): Observable<DataResponse> {
  //   const params = new HttpParams().set('roleId', roleId);
  //   return this.http.delete<DataResponse>(
  //     APIConstants.API_DELETE_APP_USER_ROLE_URL,
  //     {
  //       params,
  //     }
  //   );
  // }

  deleteAppUserRole(roleId: string): Observable<DataResponse> {
    const params = new HttpParams().set('roleId', roleId);
    return this.apiService.delete(APIConstants.API_DELETE_APP_USER_ROLE_URL, params).pipe(
      map((response: DataResponse) => {
        if (response) {
          return response;
        }
      })
    );
  }

  ///-----------------------------------------------------AppUserRole Ends--------------------------------------------------------
  getAllAppUserProfile(
    pageNumber: number,
    pageSize: number
  ): Observable<DataResponse | undefined> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_APP_USER_PROFILE_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  getAppUserProfileById(id: string): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(APIConstants.API_GET_APP_USER_PROFILE_BY_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  createUpdateAppUserProfile(
    user: SaveUpdateRequest
  ): Observable<DataResponse> {
    return this.http.post<DataResponse>(
      APIConstants.API_CREATE_UPDATE_APP_USER_PROFILE_URL,
      user
    );
  }

  deleteAppUserProfile(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.delete<DataResponse>(
      APIConstants.API_DELETE_APP_USER_PROFILE_URL,
      {
        params,
      }
    );
  }
}
