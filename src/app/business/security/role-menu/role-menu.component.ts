import { Component, HostListener, OnInit, AfterViewInit } from '@angular/core';

import {
  SecurityService,
  NotificationService,
  CommonService,
  LoaderService,
} from '@app/core/services';

import { DataResponse, User, AppUserRole } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/index';
import { Router } from '@angular/router';
import { MessageConstants } from '@app/core/constants';
import { isCommonErrorShow } from '@environments/environment';

@Component({
  selector: 'app-role-menu',
  standalone: false,
  templateUrl: './role-menu.component.html',
  styleUrl: './role-menu.component.css',
})
export class RoleMenuComponent implements OnInit, AfterViewInit {
  // ========================
  // PAGE PERMISSION
  // ========================
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;

  // Page display prevention Message
  public pageDisplayMessage = MessageConstants.PAGE_DISPLAY_PROHIBITION_MSG;

  // ========================
  // ROLE AUTOCOMPLETE
  // ========================
  roles: AppUserRole[] = [];
  filteredRoles: AppUserRole[] = [];
  roleSearch: string = '';
  showRoleList: boolean = false;
  selectedRoleId: string = '';

  // ========================
  // MENU + PERMISSIONS
  // ========================
  roleMenuList: any[] = [];
  originalList: any[] = [];
  modifiedIndexes = new Set<number>();

  loggedInUserId: string = '';
  loading: boolean = false;

  // ========================
  // PAGINATION
  // ========================
  pageNumber: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalRecords: number = 0;

  // Select-All flags
  selectAll = {
    view: false,
    create: false,
    update: false,
    delete: false,
    active: false,
  };
  public error_message: any;

  constructor(
    public router: Router,
    private securityService: SecurityService,
    private notifyService: NotificationService,
    private loadingService: LoaderService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((user: User) => {
      this.loggedInUserId = user.Id;
    });
    this.loadPermission(this.router.url);
    this.loadRoles();
  }

  ngAfterViewInit() {
    // this.loadScripts(['assets/js/adminlte.js']);
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  // =========================================
  // LOAD ROLES
  // =========================================
  loadRoles() {
    this.securityService.getAllAppUserRoles().subscribe({
      next: (res: DataResponse) => {
        if (res.Success) {
          this.roles = res.Result;
          this.filteredRoles = this.roles;
        } else {
          this.notifyService.showWarning(
            res.Message,
            MessageConstants.GENERAL_WARNING_TITLE
          );
        }
      },
      error: (error) => {
        this.error_message = error.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
    });
  }

  // =========================================
  // AUTOCOMPLETE HANDLERS
  // =========================================
  filterRoles() {
    const term = this.roleSearch.toLowerCase();
    this.filteredRoles = !term
      ? this.roles
      : this.roles.filter((r) => r.RoleName.toLowerCase().includes(term));
    this.showRoleList = true;
  }

  selectRole(role: AppUserRole) {
    this.roleSearch = role.RoleName;
    this.selectedRoleId = role.Id;
    this.showRoleList = false;

    // reset pagination
    this.pageNumber = 1;

    this.loadRoleMenuPermissions();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.autocomplete-container')) {
      this.showRoleList = false;
    }
  }

  // =========================================
  // LOAD ROLE MENU PERMISSIONS WITH PAGING
  // =========================================
  loadRoleMenuPermissions() {
    this.loadingService.setLoading(true);
    if (!this.selectedRoleId) {
      this.loadingService.setLoading(false);
      this.notifyService.showWarning(
        MessageConstants.APP_USER_ROLE_NOT_SELECTED_MEG,
        MessageConstants.GENERAL_WARNING_TITLE
      );
      return;
    }

    const filter: PagingSearchFilter = {
      PageNumber: this.pageNumber,
      PageSize: this.pageSize,
      SearchTerm: '',
      SortColumnName: '',
      SortColumnDirection: '',
    };

    this.securityService
      .getRoleMenusPagingWithSearch(this.selectedRoleId, filter)
      .subscribe({
        next: (res: DataResponse) => {
          this.loadingService.setLoading(false);
          if (res.Success) {
            const result = res.Result;

            // pagination
            this.totalPages = result.PageCount;
            this.totalRecords = result.RowCount;

            // table rows
            this.roleMenuList = result.Items;
            this.originalList = JSON.parse(JSON.stringify(result.Items));
            this.modifiedIndexes.clear();
          } else {
            this.notifyService.showError(
              res.Message,
              MessageConstants.GENERAL_ERROR_TITLE
            );
          }
        },
        error: (error) => {
          this.loadingService.setLoading(false);
          this.error_message = error.error;
          this.notifyService.showError(
            isCommonErrorShow
              ? MessageConstants.INTERNAL_ERROR_MEG
              : this.error_message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        },
      });
  }

  // =========================================
  // PAGINATION LOGIC
  // =========================================
  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadRoleMenuPermissions();
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadRoleMenuPermissions();
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadRoleMenuPermissions();
    }
  }

  // =========================================
  // CHANGE TRACKING
  // =========================================
  onPermissionChange(i: number) {
    const current = this.roleMenuList[i];
    const original = this.originalList[i];

    const changed =
      current.IsView !== original.IsView ||
      current.IsCreate !== original.IsCreate ||
      current.IsUpdate !== original.IsUpdate ||
      current.IsDelete !== original.IsDelete ||
      current.IsActive !== original.IsActive;

    changed ? this.modifiedIndexes.add(i) : this.modifiedIndexes.delete(i);
  }

  // =========================================
  // SELECT ALL
  // =========================================
  toggleSelectAll(type: string) {
    const state = this.selectAll[type];

    this.roleMenuList.forEach((row, i) => {
      row[`Is${type.charAt(0).toUpperCase() + type.slice(1)}`] = state;
      this.onPermissionChange(i);
    });
  }

  // =========================================
  // HAS NEW ITEM & UPDATED ITEM
  // =========================================
  hasNewItems(): boolean {
    return Array.from(this.modifiedIndexes).some(
      (i) => !this.roleMenuList[i].RoleMenuId
    );
  }

  hasUpdatedItems(): boolean {
    return Array.from(this.modifiedIndexes).some(
      (i) => this.roleMenuList[i].RoleMenuId
    );
  }

  // =========================================
  // BULK SAVE
  // =========================================
  saveAll() {
    this.loadingService.setLoading(true);
    if (this.modifiedIndexes.size === 0) {
      this.loadingService.setLoading(false);
      this.notifyService.showWarning(
        MessageConstants.APP_USER_ROLE_MENU_NO_CHANGE_TO_SAVE_MEG,
        MessageConstants.GENERAL_WARNING_TITLE
      );
      return;
    }
    // console.log(
    //   'has new Item :' + this.hasNewItems() + ' and isCreate: ' + !this.isCreate
    // );
    if (this.hasNewItems() && !this.isCreate) {
      this.loadingService.setLoading(false);
      this.notifyService.showWarning(
        MessageConstants.APP_USER_ROLE_MENU_NO_CREATE_PERMISSION_MSG,
        MessageConstants.GENERAL_PERMISSION_DENIED_TITLE
      );
      return;
    }
    // console.log(
    //   'has new Item :' +
    //     this.hasUpdatedItems() +
    //     ' and isCreate: ' +
    //     !this.isUpdate
    // );
    if (this.hasUpdatedItems() && !this.isUpdate) {
      this.loadingService.setLoading(false);
      this.notifyService.showWarning(
        MessageConstants.APP_USER_ROLE_MENU_NO_UPDATE_PERMISSION_MSG,
        MessageConstants.GENERAL_PERMISSION_DENIED_TITLE
      );
      return;
    }

    const permissions = Array.from(this.modifiedIndexes).map((i) => {
      const m = this.roleMenuList[i];
      return {
        RoleMenuId: m.RoleMenuId,
        MenuId: m.MenuId,
        IsView: m.IsView,
        IsCreate: m.IsCreate,
        IsUpdate: m.IsUpdate,
        IsDelete: m.IsDelete,
        IsActive: m.IsActive,
      };
    });

    const payload = {
      RoleId: this.selectedRoleId,
      UserId: this.loggedInUserId,
      Permissions: permissions,
    };

    this.securityService.saveUpdateRoleMenuBulk(payload).subscribe({
      next: (res) => {
        this.loadingService.setLoading(false);

        if (res.Success) {
          this.notifyService.showSuccess(
            res.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          this.loadRoleMenuPermissions();
        } else {
          this.notifyService.showError(
            res.Message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error.error;
        this.notifyService.showError(
          isCommonErrorShow
            ? MessageConstants.INTERNAL_ERROR_MEG
            : this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
    });
  }

  cancel() {
    this.roleMenuList = JSON.parse(JSON.stringify(this.originalList));
    this.modifiedIndexes.clear();
  }
}
