import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CommonConstants { }

export const SessionConstants = {
  LOGGED_IN_USER: 'loggedInUser',
  IS_LOGGED_IN: 'isLoggedIn',
  AUTH_TOKEN: 'auth_token',
  AUTH_REFRESH_TOKEN: 'auth_refresh_token',
  USER_MENU:'user_menu',
  SERIALIZED_MENU: 'serialized_menu'
};

export const RouteConstants = {
  LOGIN_USER_URL: 'auth/login',
  BUSINESS_HOME_URL: '/business/home',
  HOME_DASHBOARD_URL: '/home/dashboard'
}

export const APIConstants = {
  APPLICATION_JSON: 'application/json',
  ORIGIN_XREQ_CONTENT_TYPE_ACCEPT:
    'Origin, X-Requested-With, Content-Type, Accept',
  ACCEPT: 'Accept',
  CONTENT_TYPE: 'Content-Type',
  ACCESS_CONTROL_ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  AUTHORIZATION: 'Authorization',
  BEARER: 'Bearer',
  TOKEN: 'access_token',
  API_USER_LOGIN_URL: '/api/Auth/authenticateUser',
  API_REFRESH_TOKEN_URL: '/api/Auth/refreshtoken',
  API_REVOKE_URL: '/api/Auth/revoke',
  API_GET_ALL_APP_USER_ROLES_URL: '/api/RoleMenu/getAllAppUserRoles',
  API_GET_ALL_APP_USER_ROLES_PAGINATION_URL: '/api/RoleMenu/getAllAppUserRolesPagination',
  API_GET_APP_USER_ROLE_BY_ID_URL: '/api/RoleMenu/getAppUserRolesById',
  API_SAVE_UPDATE_APP_USER_ROLE_URL: '/api/RoleMenu/createUpdateAppUserRole',
  API_DELETE_APP_USER_ROLE_URL: '/api/RoleMenu/deleteAppUserRole',
  API_GET_ALL_APP_USER_MENU_PAGING_SEARCH_URL: '/api/RoleMenu/getAllAppUserMenuPagingWithSearch',
  API_GET_ALL_APP_USER_MENU_BY_USER_ID_URL: '/api/RoleMenu/getAllAppUserMenuByUserId',
  API_CREATE_UPDATE_APP_USER_MENU_URL: '/api/RoleMenu/createUpdateAppUserMenu',
  API_DELETE_APP_USER_MENU_URL: '/api/RoleMenu/deleteAppUserMenu',
  API_GET_ALL_PARENT_MENU_URL: '/api/RoleMenu/getAllParentMenus',
  API_GET_APP_USER_ROLE_MENU_INITIAL_DATA_URL: '/api/RoleMenu/getAppUserRoleMenuInitialData',
  API_GET_ALL_APP_USER_ROLE_MENU_PAGING_SEARCH_URL: '/api/RoleMenu/getAllAppUserRoleMenusPagingWithSearch',
  API_CREATE_UPDATE_APP_USER_URL:'/api/User/createUpdateAppUser',
  API_GET_ALL_APP_USER_PROFILE_URL:'/api/User/getAllAppUserProfile',
  API_GET_APP_USER_PROFILE_BY_ID_URL: '/api/User/getAppUserProfileById',
  API_CREATE_UPDATE_APP_USER_PROFILE_URL: '/api/User/createUpdateAppUserProfile',
  API_DELETE_APP_USER_PROFILE_URL: '/api/User/deleteAppUserProfile'
}

export const MessageConstants = {
  GENERAL_SUCCESS_TITLE: 'Success',
  GENERAL_SUCCESS_MSG: 'Success!!',
  GENERAL_WARNING_TITLE: 'Warning',
  GENERAL_WARNING_MSG: 'Warning!!',
  GENERAL_ERROR_TITLE: 'Error',
  GENERAL_ERROR_MSG: 'Error!!',
  ///--------------------Common Error-------------------------------------------------
  INTERNAL_ERROR_MEG: 'We are experiencing an internal error! Please try again later.',

  ///--------------------Home---------------------------------------------------------
  HOME_DASHBOARD_TITLE: "Dashboard:Home",

  ///--------------------App User Role------------------------------------------------
  APP_USER_ROLE_TITLE: "App User Role",
  APP_USER_ROLE_FOUND_MEG: 'User role found',
  APP_USER_ROLE_NOT_FOUND_MEG: 'There is no user role found.',
  APP_USER_ROLE_NOT_FOUND_TO_UPDATE_MEG: 'There is no user role to update.',

  
};

export const DataTypeConstants = {
  Date: 'Date',
  String: 'String',
  Number: 'Number',
  Boolean: 'Boolean',
};


export const Common = {
  CONTROL_USER_NAME: 'username',
  CONTROL_PASSWORD: 'password',
  RETURN_URL: 'returnUrl',
  HOME_TEXT: 'Home',
  APPCONFIG_TEXT: 'App Configuration',
  PAGE_SIZE_ARRAY: [5, 10, 20, 50, 100]
};

export const ErrorCode = {
  CS0200: 'CS0200',
  CS0200_MESSAGE: "Token information doesn't exist in the local session",

};
