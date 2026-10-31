import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import {
  CommonService,
  LoaderService,
  NotificationService,
  HumanResourcesService,
} from '@app/core/services';

import { PagingSearchFilter } from '@app/core/interface/common';
import { Branch, Company, BranchRequest } from '@app/core/interface/common';
import { isCommonErrorShow } from '@environments/environment';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-branch',
  standalone: false,
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.css'],
})
export class BranchComponent implements OnInit {
  public appUserProfileId: string = '';

  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  public viewMode: 'list' | 'form' = 'list';
  public isEdit: boolean = false;

  public totalRows: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public pageCount: number = 0;
  public startPage: number = 1;
  public endPage: number = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  public branchList: Branch[] = [];
  public companies: Company[] = [];
  public searchTerm: string = '';

  public branchForm!: FormGroup;
  public deleteConfirmationMessage: string = '';
  private pendingDeleteId: string = '';
  public error_message: any;

  @ViewChild('confirmDialog') confirmDialog!: ConfirmDialogComponent;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
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
    this.loadBranchesPaging();
    this.loadCompanies();
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  initializeForm(): void {
    this.branchForm = this.formBuilder.group({
      id: [null],
      companyId: [null, Validators.required],
      branchCode: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      city: [''],
      country: [''],
      phone: [''],
      email: [''],
      isHeadOffice: [false],
      isActive: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  /** Used to populate the Company dropdown in the form. */
  loadCompanies(): void {
    this.hrService.getAllCompanies().subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.result)) {
          this.companies = response.result;
        }
      },
      error: () => {
        /* silent — dropdown is optional */
      },
    });
  }

  loadBranchesPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm,
      SortColumnName: 'Name',
      SortColumnDirection: 'asc',
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    this.hrService.getAllBranchesPagingWithSearch(filter as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          this.branchList = response.result.items || [];
          this.totalRows = response.result.rowCount || 0;
          this.pageCount = response.result.pageCount || 0;
          this.currentPage = response.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else {
          this.branchList = [];
          this.totalRows = 0;
          this.pageCount = 0;
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.branchForm.reset({
      id: null,
      companyId: this.companies[0]?.id ?? null,
      branchCode: '',
      name: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      isHeadOffice: false,
      isActive: true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  editBranch(b: Branch): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.branchForm.patchValue({
      id: b.id,
      companyId: b.companyId,
      branchCode: b.branchCode,
      name: b.name,
      address: b.address ?? '',
      city: b.city ?? '',
      country: b.country ?? '',
      phone: b.phone ?? '',
      email: b.email ?? '',
      isHeadOffice: b.isHeadOffice ?? false,
      isActive: b.isActive ?? true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void {
    this.viewMode = 'list';
    this.isEdit = false;
  }

  saveBranch(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      this.notifyService.showWarning(
        'Please fill the required fields',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      return;
    }

    const formValue = this.branchForm.value;
    const request: BranchRequest = {
      actionName: this.isEdit ? 'Update' : 'Save',
      id: formValue.id || undefined,
      companyId: formValue.companyId,
      branchCode: formValue.branchCode,
      name: formValue.name,
      address: formValue.address,
      city: formValue.city,
      country: formValue.country,
      phone: formValue.phone,
      email: formValue.email,
      isHeadOffice: formValue.isHeadOffice,
      createUpdateBy: this.appUserProfileId,
      isActive: formValue.isActive,
    };

    this.loadingService.setLoading(true);
    this.hrService.createUpdateBranch(request).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Branch saved successfully',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.viewMode = 'list';
          this.loadBranchesPaging();
        } else {
          this.notifyService.showWarning(
            response?.message || 'Save failed',
            MessageConstants.GENERAL_WARNING_TITLE,
          );
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  deleteBranch(b: Branch): void {
    if (!this.isDelete || !b?.id) return;
    this.pendingDeleteId = b.id;
    this.deleteConfirmationMessage = `${b.name} will be inactivated. Are you sure you want to remove this branch?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.hrService.deleteBranch(this.pendingDeleteId).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Branch removed',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.loadBranchesPaging();
        } else {
          this.notifyService.showWarning(
            response?.message || 'Remove failed',
            MessageConstants.GENERAL_WARNING_TITLE,
          );
        }
        this.pendingDeleteId = '';
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow ? MessageConstants.INTERNAL_ERROR_MEG : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
        this.pendingDeleteId = '';
      },
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount) {
      this.currentPage = page;
      this.loadBranchesPaging();
    }
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.loadBranchesPaging();
  }

  searchBranches(): void {
    this.currentPage = 1;
    this.loadBranchesPaging();
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.branchList.length;
  }
}
