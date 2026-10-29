import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { LeaveAPIConstants } from '@app/core/constants/leave.api-constants';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  // types
  getAllLeaveTypesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(LeaveAPIConstants.API_GET_ALL_LEAVE_TYPES_PAGING_URL, params).pipe(map((r) => r));
  }
  getLeaveTypesLookup(): Observable<DataResponse> {
    return this.apiService.get(LeaveAPIConstants.API_GET_LEAVE_TYPES_LOOKUP_URL, new HttpParams()).pipe(map((r) => r));
  }
  createUpdateLeaveType(request: any): Observable<DataResponse> {
    return this.apiService.post(LeaveAPIConstants.API_CREATE_UPDATE_LEAVE_TYPE_URL, request).pipe(map((r) => r));
  }
  deleteLeaveType(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(LeaveAPIConstants.API_DELETE_LEAVE_TYPE_URL, params).pipe(map((r) => r));
  }

  // policies
  getAllLeavePoliciesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(LeaveAPIConstants.API_GET_ALL_LEAVE_POLICIES_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateLeavePolicy(request: any): Observable<DataResponse> {
    return this.apiService.post(LeaveAPIConstants.API_CREATE_UPDATE_LEAVE_POLICY_URL, request).pipe(map((r) => r));
  }
  deleteLeavePolicy(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(LeaveAPIConstants.API_DELETE_LEAVE_POLICY_URL, params).pipe(map((r) => r));
  }
  grantEntitlements(request: any): Observable<DataResponse> {
    return this.apiService.post(LeaveAPIConstants.API_GRANT_ENTITLEMENTS_URL, request).pipe(map((r) => r));
  }

  // applications + balances
  getAllLeaveApplicationsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(LeaveAPIConstants.API_GET_ALL_LEAVE_APPLICATIONS_PAGING_URL, params).pipe(map((r) => r));
  }
  applyLeave(request: any): Observable<DataResponse> {
    return this.apiService.post(LeaveAPIConstants.API_APPLY_LEAVE_URL, request).pipe(map((r) => r));
  }
  setLeaveApplicationStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(LeaveAPIConstants.API_SET_LEAVE_STATUS_URL, request).pipe(map((r) => r));
  }
  getEmployeeLeaveBalances(employeeId: string, year: number): Observable<DataResponse> {
    const params = new HttpParams().set('id', employeeId).set('year', String(year));
    return this.apiService.get(LeaveAPIConstants.API_GET_EMPLOYEE_BALANCES_URL, params).pipe(map((r) => r));
  }
}
