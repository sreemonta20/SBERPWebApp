import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { OnboardingAPIConstants } from '@app/core/constants/onboarding.api-constants';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  getAllOnboardingsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService.getAll(OnboardingAPIConstants.API_GET_ALL_ONBOARDINGS_PAGING_URL, params).pipe(map((r) => r));
  }
  getAcceptedOffers(): Observable<DataResponse> {
    return this.apiService.get(OnboardingAPIConstants.API_GET_ACCEPTED_OFFERS_URL, new HttpParams()).pipe(map((r) => r));
  }
  startOnboarding(request: any): Observable<DataResponse> {
    return this.apiService.post(OnboardingAPIConstants.API_START_ONBOARDING_URL, request).pipe(map((r) => r));
  }
  getOnboardingTasks(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService.get(OnboardingAPIConstants.API_GET_ONBOARDING_TASKS_URL, params).pipe(map((r) => r));
  }
  updateOnboardingTask(request: any): Observable<DataResponse> {
    return this.apiService.post(OnboardingAPIConstants.API_UPDATE_ONBOARDING_TASK_URL, request).pipe(map((r) => r));
  }
  addOnboardingTask(request: any): Observable<DataResponse> {
    return this.apiService.post(OnboardingAPIConstants.API_ADD_ONBOARDING_TASK_URL, request).pipe(map((r) => r));
  }
  completeOnboarding(request: any): Observable<DataResponse> {
    return this.apiService.post(OnboardingAPIConstants.API_COMPLETE_ONBOARDING_URL, request).pipe(map((r) => r));
  }
  cancelOnboarding(request: any): Observable<DataResponse> {
    return this.apiService.post(OnboardingAPIConstants.API_CANCEL_ONBOARDING_URL, request).pipe(map((r) => r));
  }
}

/**
 * Notification facade for the AdminLTE bell. Polls Security via the gateway.
 * Keep this in @app/core/services and inject it into the topbar component.
 */
@Injectable({ providedIn: 'root' })
export class NotificationFeedService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  getUserNotifications(top: number = 10): Observable<DataResponse> {
    const params = new HttpParams().set('top', String(top));
    return this.apiService.get(OnboardingAPIConstants.API_GET_USER_NOTIFICATIONS_URL, params).pipe(map((r) => r));
  }
  markRead(id: string): Observable<DataResponse> {
    return this.apiService.post(OnboardingAPIConstants.API_MARK_NOTIFICATION_READ_URL, { id }).pipe(map((r) => r));
  }
}
