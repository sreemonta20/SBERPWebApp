import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import {
  Designation,
  DesignationRequest,
  PagingSearchFilter,
} from '@app/core/interface/common';
import { isCommonErrorShow } from '@environments/environment';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-designation',
  standalone: false,
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css'],
})
export class DesignationComponent implements OnInit, AfterViewInit {
  // Current user
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // View mode
  public viewMode: 'list' | 'form' = 'list';
  public isEdit: boolean = false;

  // Pagination
  public totalRows: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public pageCount: number = 0;
  public startPage: number = 1;
  public endPage: number = 0;
  public pageSizeList: number[] = this.commonService.pageSize();

  // Data
  public designationList: Designation[] = [];
  public searchTerm: string = '';

  // Form
  public designationForm!: FormGroup;
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
    this.loadDesignationsPaging();
  }

  ngAfterViewInit(): void {}

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  // ============================================================
  // FORM SETUP
  // ============================================================
  initializeForm(): void {
    this.designationForm = this.formBuilder.group({
      id: [null],
      name: ['', Validators.required],
      code: [''],
      description: [''],
      grade: [null],
      isActive: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  loadDesignationsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm,
      SortColumnName: 'Name',
      SortColumnDirection: 'asc',
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    this.hrService.getAllDesignationsPagingWithSearch(filter as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          this.designationList = response.result.items || [];
          this.totalRows = response.result.rowCount || 0;
          this.pageCount = response.result.pageCount || 0;
          this.currentPage = response.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else {
          this.designationList = [];
          this.totalRows = 0;
          this.pageCount = 0;
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error?.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  // ============================================================
  // VIEW TOGGLE / CRUD ACTIONS
  // ============================================================
  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.designationForm.reset({
      id: null,
      name: '',
      code: '',
      description: '',
      grade: null,
      isActive: true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  editDesignation(d: Designation): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.designationForm.patchValue({
      id: d.id,
      name: d.name,
      code: d.code ?? '',
      description: d.description ?? '',
      grade: d.grade ?? null,
      isActive: d.isActive ?? true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void {
    this.viewMode = 'list';
    this.isEdit = false;
  }

  saveDesignation(): void {
    if (this.designationForm.invalid) {
      this.designationForm.markAllAsTouched();
      this.notifyService.showWarning(
        'Please fill the required fields',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      return;
    }

    const v = this.designationForm.value;
    const request: DesignationRequest = {
      actionName: this.isEdit ? 'Update' : 'Save',
      id: v.id || undefined,
      name: v.name,
      code: v.code,
      description: v.description,
      grade: v.grade != null ? +v.grade : undefined,
      createUpdateBy: this.appUserProfileId,
      isActive: v.isActive,
    };

    this.loadingService.setLoading(true);
    this.hrService.createUpdateDesignation(request as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Designation saved',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.viewMode = 'list';
          this.loadDesignationsPaging();
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
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
      },
    });
  }

  deleteDesignation(d: Designation): void {
    if (!this.isDelete || !d?.id) return;
    this.pendingDeleteId = d.id;
    this.deleteConfirmationMessage = `${d.name} will be inactivated. Are you sure you want to remove this designation?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.hrService.deleteDesignation(this.pendingDeleteId).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Designation removed',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.loadDesignationsPaging();
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
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE,
        );
        this.pendingDeleteId = '';
      },
    });
  }

  // ============================================================
  // PAGINATION
  // ============================================================
  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount) {
      this.currentPage = page;
      this.loadDesignationsPaging();
    }
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.loadDesignationsPaging();
  }

  searchDesignations(): void {
    this.currentPage = 1;
    this.loadDesignationsPaging();
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.designationList.length;
  }
}
