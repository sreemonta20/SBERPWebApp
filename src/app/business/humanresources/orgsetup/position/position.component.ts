import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, LoaderService, NotificationService, HumanResourcesService } from '@app/core/services';
import {
  PositionService, CompanyService, BranchService, CostCenterService, JobGradeService,
} from '@app/core/services/orgsetup.services';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Positions — the budgeted SEAT. Full CRUD plus headcount controls (assign/release
 * flips Open<->Filled via SP_SetPositionFill), manual status changes, and a
 * position-to-position org tree. Recruitment hires against a Position; Onboarding
 * assigns (+1) and Separation releases (-1).
 */
@Component({
  selector: 'app-position',
  standalone: false,
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.css'],
})
export class PositionComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' | 'tree' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public searchTerm = '';

  // lookups
  public companies: any[] = [];
  public branches: any[] = [];
  public costCenters: any[] = [];
  public grades: any[] = [];
  public departments: any[] = [];
  public designations: any[] = [];
  public positions: any[] = [];   // for reports-to

  public readonly STATUS = { Draft: 1, Open: 2, Filled: 3, OnHold: 4, Closed: 5 };
  public statusList = [
    { id: 1, name: 'Draft' }, { id: 2, name: 'Open' }, { id: 3, name: 'Filled' },
    { id: 4, name: 'On Hold' }, { id: 5, name: 'Closed' },
  ];

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  private pendingAction: { kind: 'fill' | 'status'; id: string; delta?: number; statusId?: number } | null = null;
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  // tree
  public treeFlat: any[] = [];

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private service: PositionService,
    private companyService: CompanyService,
    private branchService: BranchService,
    private costCenterService: CostCenterService,
    private jobGradeService: JobGradeService,
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
    this.loadLookups();
    this.loadPaging();
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      id: [null],
      title: ['', Validators.required],
      designationId: [null],
      companyId: [null],
      branchId: [null],
      costCenterId: [null],
      jobGradeId: [null],
      departmentId: [null],
      reportsToPositionId: [null],
      budgetedHeadcount: [1, [Validators.required, Validators.min(1)]],
      effectiveFrom: [null],
      effectiveTo: [null],
      description: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadLookups(): void {
    const f: any = { SearchTerm: '', SortColumnName: '', SortColumnDirection: 'asc', PageNumber: 1, PageSize: 500 };
    this.companyService.getAllPaging(f).subscribe({ next: (r: any) => { if (r?.success) this.companies = r.result?.items || []; } });
    this.branchService.getAllPaging(f).subscribe({ next: (r: any) => { if (r?.success) this.branches = r.result?.items || []; } });
    this.costCenterService.getAllPaging(f).subscribe({ next: (r: any) => { if (r?.success) this.costCenters = r.result?.items || []; } });
    this.jobGradeService.getAllPaging(f).subscribe({ next: (r: any) => { if (r?.success) this.grades = r.result?.items || []; } });
    // departments + designations come from Core HR (existing HumanResourcesService helpers)
    if ((this.hrService as any).getAllDepartments) {
      (this.hrService as any).getAllDepartments().subscribe({ next: (r: any) => { this.departments = r?.result || r || []; } });
    }
    if ((this.hrService as any).getAllDesignations) {
      (this.hrService as any).getAllDesignations().subscribe({ next: (r: any) => { this.designations = r?.result || r || []; } });
    }
  }

  loadPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm, SortColumnName: '', SortColumnDirection: 'asc',
      PageNumber: this.currentPage, PageSize: this.pageSize,
    } as any;
    this.service.getAllPaging(filter as any).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success && res.result) {
          this.list = res.result.items || [];
          this.positions = this.list;
          this.totalRows = res.result.rowCount || 0;
          this.pageCount = res.result.pageCount || 0;
          this.currentPage = res.result.currentPage || 1;
          this.buildPager();
        } else { this.list = []; this.totalRows = 0; }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  buildPager(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = Math.min(this.currentPage * this.pageSize, this.totalRows);
  }

  onSearch(): void { this.currentPage = 1; this.loadPaging(); }
  onPageChange(page: number): void { if (page < 1 || page > this.pageCount) return; this.currentPage = page; this.loadPaging(); }
  onPageSizeChange(): void { this.currentPage = 1; this.loadPaging(); }

  openCreate(): void { this.isEdit = false; this.initForm(); this.viewMode = 'form'; }
  openEdit(row: any): void {
    this.isEdit = true;
    this.form.patchValue({
      ...row,
      effectiveFrom: row.effectiveFrom ? row.effectiveFrom.substring(0, 10) : null,
      effectiveTo: row.effectiveTo ? row.effectiveTo.substring(0, 10) : null,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }
  backToList(): void { this.viewMode = 'list'; this.loadPaging(); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const payload = { ...this.form.value, actionName: this.isEdit ? 'Update' : 'Save', createUpdateBy: this.appUserProfileId };
    this.loadingService.setLoading(true);
    this.service.createUpdate(payload).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.backToList(); }
        else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  // ---- headcount ----
  assign(row: any): void { this.doFill(row.id, 1); }
  release(row: any): void { this.doFill(row.id, -1); }
  private doFill(id: string, delta: number): void {
    this.loadingService.setLoading(true);
    this.service.setFill({ positionId: id, delta, createUpdateBy: this.appUserProfileId }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  // ---- status ----
  changeStatus(row: any, statusId: number): void {
    this.loadingService.setLoading(true);
    this.service.setStatus({ id: row.id, statusId, createUpdateBy: this.appUserProfileId }).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Filled: return 'badge-success';
      case this.STATUS.Open: return 'badge-primary';
      case this.STATUS.OnHold: return 'badge-warning';
      case this.STATUS.Closed: return 'badge-secondary';
      default: return 'badge-light';
    }
  }

  confirmDelete(row: any): void {
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Close and remove position "${row.title}" (${row.positionCode})?`;
    this.confirmDialog.open();
  }
  onDeleteConfirmed(): void {
    this.loadingService.setLoading(true);
    this.service.delete(this.pendingDeleteId).subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        if (res?.success) { this.notifyService.showSuccess(res.message, MessageConstants.GENERAL_SUCCESS_TITLE); this.loadPaging(); }
        else { this.notifyService.showWarning(res?.message, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  // ---- org tree ----
  openTree(): void {
    this.viewMode = 'tree';
    this.loadingService.setLoading(true);
    this.service.getOrgTree().subscribe({
      next: (res: any) => {
        this.loadingService.setLoading(false);
        this.treeFlat = res?.success ? (res.result || []) : [];
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }
  indent(depth: number): string { return '&nbsp;'.repeat(depth * 4); }

  private handleError(err: any): void {
    this.error_message = err;
    if (isCommonErrorShow) this.notifyService.showError(MessageConstants.INTERNAL_ERROR_MEG, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
