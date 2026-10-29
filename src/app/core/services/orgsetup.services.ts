import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { OrgSetupAPIConstants } from '@app/core/constants/orgsetup.api-constants';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  constructor(private apiService: ApiService<DataResponse>) { this.apiService.initializeBaseURL(gatewayUrl); }
  getAllPaging(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OrgSetupAPIConstants.API_GET_ALL_COMPANIES_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_COMPANY_URL, request).pipe(map((r) => r)); }
  delete(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_COMPANY_URL, params).pipe(map((r) => r)); }
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  constructor(private apiService: ApiService<DataResponse>) { this.apiService.initializeBaseURL(gatewayUrl); }
  getAllPaging(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OrgSetupAPIConstants.API_GET_ALL_BRANCHES_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_BRANCH_URL, request).pipe(map((r) => r)); }
  delete(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_BRANCH_URL, params).pipe(map((r) => r)); }
}

@Injectable({ providedIn: 'root' })
export class CostCenterService {
  constructor(private apiService: ApiService<DataResponse>) { this.apiService.initializeBaseURL(gatewayUrl); }
  getAllPaging(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OrgSetupAPIConstants.API_GET_ALL_COSTCENTERS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_COSTCENTER_URL, request).pipe(map((r) => r)); }
  delete(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_COSTCENTER_URL, params).pipe(map((r) => r)); }
}

@Injectable({ providedIn: 'root' })
export class JobGradeService {
  constructor(private apiService: ApiService<DataResponse>) { this.apiService.initializeBaseURL(gatewayUrl); }
  getAllPaging(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OrgSetupAPIConstants.API_GET_ALL_JOBGRADES_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_JOBGRADE_URL, request).pipe(map((r) => r)); }
  delete(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_JOBGRADE_URL, params).pipe(map((r) => r)); }
}

@Injectable({ providedIn: 'root' })
export class HolidayCalendarService {
  constructor(private apiService: ApiService<DataResponse>) { this.apiService.initializeBaseURL(gatewayUrl); }
  getAllPaging(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OrgSetupAPIConstants.API_GET_ALL_HOLIDAYCALENDARS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_HOLIDAYCALENDAR_URL, request).pipe(map((r) => r)); }
  delete(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_HOLIDAYCALENDAR_URL, params).pipe(map((r) => r)); }
  getHolidayDates(calendarId: string): Observable<DataResponse> { const params = new HttpParams().set('calendarId', calendarId); return this.apiService.get(OrgSetupAPIConstants.API_GET_HOLIDAY_DATES_URL, params).pipe(map((r) => r)); }
  createUpdateHolidayDate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_HOLIDAY_DATE_URL, request).pipe(map((r) => r)); }
  deleteHolidayDate(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_HOLIDAY_DATE_URL, params).pipe(map((r) => r)); }
}

@Injectable({ providedIn: 'root' })
export class PositionService {
  constructor(private apiService: ApiService<DataResponse>) { this.apiService.initializeBaseURL(gatewayUrl); }
  getAllPaging(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OrgSetupAPIConstants.API_GET_ALL_POSITIONS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdate(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_CREATE_UPDATE_POSITION_URL, request).pipe(map((r) => r)); }
  delete(id: string): Observable<DataResponse> { const params = new HttpParams().set('id', id); return this.apiService.delete(OrgSetupAPIConstants.API_DELETE_POSITION_URL, params).pipe(map((r) => r)); }
  setFill(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_SET_POSITION_FILL_URL, request).pipe(map((r) => r)); }
  setStatus(request: any): Observable<DataResponse> { return this.apiService.post(OrgSetupAPIConstants.API_SET_POSITION_STATUS_URL, request).pipe(map((r) => r)); }
  getOrgTree(rootPositionId?: string): Observable<DataResponse> {
    let params = new HttpParams();
    if (rootPositionId) params = params.set('rootPositionId', rootPositionId);
    return this.apiService.get(OrgSetupAPIConstants.API_GET_POSITION_ORG_TREE_URL, params).pipe(map((r) => r));
  }
}
