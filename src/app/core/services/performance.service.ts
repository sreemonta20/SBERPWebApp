import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { PerformanceAPIConstants } from '@app/core/constants/performance.api-constants';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  // appraisal cycles
  getAllAppraisalCyclesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PerformanceAPIConstants.API_GET_ALL_APPRAISAL_CYCLES_PAGING_URL, params).pipe(map((r) => r));
  }
  getAppraisalCyclesLookup(): Observable<DataResponse> {
    return this.apiService.get(PerformanceAPIConstants.API_GET_APPRAISAL_CYCLES_LOOKUP_URL, new HttpParams()).pipe(map((r) => r));
  }
  createUpdateAppraisalCycle(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_CREATE_UPDATE_APPRAISAL_CYCLE_URL, request).pipe(map((r) => r));
  }
  deleteAppraisalCycle(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(PerformanceAPIConstants.API_DELETE_APPRAISAL_CYCLE_URL, params).pipe(map((r) => r));
  }
  setAppraisalCycleStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_SET_CYCLE_STATUS_URL, request).pipe(map((r) => r));
  }
  initiateReviews(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_INITIATE_REVIEWS_URL, request).pipe(map((r) => r));
  }

  // competencies
  getAllCompetenciesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PerformanceAPIConstants.API_GET_ALL_COMPETENCIES_PAGING_URL, params).pipe(map((r) => r));
  }
  getCompetenciesLookup(): Observable<DataResponse> {
    return this.apiService.get(PerformanceAPIConstants.API_GET_COMPETENCIES_LOOKUP_URL, new HttpParams()).pipe(map((r) => r));
  }
  createUpdateCompetency(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_CREATE_UPDATE_COMPETENCY_URL, request).pipe(map((r) => r));
  }
  deleteCompetency(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(PerformanceAPIConstants.API_DELETE_COMPETENCY_URL, params).pipe(map((r) => r));
  }

  // goals
  getAllGoalsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PerformanceAPIConstants.API_GET_ALL_GOALS_PAGING_URL, params).pipe(map((r) => r));
  }
  createUpdateGoal(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_CREATE_UPDATE_GOAL_URL, request).pipe(map((r) => r));
  }
  updateGoalProgress(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_UPDATE_GOAL_PROGRESS_URL, request).pipe(map((r) => r));
  }
  deleteGoal(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.delete(PerformanceAPIConstants.API_DELETE_GOAL_URL, params).pipe(map((r) => r));
  }

  // reviews
  getAllReviewsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(PerformanceAPIConstants.API_GET_ALL_REVIEWS_PAGING_URL, params).pipe(map((r) => r));
  }
  getReviewDetail(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.get(PerformanceAPIConstants.API_GET_REVIEW_DETAIL_URL, params).pipe(map((r) => r));
  }
  saveReviewRatings(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_SAVE_REVIEW_RATINGS_URL, request).pipe(map((r) => r));
  }
  setReviewStatus(request: any): Observable<DataResponse> {
    return this.apiService.post(PerformanceAPIConstants.API_SET_REVIEW_STATUS_URL, request).pipe(map((r) => r));
  }
}
