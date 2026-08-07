import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import {
  PagingSearchFilter,
  EmployeeRequest,
  DepartmentRequest,
  DesignationRequest,
} from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { APIConstants } from '@app/core/constants';
import {
  CommonService,
  SessionStorageService,
  ApiService,
} from '@app/core/services';

@Injectable({
  providedIn: 'root',
})
export class HumanResourcesService {
  constructor(
    private commonService: CommonService,
    private http: HttpClient,
    private apiService: ApiService<DataResponse>,
    private sessionService: SessionStorageService,
  ) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  // =====================================================================
  // EMPLOYEE
  // =====================================================================
  getEmployeeInitialData(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_EMPLOYEE_INITIAL_DATA_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  getAllEmployeesPagingWithSearch(
    filter: PagingSearchFilter,
  ): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_EMPLOYEES_PAGING_URL, params)
      .pipe(map((res: DataResponse) => res));
  }

  getEmployeeById(id: string): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(APIConstants.API_GET_EMPLOYEE_BY_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  createEmployee(request: EmployeeRequest): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_CREATE_EMPLOYEE_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  updateEmployee(request: EmployeeRequest): Observable<DataResponse> {
    return this.apiService
      .update(APIConstants.API_UPDATE_EMPLOYEE_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  deleteEmployee(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .delete(APIConstants.API_DELETE_EMPLOYEE_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  // =====================================================================
  // DEPARTMENT
  // =====================================================================
  getAllDepartments(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_ALL_DEPARTMENTS_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  getAllDepartmentsPagingWithSearch(
    filter: PagingSearchFilter,
  ): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_DEPARTMENTS_PAGING_URL, params)
      .pipe(map((res: DataResponse) => res));
  }

  getDepartmentById(id: string): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(APIConstants.API_GET_DEPARTMENT_BY_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  createUpdateDepartment(request: DepartmentRequest): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_DEPARTMENT_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  deleteDepartment(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .delete(APIConstants.API_DELETE_DEPARTMENT_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  // =====================================================================
  // DESIGNATION
  // =====================================================================
  getAllDesignations(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_ALL_DESIGNATIONS_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  getAllDesignationsPagingWithSearch(
    filter: PagingSearchFilter,
  ): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_DESIGNATIONS_PAGING_URL, params)
      .pipe(map((res: DataResponse) => res));
  }

  createUpdateDesignation(
    request: DesignationRequest,
  ): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_DESIGNATION_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  deleteDesignation(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .delete(APIConstants.API_DELETE_DESIGNATION_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  // =====================================================================
  // HR SETTINGS + ATTENDANCE UPLOAD
  // =====================================================================
  getHRSettings(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_HR_SETTINGS_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  saveUpdateHRSettings(request: any): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_HR_SETTINGS_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  uploadAttendanceExcel(file: File): Observable<DataResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.apiService.postFormData(
      APIConstants.API_UPLOAD_ATTENDANCE_EXCEL_URL,
      formData,
    );
  }

  // =====================================================================
  // COMPANY (Module 0)
  // =====================================================================
  getAllCompanies(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_ALL_COMPANIES_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  getAllCompaniesPagingWithSearch(
    filter: PagingSearchFilter,
  ): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_COMPANIES_PAGING_URL, params)
      .pipe(map((res: DataResponse) => res));
  }

  getCompanyById(id: string): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(APIConstants.API_GET_COMPANY_BY_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  createUpdateCompany(request: any): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_COMPANY_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  deleteCompany(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .delete(APIConstants.API_DELETE_COMPANY_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  // =====================================================================
  // BRANCH (Module 0)
  // =====================================================================
  getAllBranches(): Observable<DataResponse | undefined> {
    return this.apiService
      .getAllWithoutParams(APIConstants.API_GET_ALL_BRANCHES_URL)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  getAllBranchesByCompanyId(
    companyId: string,
  ): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('companyId', companyId);
    return this.apiService
      .getById(APIConstants.API_GET_ALL_BRANCHES_BY_COMPANY_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  getAllBranchesPagingWithSearch(
    filter: PagingSearchFilter,
  ): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(APIConstants.API_GET_ALL_BRANCHES_PAGING_URL, params)
      .pipe(map((res: DataResponse) => res));
  }

  getBranchById(id: string): Observable<DataResponse | undefined> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(APIConstants.API_GET_BRANCH_BY_ID_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  createUpdateBranch(request: any): Observable<DataResponse> {
    return this.apiService
      .post(APIConstants.API_SAVE_UPDATE_BRANCH_URL, request)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }

  deleteBranch(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .delete(APIConstants.API_DELETE_BRANCH_URL, params)
      .pipe(
        map((response: DataResponse) => {
          if (response) {
            return response;
          }
        }),
      );
  }
}
