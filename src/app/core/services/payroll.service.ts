import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { PayrollAPIConstants } from '@app/core/constants/payroll.api-constants';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  // pay components
  getAllPayComponentsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PayrollAPIConstants.API_GET_ALL_PAY_COMPONENTS_PAGING_URL, params).pipe(map((r) => r));
  }
  getPayComponentsLookup(): Observable<DataResponse> {
    return this.apiService.get(PayrollAPIConstants.API_GET_PAY_COMPONENTS_LOOKUP_URL, new HttpParams()).pipe(map((r) => r));
  }
  createUpdatePayComponent(request: any): Observable<DataResponse> {
    return this.apiService.post(PayrollAPIConstants.API_CREATE_UPDATE_PAY_COMPONENT_URL, request).pipe(map((r) => r));
  }
  deletePayComponent(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(PayrollAPIConstants.API_DELETE_PAY_COMPONENT_URL, params).pipe(map((r) => r));
  }

  // salary structures
  getAllSalaryStructuresPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PayrollAPIConstants.API_GET_ALL_SALARY_STRUCTURES_PAGING_URL, params).pipe(map((r) => r));
  }
  getSalaryStructureDetail(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.get(PayrollAPIConstants.API_GET_SALARY_STRUCTURE_DETAIL_URL, params).pipe(map((r) => r));
  }
  createUpdateSalaryStructure(request: any): Observable<DataResponse> {
    return this.apiService.post(PayrollAPIConstants.API_CREATE_UPDATE_SALARY_STRUCTURE_URL, request).pipe(map((r) => r));
  }
  deleteSalaryStructure(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(PayrollAPIConstants.API_DELETE_SALARY_STRUCTURE_URL, params).pipe(map((r) => r));
  }

  // payroll runs + payslips
  getAllPayrollRunsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PayrollAPIConstants.API_GET_ALL_PAYROLL_RUNS_PAGING_URL, params).pipe(map((r) => r));
  }
  processPayrollRun(request: any): Observable<DataResponse> {
    return this.apiService.post(PayrollAPIConstants.API_PROCESS_PAYROLL_RUN_URL, request).pipe(map((r) => r));
  }
  setPayrollRunStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(PayrollAPIConstants.API_SET_PAYROLL_RUN_STATUS_URL, request).pipe(map((r) => r));
  }
  getPayslipsByRun(runId: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', runId);
    return this.apiService.get(PayrollAPIConstants.API_GET_PAYSLIPS_BY_RUN_URL, params).pipe(map((r) => r));
  }
  getPayslipDetail(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.get(PayrollAPIConstants.API_GET_PAYSLIP_DETAIL_URL, params).pipe(map((r) => r));
  }

  // loans
  getAllLoansPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PayrollAPIConstants.API_GET_ALL_LOANS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateLoan(request: any): Observable<DataResponse> {
    return this.apiService.post(PayrollAPIConstants.API_CREATE_UPDATE_LOAN_URL, request).pipe(map((r) => r));
  }
  setLoanStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(PayrollAPIConstants.API_SET_LOAN_STATUS_URL, request).pipe(map((r) => r));
  }
}
