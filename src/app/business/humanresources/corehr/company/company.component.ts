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
import { Company, CompanyRequest } from '@app/core/interface/common';
import { isCommonErrorShow } from '@environments/environment';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-company',
  standalone: false,
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css'],
})
export class CompanyComponent implements OnInit {
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

  public companyList: Company[] = [];
  public searchTerm: string = '';

  public companyForm!: FormGroup;
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
    this.loadCompaniesPaging();
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  initializeForm(): void {
    this.companyForm = this.formBuilder.group({
      id: [null],
      companyCode: ['', Validators.required],
      name: ['', Validators.required],
      legalName: [''],
      registrationNumber: [''],
      taxNumber: [''],
      address: [''],
      city: [''],
      country: [''],
      phone: [''],
      email: [''],
      website: [''],
      currencyCode: ['AED'],
      financialYearStartMonth: [1],
      isActive: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  loadCompaniesPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm,
      SortColumnName: 'Name',
      SortColumnDirection: 'asc',
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    this.hrService.getAllCompaniesPagingWithSearch(filter as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          this.companyList = response.result.items || [];
          this.totalRows = response.result.rowCount || 0;
          this.pageCount = response.result.pageCount || 0;
          this.currentPage = response.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else {
          this.companyList = [];
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
    this.companyForm.reset({
      id: null,
      companyCode: '',
      name: '',
      legalName: '',
      registrationNumber: '',
      taxNumber: '',
      address: '',
      city: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      currencyCode: 'AED',
      financialYearStartMonth: 1,
      isActive: true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  editCompany(c: Company): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.companyForm.patchValue({
      id: c.id,
      companyCode: c.companyCode,
      name: c.name,
      legalName: c.legalName ?? '',
      registrationNumber: c.registrationNumber ?? '',
      taxNumber: c.taxNumber ?? '',
      address: c.address ?? '',
      city: c.city ?? '',
      country: c.country ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      website: c.website ?? '',
      currencyCode: c.currencyCode ?? 'AED',
      financialYearStartMonth: c.financialYearStartMonth ?? 1,
      isActive: c.isActive ?? true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void {
    this.viewMode = 'list';
    this.isEdit = false;
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      this.notifyService.showWarning(
        'Please fill the required fields',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      return;
    }

    const formValue = this.companyForm.value;
    const request: CompanyRequest = {
      actionName: this.isEdit ? 'Update' : 'Save',
      id: formValue.id || undefined,
      companyCode: formValue.companyCode,
      name: formValue.name,
      legalName: formValue.legalName,
      registrationNumber: formValue.registrationNumber,
      taxNumber: formValue.taxNumber,
      address: formValue.address,
      city: formValue.city,
      country: formValue.country,
      phone: formValue.phone,
      email: formValue.email,
      website: formValue.website,
      currencyCode: formValue.currencyCode,
      financialYearStartMonth: formValue.financialYearStartMonth,
      createUpdateBy: this.appUserProfileId,
      isActive: formValue.isActive,
    };

    this.loadingService.setLoading(true);
    this.hrService.createUpdateCompany(request).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Company saved successfully',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.viewMode = 'list';
          this.loadCompaniesPaging();
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

  deleteCompany(c: Company): void {
    if (!this.isDelete || !c?.id) return;
    this.pendingDeleteId = c.id;
    this.deleteConfirmationMessage = `${c.name} will be inactivated. Are you sure you want to remove this company?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.hrService.deleteCompany(this.pendingDeleteId).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Company removed',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.loadCompaniesPaging();
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
      this.loadCompaniesPaging();
    }
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.loadCompaniesPaging();
  }

  searchCompanies(): void {
    this.currentPage = 1;
    this.loadCompaniesPaging();
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.companyList.length;
  }
}
