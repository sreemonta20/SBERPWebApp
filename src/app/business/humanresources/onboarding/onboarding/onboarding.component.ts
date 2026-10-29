import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService,
} from '@app/core/services';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Onboarding screen. List of onboardings + a "Start from accepted offer" picker
 * + an inline checklist panel. Starting an onboarding calls the backend SP that
 * creates the Employee and queues the EmployeeOnboardedEvent. Same viewMode /
 * permission discipline as the rest of HR.
 */
@Component({
  selector: 'app-onboarding',
  standalone: false,
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
})
export class OnboardingComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // 'list' = the table, 'start' = the accepted-offer picker, 'checklist' = task panel
  public viewMode: 'list' | 'start' | 'checklist' = 'list';

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public onboardingList: any[] = [];
  public acceptedOffers: any[] = [];
  public searchTerm = '';

  // start form
  public selectedOfferId = '';
  public reportingManagerId = '';
  public workLocation = '';

  // checklist panel
  public activeOnboarding: any = null;
  public tasks: any[] = [];
  public readonly TASK = { Pending: 1, InProgress: 2, Done: 3, NA: 4 };
  public readonly STATUS = { Initiated: 1, InProgress: 2, Completed: 3, Cancelled: 4 };

  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;
  private pendingCancelId = '';
  public deleteConfirmationMessage = '';

  constructor(
    public router: Router,
    private onboardingService: OnboardingService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate;
    this.loadOnboardingsPaging();
  }

  // ---------- list ----------
  loadOnboardingsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'OnboardingCode', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.onboardingService.getAllOnboardingsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.onboardingList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.onboardingList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  // ---------- start from accepted offer ----------
  openStart(): void {
    if (!this.isCreate) return;
    this.selectedOfferId = ''; this.reportingManagerId = ''; this.workLocation = '';
    this.onboardingService.getAcceptedOffers().subscribe({
      next: (res: any) => { this.acceptedOffers = (res?.success && Array.isArray(res.result)) ? res.result : []; },
      error: (e) => this.handleError(e),
    });
    this.viewMode = 'start';
  }

  startOnboarding(): void {
    if (!this.selectedOfferId) {
      this.notifyService.showWarning('Select an accepted offer', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    this.loadingService.setLoading(true);
    this.onboardingService.startOnboarding({
      jobOfferId: this.selectedOfferId,
      reportingManagerId: this.reportingManagerId || undefined,
      workLocation: this.workLocation || undefined,
      createUpdateBy: this.appUserProfileId,
    }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadOnboardingsPaging();
        } else {
          this.notifyService.showWarning(res?.message || 'Could not start onboarding', MessageConstants.GENERAL_WARNING_TITLE);
        }
      },
      error: (e) => this.handleError(e),
    });
  }

  // ---------- checklist ----------
  openChecklist(row: any): void {
    this.activeOnboarding = row;
    this.loadTasks(row.id);
    this.viewMode = 'checklist';
  }

  loadTasks(onboardingId: string): void {
    this.onboardingService.getOnboardingTasks(onboardingId).subscribe({
      next: (res: any) => { this.tasks = (res?.success && Array.isArray(res.result)) ? res.result : []; },
      error: (e) => this.handleError(e),
    });
  }

  setTaskStatus(task: any, statusId: number): void {
    if (!this.isUpdate) return;
    this.onboardingService.updateOnboardingTask({
      id: task.id, onboardingId: this.activeOnboarding.id, statusId, createUpdateBy: this.appUserProfileId,
    }).subscribe({
      next: (res: any) => {
        if (res?.success) { this.loadTasks(this.activeOnboarding.id); this.loadOnboardingsPaging(); }
        else this.notifyService.showWarning(res?.message || 'Update failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  complete(): void {
    this.onboardingService.completeOnboarding({ id: this.activeOnboarding.id, createUpdateBy: this.appUserProfileId })
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
            this.viewMode = 'list'; this.loadOnboardingsPaging();
          } else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        },
        error: (e) => this.handleError(e),
      });
  }

  cancel(row: any): void {
    this.pendingCancelId = row.id;
    this.deleteConfirmationMessage = `Cancel onboarding ${row.onboardingCode}?`;
    this.confirmDialog?.open();
  }

  executeCancel(): void {
    if (!this.pendingCancelId) return;
    this.onboardingService.cancelOnboarding({ id: this.pendingCancelId, createUpdateBy: this.appUserProfileId })
      .subscribe({
        next: (res: any) => {
          if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadOnboardingsPaging(); }
          else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
          this.pendingCancelId = '';
        },
        error: (e) => { this.handleError(e); this.pendingCancelId = ''; },
      });
  }

  backToList(): void { this.viewMode = 'list'; this.activeOnboarding = null; }

  progressPct(row: any): number {
    return row.checklistTotal > 0 ? Math.round((row.checklistDone / row.checklistTotal) * 100) : 0;
  }
  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Initiated: return 'badge badge-secondary';
      case this.STATUS.InProgress: return 'badge badge-warning';
      case this.STATUS.Completed: return 'badge badge-success';
      case this.STATUS.Cancelled: return 'badge badge-danger';
      default: return 'badge badge-light';
    }
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadOnboardingsPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadOnboardingsPaging(); }
  search(): void { this.currentPage = 1; this.loadOnboardingsPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.onboardingList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
