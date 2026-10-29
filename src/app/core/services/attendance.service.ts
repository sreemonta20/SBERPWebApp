import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { AttendanceAPIConstants } from '@app/core/constants/attendance.api-constants';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  // shifts
  getAllShiftsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_SHIFTS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateShift(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_UPDATE_SHIFT_URL, request).pipe(map((r) => r));
  }
  deleteShift(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(AttendanceAPIConstants.API_DELETE_SHIFT_URL, params).pipe(map((r) => r));
  }

  // rosters
  createUpdateRoster(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_UPDATE_ROSTER_URL, request).pipe(map((r) => r));
  }
  getEmployeeRoster(employeeId: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', employeeId);
    return this.apiService.get(AttendanceAPIConstants.API_GET_EMPLOYEE_ROSTER_URL, params).pipe(map((r) => r));
  }
  deleteRoster(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(AttendanceAPIConstants.API_DELETE_ROSTER_URL, params).pipe(map((r) => r));
  }

  // overtime
  getAllOvertimePagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_OVERTIME_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateOvertime(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_UPDATE_OVERTIME_URL, request).pipe(map((r) => r));
  }
  setOvertimeStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_SET_OVERTIME_STATUS_URL, request).pipe(map((r) => r));
  }

  // regularization
  getAllRegularizationsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_REGULARIZATIONS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateRegularization(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_UPDATE_REGULARIZATION_URL, request).pipe(map((r) => r));
  }
  setRegularizationStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_SET_REGULARIZATION_STATUS_URL, request).pipe(map((r) => r));
  }

  // summary
  getMonthlyAttendanceSummary(month: string, departmentId?: string, employeeId?: string): Observable<DataResponse> {
    let params = new HttpParams().set('month', month);
    if (departmentId) params = params.set('departmentId', departmentId);
    if (employeeId) params = params.set('employeeId', employeeId);
    return this.apiService.get(AttendanceAPIConstants.API_GET_MONTHLY_SUMMARY_URL, params).pipe(map((r) => r));
  }

  // biometric registrations
  getAllBiometricRegistrationsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_BIOMETRIC_REGISTRATIONS_PAGING_URL, params).pipe(map((r) => r));
  }
  createTerminalEnrollment(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_TERMINAL_ENROLLMENT_URL, request).pipe(map((r) => r));
  }
  revokeBiometricRegistration(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_REVOKE_BIOMETRIC_REGISTRATION_URL, request).pipe(map((r) => r));
  }

  // punch log
  getAllAttendancePunchesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_ATTENDANCE_PUNCHES_PAGING_URL, params).pipe(map((r) => r));
  }
  reprocessAttendance(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_REPROCESS_ATTENDANCE_URL, request).pipe(map((r) => r));
  }

  // door terminals
  getAllAttendanceDevicesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_ATTENDANCE_DEVICES_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateAttendanceDevice(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_UPDATE_ATTENDANCE_DEVICE_URL, request).pipe(map((r) => r));
  }
  deleteAttendanceDevice(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(AttendanceAPIConstants.API_DELETE_ATTENDANCE_DEVICE_URL, params).pipe(map((r) => r));
  }

  // office zones
  getAllAttendanceZonesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(AttendanceAPIConstants.API_GET_ALL_ATTENDANCE_ZONES_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateAttendanceZone(request: any): Observable<DataResponse> {
    return this.apiService.post(AttendanceAPIConstants.API_CREATE_UPDATE_ATTENDANCE_ZONE_URL, request).pipe(map((r) => r));
  }
  deleteAttendanceZone(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(AttendanceAPIConstants.API_DELETE_ATTENDANCE_ZONE_URL, params).pipe(map((r) => r));
  }
}
