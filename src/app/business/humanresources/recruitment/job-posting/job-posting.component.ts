import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService,
} from '@app/core/services';
import { RecruitmentService } from '@app/core/services/recruitment.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/**
 * Job Posting screen. A posting can only be created against an APPROVED
 * requisition (the backend enforces this too). List view exposes Publish /
 * Close actions driven by statusId.
 */
@Component({
  selector: 'app-job-posting',
  standalone: false,
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.css'],
})
export class JobPostingComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public postingList: any[] = [];
  public approvedRequisitions: any[] = [];
  public searchTerm = '';

  public readonly STATUS = { Draft: 1, Published: 2, Paused: 3, Closed: 4, Cancelled: 5 };

  public postingForm!: FormGroup;
  public deleteConfirmationMessage = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private recruitmentService: RecruitmentService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initializeForm();
    this.loadPostingsPaging();
    this.loadApprovedRequisitions();
  }

  initializeForm(): void {
    this.postingForm = this.formBuilder.group({
      id: [null],
      manpowerRequisitionId: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      responsibilities: [''],
      requirements: [''],
      workLocation: [''],
      isRemote: [false],
      salaryRangeText: [''],
      publishChannels: [''],
      closingDate: [null],
      isActive: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPostingsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'Title', SortColumnDirection: 'asc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.recruitmentService.getAllJobPostingsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.postingList = res.result.items || [];
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else { this.postingList = []; this.totalRows = 0; this.pageCount = 0; }
      },
      error: (e) => this.handleError(e),
    });
  }

  loadApprovedRequisitions(): void {
    const filter: PagingSearchFilter = {
      SearchTerm: '', SortColumnName: '', SortColumnDirection: 'asc', PageNumber: 1, PageSize: 200,
    } as any;
    this.recruitmentService.getAllRequisitionsPagingWithSearch(filter as any).subscribe({
      next: (res: any) => {
        if (res?.success && res.result) {
          this.approvedRequisitions = (res.result.items || []).filter((r: any) => r.statusId === 3);
        }
      },
      error: () => {},
    });
  }

  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.postingForm.reset({ id: null, isRemote: false, isActive: true, createUpdateBy: this.appUserProfileId });
    this.viewMode = 'form';
  }

  editPosting(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.recruitmentService.getJobPostingById(row.id).subscribe({
      next: (res: any) => {
        if (res?.success && res.result) {
          const j = res.result;
          this.postingForm.patchValue({
            id: j.id, manpowerRequisitionId: j.manpowerRequisitionId, title: j.title,
            description: j.description, responsibilities: j.responsibilities, requirements: j.requirements,
            workLocation: j.workLocation, isRemote: j.isRemote, closingDate: j.closingDate, isActive: true,
            createUpdateBy: this.appUserProfileId,
          });
          this.viewMode = 'form';
        }
      },
      error: (e) => this.handleError(e),
    });
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  savePosting(): void {
    if (this.postingForm.invalid) {
      this.postingForm.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...this.postingForm.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.recruitmentService.createUpdateJobPosting(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) {
          this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list'; this.loadPostingsPaging();
        } else {
          this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
        }
      },
      error: (e) => this.handleError(e),
    });
  }

  publish(row: any): void {
    this.recruitmentService.publishJobPosting(row.id, this.appUserProfileId)
      .subscribe({ next: (r: any) => this.afterAction(r), error: (e) => this.handleError(e) });
  }
  close(row: any): void {
    this.recruitmentService.closeJobPosting(row.id, this.appUserProfileId)
      .subscribe({ next: (r: any) => this.afterAction(r), error: (e) => this.handleError(e) });
  }
  openPipeline(row: any): void {
    this.router.navigate(['/business/humanresources/recruitment/pipeline']);
  }

  private afterAction(res: any): void {
    if (res?.success) {
      this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
      this.loadPostingsPaging();
    } else {
      this.notifyService.showWarning(res?.message || 'Action failed', MessageConstants.GENERAL_WARNING_TITLE);
    }
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Draft: return 'badge badge-secondary';
      case this.STATUS.Published: return 'badge badge-success';
      case this.STATUS.Paused: return 'badge badge-warning';
      case this.STATUS.Closed: return 'badge badge-dark';
      case this.STATUS.Cancelled: return 'badge badge-danger';
      default: return 'badge badge-light';
    }
  }

  changePage(page: number): void { if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadPostingsPaging(); } }
  changePageSize(event: any): void { this.pageSize = +event.target.value; this.currentPage = 1; this.loadPostingsPaging(); }
  search(): void { this.currentPage = 1; this.loadPostingsPaging(); }
  updatePageIndices(): void { this.startPage = (this.currentPage - 1) * this.pageSize + 1; this.endPage = this.startPage - 1 + this.postingList.length; }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
