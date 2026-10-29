import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CommonService, LoaderService, NotificationService, HumanResourcesService,
} from '@app/core/services';
import { LeaveService } from '@app/core/services/leave.service';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/** Leave policies: entitlement per type/scope/year, plus a Grant action that
 *  seeds employee balances from the year's active policies. */
@Component({
  selector: 'app-leave-policy',
  standalone: false,
  templateUrl: './leave-policy.component.html',
  styleUrls: ['./leave-policy.component.css'],
})
export class LeavePolicyComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public leaveTypes: any[] = [];
  public departments: any[] = [];
  public searchTerm = '';
  public grantYear = new Date().getFullYear();

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  private grantPending = false;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private leaveService: LeaveService,
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
    this.loadLeaveTypes();
    this.loadDepartments();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      policyCode: ['', Validators.required],
      name: ['', Validators.required],
      leaveTypeId: ['', Validators.required],
      departmentId: [''],
      grade: [null],
      annualEntitlement: [0, Validators.required],
      minServiceMonths: [null],
      maxConsecutiveDays: [null],
      effectiveYear: [new Date().getFullYear(), Validators.required],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: 'PolicyCode', SortColumnDirection: 'asc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.leaveService.getAllLeavePoliciesPagingWithSearch(filter as any).subscribe({
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

  loadLeaveTypes(): void {
    this.leaveService.getLeaveTypesLookup().subscribe({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.leaveTypes = r.result; }, error: () => {},
    });
  }
  loadDepartments(): void {
    this.hrService.getAllDepartments?.().subscribe?.({
      next: (r: any) => { if (r?.success && Array.isArray(r.result)) this.departments = r.result; }, error: () => {},
    });
  }

  openCreateForm(): void { if (!this.isCreate) return; this.isEdit = false; this.initForm(); this.viewMode = 'form'; }

  edit(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.form.patchValue({
      id: row.id, policyCode: row.policyCode, name: row.name, leaveTypeId: row.leaveTypeId,
      departmentId: row.departmentId || '', grade: row.grade, annualEntitlement: row.annualEntitlement,
      minServiceMonths: row.minServiceMonths, maxConsecutiveDays: row.maxConsecutiveDays,
      effectiveYear: row.effectiveYear, createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
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
    this.leaveService.createUpdateLeavePolicy(request).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE); this.viewMode = 'list'; this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  remove(row: any): void {
    if (!this.isDelete || !row?.id) return;
    this.grantPending = false;
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Policy ${row.name} will be inactivated. Continue?`;
    this.confirmDialog?.open();
  }

  grant(): void {
    if (!this.isUpdate) return;
    this.grantPending = true;
    this.deleteConfirmationMessage = `Grant entitlements to all eligible employees for ${this.grantYear}? Existing balances for ${this.grantYear} will be refreshed.`;
    this.confirmDialog?.open();
  }

  confirmAction(): void {
    if (this.grantPending) { this.executeGrant(); return; }
    this.executeDelete();
  }

  executeGrant(): void {
    this.grantPending = false;
    this.loadingService.setLoading(true);
    this.leaveService.grantEntitlements({ year: this.grantYear, createUpdateBy: this.appUserProfileId }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE);
        else this.notifyService.showWarning(res?.message || 'Grant failed', MessageConstants.GENERAL_WARNING_TITLE);
      },
      error: (e) => this.handleError(e),
    });
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.leaveService.deleteLeavePolicy(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message || 'Removed', MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else this.notifyService.showWarning(res?.message || 'Remove failed', MessageConstants.GENERAL_WARNING_TITLE);
        this.pendingDeleteId = '';
      },
      error: (e) => { this.handleError(e); this.pendingDeleteId = ''; },
    });
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
