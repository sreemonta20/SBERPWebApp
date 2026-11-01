import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, LoaderService, NotificationService } from '@app/core/services';
import { PerformanceService } from '@app/core/services/performance.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

/** Appraisal cycles: the review period + workflow + "initiate reviews" action
 *  that fans out a review per employee with goals in the cycle. */
@Component({
  selector: 'app-appraisal-cycle',
  standalone: false,
  templateUrl: './appraisal-cycle.component.html',
  styleUrls: ['./appraisal-cycle.component.css'],
})
export class AppraisalCycleComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public searchTerm = '';
  public readonly STATUS = { Draft: 1, Active: 2, Closed: 3 };

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  private pendingAction: { id: string; status?: number; initiate?: boolean } | null = null;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private performanceService: PerformanceService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initForm();
    this.loadPaging();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      cycleCode: ['', Validators.required],
      name: ['', Validators.required],
      periodStart: [null, Validators.required],
      periodEnd: [null, Validators.required],
      goalDueDate: [null],
      reviewDueDate: [null],
      ratingScaleMax: [5, Validators.required],
      description: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.performanceService.getAllAppraisalCyclesPagingWithSearch(filter as any).subscribe({
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

  openCreateForm(): void { if (!this.isCreate) return; this.isEdit = false; this.initForm(); this.viewMode = 'form'; }

  edit(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.form.patchValue({
      id: row.id, cycleCode: row.cycleCode, name: row.name,
      periodStart: this.toDateInput(row.periodStart), periodEnd: this.toDateInput(row.periodEnd),
      goalDueDate: this.toDateInput(row.goalDueDate), reviewDueDate: this.toDateInput(row.reviewDueDate),
      ratingScaleMax: row.ratingScaleMax, createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  private toDateInput(v: any): string | null {
    if (!v) return null;
    const d = new Date(v); return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const request = { actionName: this.isEdit ? 'Update' : 'Save', ...this.form.value, createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.performanceService.createUpdateAppraisalCycle(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.viewMode = 'list'; this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  activate(row: any): void { this.confirmAction({ id: row.id, status: this.STATUS.Active }, `Activate cycle ${row.cycleCode}?`); }
  closeCycle(row: any): void { this.confirmAction({ id: row.id, status: this.STATUS.Closed }, `Close cycle ${row.cycleCode}? Goals can no longer change.`); }
  initiate(row: any): void { this.confirmAction({ id: row.id, initiate: true }, `Initiate reviews for ${row.cycleCode}? One review per employee with goals in this cycle.`); }

  private confirmAction(action: { id: string; status?: number; initiate?: boolean }, msg: string): void {
    if (!this.isUpdate) return;
    this.pendingAction = action; this.pendingDeleteId = '';
    this.deleteConfirmationMessage = msg;
    this.confirmDialog?.open();
  }

  remove(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingAction = null; this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Cycle ${row.cycleCode} will be inactivated. Continue?`;
    this.confirmDialog?.open();
  }

  confirmDialogYes(): void {
    if (this.pendingDeleteId) { this.executeDelete(); return; }
    if (!this.pendingAction) return;
    const a = this.pendingAction;
    this.loadingService.setLoading(true);
    const obs = a.initiate
      ? this.performanceService.initiateReviews({ cycleId: a.id, createUpdateBy: this.appUserProfileId })
      : this.performanceService.setAppraisalCycleStatus({ id: a.id, statusId: a.status, createUpdateBy: this.appUserProfileId });
    obs.subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingAction = null;
      },
      error: (e) => { this.handleError(e); this.pendingAction = null; },
    });
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.performanceService.deleteAppraisalCycle(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Draft: return 'badge badge-secondary';
      case this.STATUS.Active: return 'badge badge-success';
      case this.STATUS.Closed: return 'badge badge-dark';
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
