import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService, LoaderService, NotificationService } from '@app/core/services';
import { CostCenterService, CompanyService, BranchService } from '@app/core/services/orgsetup.services';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';
import { PagingSearchFilter } from '@app/core/interface/common';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cost-center',
  standalone: false,
  templateUrl: './cost-center.component.html',
  styleUrls: ['./cost-center.component.css'],
})
export class CostCenterComponent implements OnInit {
  public appUserProfileId = '';
  public isView = false; public isCreate = false; public isUpdate = false; public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit = false;

  public totalRows = 0; public currentPage = 1; public pageSize = 10;
  public pageCount = 0; public startPage = 1; public endPage = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public list: any[] = [];
  public companies: any[] = [];
  public branches: any[] = [];
  public searchTerm = '';

  public form!: FormGroup;
  public deleteConfirmationMessage = '';
  private pendingDeleteId = '';
  public error_message: any;
  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private service: CostCenterService,
    private companyService: CompanyService,
    private branchService: BranchService,
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
      name: ['', Validators.required],
      companyId: [null],
      branchId: [null],
      parentCostCenterId: [null],
      ownerEmployeeId: [null],
      description: [''],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadLookups(): void {
    const f: any = { SearchTerm: '', SortColumnName: '', SortColumnDirection: 'asc', PageNumber: 1, PageSize: 500 };
    this.companyService.getAllPaging(f).subscribe({ next: (r: any) => { if (r?.success) this.companies = r.result?.items || []; } });
    this.branchService.getAllPaging(f).subscribe({ next: (r: any) => { if (r?.success) this.branches = r.result?.items || []; } });
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
    this.form.patchValue({ ...row, createUpdateBy: this.appUserProfileId });
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
        if (res?.success) {
          this.notifyService.showSuccess(res.message || MessageConstants.GENERAL_SUCCESS_TITLE, MessageConstants.GENERAL_SUCCESS_TITLE);
          this.backToList();
        } else { this.notifyService.showWarning(res?.message || MessageConstants.GENERAL_WARNING_TITLE, MessageConstants.GENERAL_WARNING_TITLE); }
      },
      error: (err) => { this.loadingService.setLoading(false); this.handleError(err); },
    });
  }

  confirmDelete(row: any): void {
    this.pendingDeleteId = row.id;
    this.deleteConfirmationMessage = `Delete cost center "${row.name}"?`;
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

  private handleError(err: any): void {
    this.error_message = err;
    if (isCommonErrorShow) this.notifyService.showError(MessageConstants.INTERNAL_ERROR_MEG, MessageConstants.GENERAL_ERROR_TITLE);
  }
}
