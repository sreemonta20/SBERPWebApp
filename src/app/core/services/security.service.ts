import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  DataResponse,
  LoginRequest,
  RefreshTokenRequest,
  SaveUpdateRequest,
  RoleSaveUpdateRequest,
  AppUserMenuRequest,
} from '@app/core/class/index';
import { MenuItem, PagingSearchFilter } from '@app/core/interface/index';
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

  ///-----------------------------------------------------AppUserRole start-----------------------------------------------
  getAllAppUserRoles(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_ALL_APP_USER_ROLES_URL)
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

  deleteAppUserRole(roleId: string): Observable<DataResponse> {
    const params = new HttpParams().set('roleId', roleId);
    return this.apiService
      .delete(APIConstants.API_DELETE_APP_USER_ROLE_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  ///-----------------------------------------------------AppUserRole ends-------------------------

  ///---------------------------------------------AppUserMenu starts-------------------------------
  getAppUserRoleMenuInitialData(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(
        APIConstants.API_GET_ALL_APP_USER_ROLE_MENU_INITIAL_DATA_URL
      )
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  // getAllAppUserMenuPagingWithSearch(
  //   searchTerm: string,
  //   sortColumnName: string,
  //   sortColumnDirection: string,
  //   pageNumber: number,
  //   pageSize: number
  // ): Observable<DataResponse | undefined> {
  //   const params = new HttpParams()
  //     .set('searchTerm', searchTerm)
  //     .set('sortColumnName', sortColumnName)
  //     .set('sortColumnDirection', sortColumnDirection)
  //     .set('pageNumber', pageNumber)
  //     .set('pageSize', pageSize);
  //   return this.apiService
  //     .getAll(
  //       APIConstants.API_GET_ALL_APP_USER_MENU_PAGING_WITH_SEARCH_TERM_URL,
  //       params
  //     )
  //     .pipe(
  //       map((response: DataResponse) => {
  //         if (response) {
  //           return response;
  //         }
  //       })
  //     );
  // }

  getAllAppUserMenuPagingWithSearch(
    searchTerm: string,
    sortColumnName: string,
    sortColumnDirection: string,
    pageNumber: number,
    pageSize: number
  ): Observable<DataResponse | undefined> {
    // Create the request object as expected by the API
    const param = {
      SearchTerm: searchTerm,
      SortColumnName: sortColumnName,
      SortColumnDirection: sortColumnDirection,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };
    const params = new HttpParams().set('param', JSON.stringify(param));
    // Send the request object as a query parameter
    return this.apiService
      .getAll(
        APIConstants.API_GET_ALL_APP_USER_MENU_PAGING_WITH_SEARCH_TERM_URL,
        params
      )
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  getAllAppUserMenuByUserId(
    userId: string
  ): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('userId', userId);
    return this.apiService
      .getById(APIConstants.API_GET_ALL_MENU_BY_USER_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  createUpdateAppUserMenu(
    appUserMenuRequest: AppUserMenuRequest
  ): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_POST_SAVE_UPDATE_USER_MENU_URL, appUserMenuRequest)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  deleteAppUserMenu(appUserMenuId: string): Observable<DataResponse> {
    const params = new HttpParams().set('menuId', appUserMenuId);
    return this.apiService
      .delete(APIConstants.API_DELETE_USER_MENU_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        })
      );
  }

  ///---------------------------------------------AppUserMenu ends---------------------------------

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

  // Role Menu Service Methods
  // getAllAppUserRoles(): Observable<DataResponse> {
  //   return this.apiService
  //     .getAll(APIConstants.API_GET_ALL_APP_USER_ROLES)
  //     .pipe(map((response: DataResponse) => response));
  // }

  getRoleMenusPagingWithSearch(
    roleId: string,
    filter: PagingSearchFilter
  ): Observable<DataResponse> {
    const params = new HttpParams()
      .set('roleId', roleId)
      .set('param', JSON.stringify(filter));

    return this.apiService
      .getAll(APIConstants.API_GET_ALL_ROLE_MENU_PAGING_WITH_SEARCH_URL, params)
      .pipe(map((res: DataResponse) => res));
  }

  saveUpdateRoleMenuBulk(payload: any): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_ROLE_MENU_URL, payload)
      .pipe(map((res: DataResponse) => res));
  }
}
