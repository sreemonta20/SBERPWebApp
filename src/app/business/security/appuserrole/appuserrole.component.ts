// import { AppUserRole } from './../../../core/class/models/app.user.role';
import { DOCUMENT, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  AppUserRoleResponse,
  CustomValidators,
  DataResponse,
  RoleSaveUpdateRequest,
} from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import { MenuItem } from '@app/core/interface';
import {
  CommonService,
  LoaderService,
  NotificationService,
  SecurityService,
} from '@app/core/services';
declare var $: any;
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-appuserrole',
  standalone: false,
  templateUrl: './appuserrole.component.html',
  styleUrls: ['./appuserrole.component.css'],
})
export class AppUserRoleComponent implements OnInit, AfterViewInit, OnDestroy {
  // Current User
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;

  //Pagination
  public totalRows: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 5;
  public pageCount: number = 0;
  public startPage: number = 1;
  public endPage: number = 5;
  public pageSizeList: number[] = this.commonService.pageSize();

  // Form Details
  public appUserRoleForm: FormGroup;
  public isEdit: boolean = false;
  public menuSubscription: Subscription;

  // Response related
  public appUserRoleList: AppUserRoleResponse[] = [];
  public error_message: any;
  
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private renderer: Renderer2,
    private loadingService: LoaderService,
    private notifyService: NotificationService,
    private commonService: CommonService,
    private securityService: SecurityService,
    private formBuilder: FormBuilder,
    private titleService: Title
  ) {
    this.appUserProfileId = this.commonService.GetLoggedInUser().user.Id;
    this.loadPermission(this.router.url);
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.APP_USER_ROLE_TITLE);
    this.createForm();
    this.getAllAppUserRolesPagination(this.currentPage, this.pageSize);
  }

  ngAfterViewInit() {
    // this.loadScripts(['assets/js/adminlte.js']);
  }

  loadPermission(url: any): void {
    console.log("Execution from Home");
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  createForm() {
    //ActionName: ['Save', Validators.required],
    this.appUserRoleForm = this.formBuilder.group({
      Id: [null],
      RoleName: [
        '',
        [Validators.required, CustomValidators.englishText(1, 50)],
      ], // English text validator
      Description: [
        '',
        [Validators.required, CustomValidators.englishText(1, 100)],
      ], // English text validator
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });
  }
  ///----------------------------------------------List & Pagination Starts----------------------------------------------
  getAllAppUserRolesPagination(pageNumber: number, pageSize: number) {
    this.loadingService.setLoading(true);
    this.securityService
      .getAllAppUserRolesPagination(pageNumber, pageSize)
      .subscribe({
        next: (response: DataResponse) => {
          debugger
          if (response.ResponseCode === 200) {
            this.loadingService.setLoading(false);
            this.appUserRoleList = response.Result.Items;
            this.currentPage = response.Result.CurrentPage;
            this.pageCount = response.Result.PageCount;
            this.totalRows = response.Result.RowCount;
            this.updatePageIndices();
          } else {
            this.loadingService.setLoading(false);
            this.notifyService.showError(
              MessageConstants.APP_USER_ROLE_NOT_FOUND_MEG,
              MessageConstants.GENERAL_ERROR_TITLE
            );
            return;
          }
        },
        error: (error) => {
          debugger
          this.loadingService.setLoading(false);
          this.error_message = error.error;
          this.notifyService.showError(
            MessageConstants.INTERNAL_ERROR_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
          return;
        },
      });
  }

  changePageSize(event: any): void {
    // this.pageSize = +event.target.value;
    this.currentPage = 1; // Reset to first page whenever page size changes
    this.getAllAppUserRolesPagination(this.currentPage, this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount) {
      this.getAllAppUserRolesPagination(page, this.pageSize);
    }
  }

  updatePageIndices(): void {
    this.startPage = (this.currentPage - 1) * this.pageSize + 1;
    this.endPage = this.startPage - 1 + this.appUserRoleList.length;
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }
  ///----------------------------------------------List & Pagination Ends----------------------------------------------

  ///----------------------------------------------Create, Update, and Delete Starts-----------------------------------
  createUpdateAppUserRole(appUserRole): void {
    let roleRequest: RoleSaveUpdateRequest = new RoleSaveUpdateRequest();
    this.loadingService.setLoading(true);
    if (this.appUserRoleForm.invalid) {
      this.loadingService.setLoading(false);
      this.appUserRoleForm.markAllAsTouched();
      return;
    }
    if (!this.isEdit) {
      roleRequest.ActionName = 'Save';
      roleRequest.Id = null;
      roleRequest.RoleName = appUserRole['RoleName'];
      roleRequest.Description = appUserRole['Description'];
      roleRequest.CreateUpdateBy = appUserRole['CreateUpdateBy'];
      roleRequest.IsActive = appUserRole['IsActive'];
      // roleRequest = new RoleSaveUpdateRequest(
      //   'Save',
      //   null,
      //   appUserRole['RoleName'],
      //   appUserRole['Description'],
      //   appUserRole['CreateUpdateBy'],
      //   appUserRole['IsActive']
      // );
    } else {
      roleRequest.ActionName = 'Update';
      roleRequest.Id = appUserRole['Id'];
      roleRequest.RoleName = appUserRole['RoleName'];
      roleRequest.Description = appUserRole['Description'];
      roleRequest.CreateUpdateBy = appUserRole['CreateUpdateBy'];
      roleRequest.IsActive = appUserRole['IsActive'];
      // roleRequest = new RoleSaveUpdateRequest(
      //   'Update',
      //   appUserRole['Id'],
      //   appUserRole['RoleName'],
      //   appUserRole['Description'],
      //   appUserRole['CreateUpdateBy'],
      //   appUserRole['IsActive']
      // );
    }

    // const roleRequest: RoleSaveUpdateRequest = this.appUserRoleForm.value;
    this.securityService.createUpdateAppUserRole(roleRequest).subscribe({
      next: (response: DataResponse) => {
        this.loadingService.setLoading(false);
        if (response.Success) {
          this.notifyService.showSuccess(
            response.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          this.getAllAppUserRolesPagination(this.currentPage, this.pageSize);
          this.resetForm();
        } else {
          this.loadingService.setLoading(false);
          this.notifyService.showError(
            response.Message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error.error;
        this.notifyService.showError(
          MessageConstants.INTERNAL_ERROR_MEG,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
    });
  }

  editAppUserRole(role: AppUserRoleResponse): void {
    this.isEdit = true;
    if (!this.commonService.isInvalidObject(role)) {
      // this.appUserRoleForm.controls['Id'].setValue(role.Id);
      // this.appUserRoleForm.controls['RoleName'].setValue(role.RoleName);
      // this.appUserRoleForm.controls['Description'].setValue(role.Description);
      // this.appUserRoleForm.controls['CreateUpdateBy'].setValue(this.appUserProfileId);
      // this.appUserRoleForm.controls['IsActive'].setValue(role.IsActive);
      this.appUserRoleForm.patchValue({
        Id: role.Id,
        RoleName: role.RoleName,
        Description: role.Description,
        CreateUpdateBy: this.appUserProfileId,
        IsActive: role.IsActive,
      });
    } else {
      this.notifyService.showError(
        MessageConstants.APP_USER_ROLE_NOT_FOUND_TO_UPDATE_MEG,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  deleteAppUserRole(roleId: string): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.loadingService.setLoading(true);

      this.securityService.deleteAppUserRole(roleId).subscribe({
        next: (response: DataResponse) => {
          this.loadingService.setLoading(false);
          if (response.Success) {
            this.notifyService.showSuccess(
              response.Message,
              MessageConstants.GENERAL_SUCCESS_TITLE
            );
            this.getAllAppUserRolesPagination(this.currentPage, this.pageSize);
          } else {
            this.notifyService.showError(
              response.Message,
              MessageConstants.GENERAL_ERROR_TITLE
            );
          }
        },
        error: (error) => {
          this.loadingService.setLoading(false);
          this.error_message = error.error;
          this.notifyService.showError(
            MessageConstants.INTERNAL_ERROR_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        },
      });
    }
  }

  resetForm(): void {
    this.isEdit = false;
    // ActionName: 'Save',
    this.appUserRoleForm.reset({
      Id: null,
      RoleName: '',
      Description: '',
      CreateUpdateBy: this.appUserProfileId,
      IsActive: true,
    });
  }
  ///----------------------------------------------Create, Update, and Delete Ends-----------------------------------

  ngOnDestroy(): void {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
  }
}
