import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DataResponse } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/common';
import { gatewayUrl } from '@environments/environment';
import { ApiService } from '@app/core/services';
import { RecruitmentAPIConstants } from '@app/core/constants/recruitment.api-constants';

/**
 * Recruitment facade — mirrors HumanResourcesService: one ApiService<DataResponse>
 * pointed at the gateway, paging passes `param` = JSON.stringify(filter), and
 * responses come back camelCase. Register in @app/core/services barrel if used.
 */
@Injectable({ providedIn: 'root' })
export class RecruitmentService {
  constructor(private apiService: ApiService<DataResponse>) {
    this.apiService.initializeBaseURL(gatewayUrl);
  }

  // ---------- Position ----------
  getAllPositions(): Observable<DataResponse> {
    return this.apiService
      .getAllWithoutParams(RecruitmentAPIConstants.API_GET_ALL_POSITIONS_URL)
      .pipe(map((r: DataResponse) => r));
  }
  getAllPositionsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(RecruitmentAPIConstants.API_GET_ALL_POSITIONS_PAGING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  createUpdatePosition(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_SAVE_UPDATE_POSITION_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  deletePosition(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .delete(RecruitmentAPIConstants.API_DELETE_POSITION_URL, params)
      .pipe(map((r: DataResponse) => r));
  }

  // ---------- Requisition ----------
  getAllRequisitionsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(RecruitmentAPIConstants.API_GET_ALL_REQUISITIONS_PAGING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  getRequisitionById(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(RecruitmentAPIConstants.API_GET_REQUISITION_BY_ID_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  createUpdateRequisition(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_SAVE_UPDATE_REQUISITION_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  submitRequisition(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_SUBMIT_REQUISITION_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  approveRequisition(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_APPROVE_REQUISITION_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  rejectRequisition(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_REJECT_REQUISITION_URL, request)
      .pipe(map((r: DataResponse) => r));
  }

  // ---------- Job Posting ----------
  getAllJobPostingsPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(RecruitmentAPIConstants.API_GET_ALL_JOBPOSTINGS_PAGING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  getJobPostingById(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(RecruitmentAPIConstants.API_GET_JOBPOSTING_BY_ID_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  createUpdateJobPosting(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_SAVE_UPDATE_JOBPOSTING_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  publishJobPosting(id: string, user: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id).set('user', user);
    return this.apiService
      .get(RecruitmentAPIConstants.API_PUBLISH_JOBPOSTING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  closeJobPosting(id: string, user: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id).set('user', user);
    return this.apiService
      .get(RecruitmentAPIConstants.API_CLOSE_JOBPOSTING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  getApplicationsByPosting(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .get(RecruitmentAPIConstants.API_GET_APPLICATIONS_BY_POSTING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }

  // ---------- Candidate / Application ----------
  getAllCandidatesPagingWithSearch(filter: PagingSearchFilter): Observable<DataResponse> {
    const params = new HttpParams().set('param', JSON.stringify(filter));
    return this.apiService
      .getAll(RecruitmentAPIConstants.API_GET_ALL_CANDIDATES_PAGING_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  applyToPosting(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_APPLY_TO_POSTING_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  moveApplicationStage(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_MOVE_APPLICATION_STAGE_URL, request)
      .pipe(map((r: DataResponse) => r));
  }

  // ---------- Interview ----------
  getInterviewsByApplication(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .get(RecruitmentAPIConstants.API_GET_INTERVIEWS_BY_APPLICATION_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  createUpdateInterview(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_SAVE_UPDATE_INTERVIEW_URL, request)
      .pipe(map((r: DataResponse) => r));
  }

  // ---------- Offer ----------
  getOfferById(id: string): Observable<DataResponse> {
    const params = new HttpParams().set('id', id);
    return this.apiService
      .getById(RecruitmentAPIConstants.API_GET_OFFER_BY_ID_URL, params)
      .pipe(map((r: DataResponse) => r));
  }
  createUpdateOffer(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_SAVE_UPDATE_OFFER_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  issueOffer(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_ISSUE_OFFER_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  acceptOffer(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_ACCEPT_OFFER_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
  declineOffer(request: any): Observable<DataResponse> {
    return this.apiService
      .post(RecruitmentAPIConstants.API_DECLINE_OFFER_URL, request)
      .pipe(map((r: DataResponse) => r));
  }
}
