import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { SeparationAPIConstants } from '@app/core/constants/separation.api-constants';

@Injectable({ providedIn: 'root' })
export class SeparationService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  getAllSeparationsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(SeparationAPIConstants.API_GET_ALL_SEPARATIONS_PAGING_URL, params).pipe(map((r) => r));
  }
  getSeparationDetail(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.get(SeparationAPIConstants.API_GET_SEPARATION_DETAIL_URL, params).pipe(map((r) => r));
  }
  createUpdateSeparation(request: any): Observable<DataResponse> {
    return this.apiService.post(SeparationAPIConstants.API_CREATE_UPDATE_SEPARATION_URL, request).pipe(map((r) => r));
  }
  deleteSeparation(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(SeparationAPIConstants.API_DELETE_SEPARATION_URL, params).pipe(map((r) => r));
  }
  setSeparationStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(SeparationAPIConstants.API_SET_SEPARATION_STATUS_URL, request).pipe(map((r) => r));
  }
  approveSeparation(request: any): Observable<DataResponse> {
    return this.apiService.post(SeparationAPIConstants.API_APPROVE_SEPARATION_URL, request).pipe(map((r) => r));
  }
  settleSeparation(request: any): Observable<DataResponse> {
    return this.apiService.post(SeparationAPIConstants.API_SETTLE_SEPARATION_URL, request).pipe(map((r) => r));
  }
  setClearanceStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(SeparationAPIConstants.API_SET_CLEARANCE_STATUS_URL, request).pipe(map((r) => r));
  }
  createUpdateExitInterview(request: any): Observable<DataResponse> {
    return this.apiService.post(SeparationAPIConstants.API_CREATE_UPDATE_EXIT_INTERVIEW_URL, request).pipe(map((r) => r));
  }
}
