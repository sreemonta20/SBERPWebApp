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
  Department,
  DepartmentRequest,
  PagingSearchFilter,
} from '@app/core/interface/common';
import { isCommonErrorShow } from '@environments/environment';
import { ConfirmDialogComponent } from '@app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-department',
  standalone: false,
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css'],
})
export class DepartmentComponent implements OnInit, AfterViewInit {
  // Current user
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // View mode — 'list' shows the grid, 'form' shows the create/edit form
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
  public departmentList: Department[] = [];
  public parentDepartments: Department[] = [];
  public searchTerm: string = '';

  // Form
  public departmentForm!: FormGroup;
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
    this.loadDepartmentsPaging();
    this.loadParentDepartments();
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
    this.departmentForm = this.formBuilder.group({
      id: [null],
      departmentCode: ['', Validators.required],
      name: ['', Validators.required],
      description: [''],
      parentDepartmentId: [null],
      headEmployeeId: [null],
      isActive: [true],
      createUpdateBy: [this.appUserProfileId],
    });
  }

  // ============================================================
  // LOAD DATA
  // ============================================================
  loadDepartmentsPaging(): void {
    this.loadingService.setLoading(true);
    const filter: PagingSearchFilter = {
      SearchTerm: this.searchTerm,
      SortColumnName: 'Name',
      SortColumnDirection: 'asc',
      PageNumber: this.currentPage,
      PageSize: this.pageSize,
    };

    // Backend HR responses come back camelCase, so we read them that way.
    this.hrService.getAllDepartmentsPagingWithSearch(filter as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success && response.result) {
          this.departmentList = response.result.items || [];
          this.totalRows = response.result.rowCount || 0;
          this.pageCount = response.result.pageCount || 0;
          this.currentPage = response.result.currentPage || this.currentPage;
          this.updatePageIndices();
        } else {
          this.departmentList = [];
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

  /** Used to populate the Parent Department dropdown in the form. */
  loadParentDepartments(): void {
    this.hrService.getAllDepartments().subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.result)) {
          this.parentDepartments = response.result;
        }
      },
      error: () => {
        /* silent — dropdown is optional */
      },
    });
  }

  // ============================================================
  // VIEW TOGGLE / CRUD ACTIONS
  // ============================================================
  openCreateForm(): void {
    if (!this.isCreate) return;
    this.isEdit = false;
    this.departmentForm.reset({
      id: null,
      departmentCode: '',
      name: '',
      description: '',
      parentDepartmentId: null,
      headEmployeeId: null,
      isActive: true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  editDepartment(dept: Department): void {
    if (!this.isUpdate) return;
    this.isEdit = true;
    this.departmentForm.patchValue({
      id: dept.id,
      departmentCode: dept.departmentCode,
      name: dept.name,
      description: dept.description ?? '',
      parentDepartmentId: dept.parentDepartmentId ?? null,
      headEmployeeId: dept.headEmployeeId ?? null,
      isActive: dept.isActive ?? true,
      createUpdateBy: this.appUserProfileId,
    });
    this.viewMode = 'form';
  }

  cancelForm(): void {
    this.viewMode = 'list';
    this.isEdit = false;
  }

  saveDepartment(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      this.notifyService.showWarning(
        'Please fill the required fields',
        MessageConstants.GENERAL_WARNING_TITLE,
      );
      return;
    }

    const formValue = this.departmentForm.value;
    const request: DepartmentRequest = {
      actionName: this.isEdit ? 'Update' : 'Save',
      id: formValue.id || undefined,
      departmentCode: formValue.departmentCode,
      name: formValue.name,
      description: formValue.description,
      parentDepartmentId: formValue.parentDepartmentId || undefined,
      headEmployeeId: formValue.headEmployeeId || undefined,
      createUpdateBy: this.appUserProfileId,
      isActive: formValue.isActive,
    };

    this.loadingService.setLoading(true);
    this.hrService.createUpdateDepartment(request as any).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Department saved successfully',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.viewMode = 'list';
          this.loadDepartmentsPaging();
          this.loadParentDepartments();
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

  deleteDepartment(dept: Department): void {
    if (!this.isDelete || !dept?.id) return;
    this.pendingDeleteId = dept.id;
    this.deleteConfirmationMessage = `${dept.name} will be inactivated. Are you sure you want to remove this department?`;
    this.confirmDialog?.open();
  }

  executeDelete(): void {
    if (!this.pendingDeleteId) return;
    this.loadingService.setLoading(true);
    this.hrService.deleteDepartment(this.pendingDeleteId).subscribe({
      next: (response: any) => {
        this.loadingService.setLoading(false);
        if (response?.success) {
          this.notifyService.showSuccess(
            response.message || 'Department removed',
            MessageConstants.GENERAL_SUCCESS_TITLE,
          );
          this.loadDepartmentsPaging();
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
      this.loadDepartmentsPaging();
    }
  }

  changePageSize(event: any): void {
    this.pageSize = +event.target.value;
    this.currentPage = 1;
    this.loadDepartmentsPaging();
  }

  searchDepartments(): void {
    this.currentPage = 1;
    this.loadDepartmentsPaging();
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.departmentList.length;
  }
}
