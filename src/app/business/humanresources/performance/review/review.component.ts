import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService, LoaderService, NotificationService } from '@app/core/services';
import { PerformanceService } from '@app/core/services/performance.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/**
 * Reviews: list + the rating screen. Each review carries goal lines + competency
 * lines; self and manager score each, the weighted roll-up is recomputed
 * server-side on save, and the workflow advances Self -> Manager -> Completed ->
 * Acknowledged.
 */
@Component({
  selector: 'app-review',
  standalone: false,
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css'],
})
export class ReviewComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'detail' = 'list';

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public searchTerm = '';
  public readonly STATUS = { NotStarted: 1, SelfAssessment: 2, ManagerReview: 3, Completed: 4, Acknowledged: 5 };

  public detail: any = null;
  public ratings: any[] = [];
  public selfComments = '';
  public managerComments = '';
  public scaleMax = 5;

  public deleteConfirmationMessage = '';
  private pendingStatus: number | null = null;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private performanceService: PerformanceService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isUpdate = p.IsUpdate;
    this.loadPaging();
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'asc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.performanceService.getAllReviewsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.list = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.list = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  open(row: any): void {
    this.loadingService.setLoading(true);
    this.performanceService.getReviewDetail(row.id).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        const d = res?.result;
        if (!res?.success || !d) { this.notifyService.showWarning('Could not load review', MessageConstants.GENERAL_WARNING_TITLE); return; }
        this.detail = d;
        this.scaleMax = d.RatingScaleMax || d.ratingScaleMax || 5;
        this.selfComments = d.SelfComments || d.selfComments || '';
        this.managerComments = d.ManagerComments || d.managerComments || '';
        const lines = d.Ratings || d.ratings || [];
        this.ratings = lines.map((l: any) => ({
          id: l.Id || l.id,
          itemTypeId: l.ItemTypeId ?? l.itemTypeId,
          itemName: l.ItemName || l.itemName,
          weight: l.Weight ?? l.weight,
          selfScore: l.SelfScore ?? l.selfScore ?? null,
          managerScore: l.ManagerScore ?? l.managerScore ?? null,
          comments: l.Comments || l.comments || '',
        }));
        this.viewMode = 'detail';
      },
      error: (e) => this.handleError(e),
    });
  }

  back(): void { this.viewMode = 'list'; this.detail = null; this.ratings = []; }

  get previewSelf(): number { return this.weighted('selfScore'); }
  get previewManager(): number { return this.weighted('managerScore'); }
  private weighted(field: 'selfScore' | 'managerScore'): number {
    const wsum = this.ratings.reduce((a, r) => a + (+r.weight || 0), 0);
    if (wsum <= 0) {
      const vals = this.ratings.map((r) => +r[field] || 0);
      return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
    }
    const sum = this.ratings.reduce((a, r) => a + (+r[field] || 0) * (+r.weight || 0), 0);
    return +(sum / wsum).toFixed(2);
  }

  saveRatings(): void {
    if (!this.detail) return;
    const request = {
      reviewId: this.detail.Id || this.detail.id,
      ratings: this.ratings.map((r) => ({ id: r.id, selfScore: r.selfScore, managerScore: r.managerScore, comments: r.comments })),
      selfComments: this.selfComments,
      managerComments: this.managerComments,
      createUpdateBy: this.appUserProfileId,
    };
    this.loadingService.setLoading(true);
    this.performanceService.saveReviewRatings(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  submitSelf(): void { this.confirmStatus(this.STATUS.ManagerReview, 'Submit self-assessment and send to manager?'); }
  completeManager(): void { this.confirmStatus(this.STATUS.Completed, 'Complete this review? Scores will be finalised.'); }
  acknowledge(): void { this.confirmStatus(this.STATUS.Acknowledged, 'Acknowledge this review?'); }

  private confirmStatus(status: number, msg: string): void {
    if (!this.isUpdate) return;
    this.pendingStatus = status;
    this.deleteConfirmationMessage = msg;
    this.confirmDialog?.open();
  }

  executeStatus(): void {
    if (this.pendingStatus == null || !this.detail) return;
    // persist current scores before advancing
    this.saveRatings();
    this.performanceService.setReviewStatus({
      id: this.detail.Id || this.detail.id, statusId: this.pendingStatus,
      acknowledgement: this.pendingStatus === this.STATUS.Acknowledged ? 'Acknowledged' : null,
      createUpdateBy: this.appUserProfileId,
    }).subscribe({
      next: (res: any) => {
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.back(); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingStatus = null;
      },
      error: (e) => { this.handleError(e); this.pendingStatus = null; },
    });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.NotStarted: return 'badge badge-secondary';
      case this.STATUS.SelfAssessment: return 'badge badge-info';
      case this.STATUS.ManagerReview: return 'badge badge-warning';
      case this.STATUS.Completed: return 'badge badge-primary';
      case this.STATUS.Acknowledged: return 'badge badge-success';
      default: return 'badge badge-light';
    }
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadPaging(); }
  search(): void { this.currentPage = 1; this.loadPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.list.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
