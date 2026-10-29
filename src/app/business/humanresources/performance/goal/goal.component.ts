import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { PerformanceService } from '@app/core/services/performance.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/** Per-employee goals within an appraisal cycle, weighted, with progress. */
@Component({
  selector: 'app-goal',
  standalone: false,
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.css'],
})
export class GoalComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public cycles: any[] = [];
  public employees: any[] = [];
  public searchTerm = '';
  public readonly STATUS = { Draft: 1, Active: 2, Completed: 3, Cancelled: 4 };

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private performanceService: PerformanceService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((u: User) => (this.appUserProfileId = u?.Id || ''));
    const p = this.commonService.getMenuPermission(this.router.url);
    this.isView = p.IsView; this.isCreate = p.IsCreate; this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
    this.initForm();
    this.loadPaging();
    this.loadCycles();
    this.loadEmployees();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      appraisalCycleId: ['', Validators.required],
      employeeId: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      weight: [0, Validators.required],
      targetValue: [''],
      progressPercent: [0],
      statusId: [2],
      startDate: [null],
      dueDate: [null],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'desc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.performanceService.getAllGoalsPagingWithSearch(filter as any).subscribe({
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

  loadCycles(): void {
    this.performanceService.getAppraisalCyclesLookup().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.cycles = r.result; }, error: () => {},
    });
  }
  loadEmployees(): void {
    this.hrService.getAllEmployees?.().subscribe?.({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.employees = r.result; }, error: () => {},
    });
  }

  openCreateForm(): void { if (!this.isCreate) return; this.isEdit = false; this.initForm(); this.viewMode = 'form'; }

  edit(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.form.patchValue({
      id: row.id, appraisalCycleId: row.appraisalCycleId, employeeId: row.employeeId, title: row.title,
      description: row.description, weight: row.weight, targetValue: row.targetValue,
      progressPercent: row.progressPercent, statusId: row.statusId,
      startDate: this.toDateInput(row.startDate), dueDate: this.toDateInput(row.dueDate),
      createUpdateBy: this.appUserProfileId,
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
    this.performanceService.createUpdateGoal(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.viewMode = 'list'; this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  // inline progress bump from the list
  bumpProgress(row: any, value: number): void {
    if (!this.isUpdate) return;
    const statusId = value >= 100 ? this.STATUS.Completed : this.STATUS.Active;
    this.performanceService.updateGoalProgress({ id: row.id, progressPercent: value, statusId, createUpdateBy: this.appUserProfileId }).subscribe({
      next: (res: any) => {
        if (res?.success) { this.notifyService.showSuccess('Progress updated', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Update failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  remove(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Goal "${row.title}" will be inactivated. Continue?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.performanceService.deleteGoal(this.pendingDeleteId).subscribe({
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
      case this.STATUS.Active: return 'badge badge-primary';
      case this.STATUS.Completed: return 'badge badge-success';
      case this.STATUS.Cancelled: return 'badge badge-danger';
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
