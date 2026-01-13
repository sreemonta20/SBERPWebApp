import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CommonConstants { }

export const SessionConstants = {
  LOGGED_IN_USER: 'loggedInUser',
  IS_LOGGED_IN: 'isLoggedIn',
  AUTH_TOKEN: 'auth_token',
  AUTH_REFRESH_TOKEN: 'auth_refresh_token',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
  USER_MENU:'user_menu',
  SERIALIZED_MENU: 'serialized_menu',
  PREVIOUS_URL: 'previousUrl',
  IS_REFRESHING_TOKEN: 'is_refreshing_token'
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
  API_USER_LOGIN_URL: '/api/v1/Auth/authenticateUser',
  API_USER_PROFILE_MENU_URL: '/api/v1/Auth/getAppUserProfileMenu',
  API_REFRESH_TOKEN_URL: '/api/v1/Auth/refreshToken',
  API_REVOKE_URL: '/api/v1/Auth/revoke',
  API_GET_ALL_APP_USER_ROLES_URL: '/api/v1/RoleMenu/getAllAppUserRoles',
  API_GET_ALL_APP_USER_ROLES_PAGINATION_URL: '/api/v1/RoleMenu/getAllAppUserRolesPagination',
  API_GET_APP_USER_ROLE_BY_ID_URL: '/api/v1/RoleMenu/getAppUserRolesById',
  API_SAVE_UPDATE_APP_USER_ROLE_URL: '/api/v1/RoleMenu/createUpdateAppUserRole',
  API_DELETE_APP_USER_ROLE_URL: '/api/v1/RoleMenu/deleteAppUserRole',
  API_GET_ALL_APP_USER_MENU_PAGING_SEARCH_URL: '/api/v1/RoleMenu/getAllAppUserMenuPagingWithSearch',
  API_GET_ALL_APP_USER_MENU_BY_USER_ID_URL: '/api/v1/RoleMenu/getAllAppUserMenuByUserId',
  API_CREATE_UPDATE_APP_USER_MENU_URL: '/api/v1/RoleMenu/createUpdateAppUserMenu',
  API_DELETE_APP_USER_MENU_URL: '/api/v1/RoleMenu/deleteAppUserMenu',
  API_GET_ALL_PARENT_MENU_URL: '/api/v1/RoleMenu/getAllParentMenus',
  API_GET_APP_USER_ROLE_MENU_INITIAL_DATA_URL: '/api/v1/RoleMenu/getAppUserRoleMenuInitialData',
  API_GET_ALL_APP_USER_ROLE_MENU_PAGING_SEARCH_URL: '/api/v1/RoleMenu/getAllAppUserRoleMenusPagingWithSearch',
  API_CREATE_UPDATE_APP_USER_URL:'/api/v1/User/createUpdateAppUser',
  // API_GET_ALL_APP_USER_PROFILE_URL:'/api/v1/User/getAllAppUserProfile',
  // API_GET_APP_USER_PROFILE_BY_ID_URL: '/api/v1/User/getAppUserProfileById',
  // API_CREATE_UPDATE_APP_USER_PROFILE_URL: '/api/v1/User/createUpdateAppUserProfile',
  // API_DELETE_APP_USER_PROFILE_URL: '/api/v1/User/deleteAppUserProfile',
  API_GET_ALL_USER_PROFILE_PAGING_WITH_SEARCH_URL: '/api/v1/User/getAllAppUserProfilePagingWithSearch',
  API_GET_USER_PROFILE_BY_PROFILE_ID_URL: '/api/v1/User/getAppUserProfileById',
  API_POST_SAVE_UPDATE_USER_PROFILE_URL: '/api/v1/User/createUpdateAppUserProfile',
  API_DELETE_USER_PROFILE_URL: '/api/v1/User/deleteAppUserProfile',

  API_GET_ALL_APP_USER_ROLE_MENU_INITIAL_DATA_URL: '/api/v1/RoleMenu/getAppUserRoleMenuInitialData',
  API_GET_ALL_APP_USER_MENU_PAGING_WITH_SEARCH_TERM_URL: '/api/v1/RoleMenu/getAllAppUserMenuPagingWithSearch',
  API_GET_ALL_MENU_BY_USER_ID_URL: '/api/v1/RoleMenu/getAllAppUserMenuByUserId',
  API_POST_SAVE_UPDATE_USER_MENU_URL: '/api/v1/RoleMenu/createUpdateAppUserMenu',
  API_DELETE_USER_MENU_URL: '/api/v1/RoleMenu/deleteAppUserMenu',
  API_GET_ALL_ROLE_MENU_PAGING_WITH_SEARCH_URL: '/api/v1/RoleMenu/getRoleMenusPagingWithSearch',API_SAVE_UPDATE_ROLE_MENU_URL: '/api/v1/RoleMenu/saveUpdateRoleMenuBulk'
  

}

export const MessageConstants = {
  GENERAL_SUCCESS_TITLE: 'Success',
  GENERAL_SUCCESS_MSG: 'Success!!',
  GENERAL_WARNING_TITLE: 'Warning',
  GENERAL_WARNING_MSG: 'Warning!!',
  GENERAL_ERROR_TITLE: 'Error',
  GENERAL_ERROR_MSG: 'Error!!',
  GENERAL_PERMISSION_DENIED_TITLE: 'Permission Denied',
  GENERAL_PERMISSION_DENIED_MSG: 'Permission Denied!!',
  ///--------------------Common Error-------------------------------------------------
  INTERNAL_ERROR_MEG: 'We are experiencing an internal error! Please try again later.',

  ///--------------------Home---------------------------------------------------------
  HOME_DASHBOARD_TITLE: "Dashboard:Home",

  FETCH_DATA_FAILED_MSG: 'Failed to fetch data',
  PAGE_DISPLAY_PROHIBITION_MSG: 'You do not have permission to view this page.',
  ///--------------------App User Role------------------------------------------------
  APP_USER_ROLE_TITLE: "App User Role",
  APP_USER_ROLE_FOUND_MEG: 'User role found',
  APP_USER_ROLE_NOT_FOUND_MEG: 'There is no user role found.',
  APP_USER_ROLE_NOT_FOUND_TO_UPDATE_MEG: 'There is no user role to update.',

  APP_USER_MENU_TITLE: "App User Menu",
  APP_USER_MENU_FOUND_MEG: 'User menu found',
  APP_USER_ROLE_MENU_INITIAL_DATA_NOT_FOUND_MEG: 'There is no initial data found.',
  APP_USER_MENU_NOT_FOUND_MEG: 'There is no user menu found.',
  APP_USER_MENU_NOT_FOUND_TO_UPDATE_MEG: 'There is no user menu to update.',
  APP_USER_MENU_DELETE_CONFIRMATION_MSG: 'Are you sure you want to delete this menu?',

  // ==========================ROLE MENU================================================
  APP_USER_ROLE_NOT_SELECTED_MEG: 'No role selected. Please select a valid role!',
  APP_USER_ROLE_MENU_NO_CHANGE_TO_SAVE_MEG: 'No changes to save.',
  APP_USER_ROLE_MENU_NO_CREATE_PERMISSION_MSG: 'You do not have permission to create role menu records.',
  APP_USER_ROLE_MENU_NO_UPDATE_PERMISSION_MSG: 'You do not have permission to update role menu records.',

  // ==========================APP USER PROFILE================================================
  APP_USER_PROFILE_TITLE: "App User Profile",
  APP_USER_PROFILE_INITIAL_DATA_NOT_FOUND_MEG: 'There is no user role found.',
  APP_USER_PROFILE_FOUND_MEG: 'User profile found',
  APP_USER_PROFILE_NOT_FOUND_MEG: 'There is no user profile found.',
  APP_USER_PROFILE_NOT_FOUND_TO_UPDATE_MEG: 'There is no user profile to update.',
  APP_USER_PROFILE_DELETE_CONFIRMATION_MSG: 'Are you sure you want to delete this user profile?',
  APP_USER_ROLE_DELETE_CONFIRMATION_MSG: 'Are you sure you want to delete this user role?',
  
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
  PAGE_SIZE_ARRAY: [5, 10, 20, 50, 100],
  ACTION_NAME_SAVE: 'Save',
  ACTION_NAME_UPDATE: 'Update'
};

export const ErrorCode = {
  CS0200: 'CS0200',
  CS0200_MESSAGE: "Token information doesn't exist in the local session",

};
