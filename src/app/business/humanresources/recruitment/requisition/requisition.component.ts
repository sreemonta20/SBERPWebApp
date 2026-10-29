import {
  Component, OnInit, AfterViewInit, ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HumanResourcesService } from '@app/core/services';
import { RecruitmentService } from '@app/core/services/recruitment.service';
import {
  NotificationService, LoaderService, CommonService,
} from '@app/core/services';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

/**
 * Manpower Requisition screen. Same shape as DepartmentComponent:
 * viewMode list/form toggle, permission gating, JSON paging, camelCase reads.
 * Adds the Submit/Approve/Reject workflow buttons driven by statusId.
 */
@Component({
  selector: 'app-requisition',
  standalone: false,
  templateUrl: './requisition.component.html',
  styleUrls: ['./requisition.component.css'],
})
export class RequisitionComponent implements OnInit, AfterViewInit {
  public appUserProfileId = '';

  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  // pagination
  public totalRows = 0;
  public currentPage = 1;
  public pageSize = 10;
  public pageCount = 0;
  public startPage = 1;
  public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  // data
  public requisitionList: any[] = [];
  public positions: any[] = [];
  public searchTerm = '';

  // requisition status enum (mirror of EnumRequisitionStatus)
  public readonly STATUS = { Draft: 1, Pending: 2, Approved: 3, Rejected: 4, OnHold: 5, Closed: 6, Filled: 7 };

  public requisitionForm!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingActionId = '';
  public error_message: any;

  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private recruitmentService: RecruitmentService,
    private hrService: HumanResourcesService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((user: User) => {
      this.appUserProfileId = user?.Id || '';
    });
    this.loadPermission(this.router.url);
    this.initializeForm();
    this.loadRequisitionsPaging();
    this.loadPositions();
  }

  ngAfterViewInit(): void {}

  loadPermission(url: any): void {
    const p = this.commonService.getMenuPermission(url);
    this.isView = p.IsView; this.isCreate = p.IsCreate;
    this.isUpdate = p.IsUpdate; this.isDelete = p.IsDelete;
  }

  initializeForm(): void {
    this.requisitionForm = this.formBuilder.group({
      id: [null],
      positionId: ['', Validators.required],
      departmentId: [null],
      designationId: [null],
      numberOfVacancies: [1, [Validators.required, Validators.min(1)]],
      justification: [''],
      isReplacement: [false],
      replacingEmployeeId: [null],
      requiredByDate: [null],
      minExperienceYears: [null],
      requiredQualification: [''],
      budgetMin: [null],
      budgetMax: [null],
      isActive: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  // ---------- load ----------
  loadRequisitionsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm,
      SortColumnName: 'RequisitionCode',
      SortColumnDirection: 'asc',
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    } as any;

    this.recruitmentService.getAllRequisitionsPagingWithSearch(filter as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          this.requisitionList = response.result.items || [];
          this.totalRows = response.result.rowCount || 0;
          this.pageCount = response.result.pageCount || 0;
          this.currentPage = response.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else {
          this.requisitionList = []; this.totalRows = 0; this.pageCount = 0;
        }
      },
      error: (error) => this.handleError(error),
    });
  }

  loadPositions(): void {
    this.recruitmentService.getAllPositions().subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.result)) this.positions = response.result;
      },
      error: () => {},
    });
  }

  // ---------- view toggle ----------
  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.requisitionForm.reset({
      id: null, numberOfVacancies: 1, isReplacement: false, isActive: true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  editRequisition(row: any): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.recruitmentService.getRequisitionById(row.id).subscribe({
      next: (response: any) => {
        if (response?.success && response.result) {
          const r = response.result;
          this.requisitionForm.patchValue({
            id: r.id, positionId: r.positionId, numberOfVacancies: r.numberOfVacancies,
            justification: r.justification, requiredByDate: r.requiredByDate, isActive: true,
            createUpdateBy: this.appUserProfileId,
          });
          this.viewMode = 'form';
        }
      },
      error: (error) => this.handleError(error),
    });
  }

  cancelForm(): void { this.viewMode = 'list'; this.isEdit = false; }

  // ---------- save ----------
  saveRequisition(): void {
    if (this.requisitionForm.invalid) {
      this.requisitionForm.markAllAsTouched();
      this.notifyService.showWarning('Please fill the required fields', MessageConstants.GENERAL_WARNING_TITLE);
      return;
    }
    const v = this.requisitionForm.value;
    const request = {
      actionName: this.isEdit ? 'Update' : 'Save',
      id: v.id || undefined,
      positionId: v.positionId,
      departmentId: v.departmentId || undefined,
      designationId: v.designationId || undefined,
      numberOfVacancies: v.numberOfVacancies,
      justification: v.justification,
      isReplacement: v.isReplacement,
      replacingEmployeeId: v.replacingEmployeeId || undefined,
      requiredByDate: v.requiredByDate,
      minExperienceYears: v.minExperienceYears,
      requiredQualification: v.requiredQualification,
      budgetMin: v.budgetMin,
      budgetMax: v.budgetMax,
      createUpdateBy: this.appUserProfileId,
      isActive: v.isActive,
    };

    this.loadingService.setLoading(true);
    this.recruitmentService.createUpdateRequisition(request).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(response.message || 'Saved', MessageConstants.GENERAL_SUCCESS_TITLE);
          this.viewMode = 'list';
          this.loadRequisitionsPaging();
        } else {
          this.notifyService.showWarning(response?.message || 'Save failed', MessageConstants.GENERAL_WARNING_TITLE);
        }
      },
      error: (error) => this.handleError(error),
    });
  }

  // ---------- workflow ----------
  submit(row: any): void {
    this.recruitmentService.submitRequisition({ id: row.id, createUpdateBy: this.appUserProfileId })
      .subscribe({ next: (r: any) => this.afterAction(r), error: (e) => this.handleError(e) });
  }
  approve(row: any): void {
    this.recruitmentService.approveRequisition({
      id: row.id, approvedById: this.appUserProfileId,
      approvalRemark: 'Approved', createUpdateBy: this.appUserProfileId,
    }).subscribe({ next: (r: any) => this.afterAction(r), error: (e) => this.handleError(e) });
  }
  reject(row: any): void {
    this.recruitmentService.rejectRequisition({
      id: row.id, approvedById: this.appUserProfileId,
      approvalRemark: 'Rejected', createUpdateBy: this.appUserProfileId,
    }).subscribe({ next: (r: any) => this.afterAction(r), error: (e) => this.handleError(e) });
  }

  private afterAction(response: any): void {
    if (response?.success) {
      this.notifyService.showSuccess(response.message, MessageConstants.GENERAL_SUCCESS_TITLE);
      this.loadRequisitionsPaging();
    } else {
      this.notifyService.showWarning(response?.message || 'Action failed', MessageConstants.GENERAL_WARNING_TITLE);
    }
  }

  statusBadgeClass(statusId: number): string {
    switch (statusId) {
      case this.STATUS.Draft: return 'badge badge-secondary';
      case this.STATUS.Pending: return 'badge badge-warning';
      case this.STATUS.Approved: return 'badge badge-success';
      case this.STATUS.Rejected: return 'badge badge-danger';
      case this.STATUS.Filled: return 'badge badge-info';
      default: return 'badge badge-light';
    }
  }

  // ---------- pagination ----------
  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount) { this.currentPage = page; this.loadRequisitionsPaging(); }
  }
  changePageSize(event: any): void {
    this.pageSize = +event.target.value; this.currentPage = 1; this.loadRequisitionsPaging();
  }
  search(): void { this.currentPage = 1; this.loadRequisitionsPaging(); }
  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.requisitionList.length;
  }

  private handleError(error: any): void {
    this.loadingService.setLoading(false);
    this.error_message = error?.error;
    this.notifyService.showError(
      isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message,
      MessageConstants.GENERAL_ERROR_TITLE,
    );
  }
}
