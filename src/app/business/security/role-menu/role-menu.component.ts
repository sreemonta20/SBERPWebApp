import { Component, HostListener, OnInit } from '@angular/core';

import {
  SecurityService,
  NotificationService,
  CommonService,
  LoaderService,
} from '@app/core/services';

import { DataResponse, User, AppUserRole } from '@app/core/class';
import { PagingSearchFilter } from '@app/core/interface/index';

@Component({
  selector: 'app-role-menu',
  standalone: false,
  templateUrl: './role-menu.component.html',
  styleUrl: './role-menu.component.css',
})
export class RoleMenuComponent implements OnInit {

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

  constructor(
    private securityService: SecurityService,
    private notify: NotificationService,
    private loader: LoaderService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.commonService.GetLoggedInUser().subscribe((user: User) => {
      this.loggedInUserId = user.Id;
    });

    this.loadRoles();
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
          this.notify.showWarning('No roles found', 'Warning');
        }
      },
      error: () => this.notify.showError('Error loading roles', 'Error'),
    });
  }

  // =========================================
  // AUTOCOMPLETE HANDLERS
  // =========================================
  filterRoles() {
    const term = this.roleSearch.toLowerCase();
    this.filteredRoles = !term
      ? this.roles
      : this.roles.filter((r) =>
          r.RoleName.toLowerCase().includes(term)
        );
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
    if (!this.selectedRoleId) return;

    this.loading = true;

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
          this.loading = false;

          if (res.Success) {
            const result = res.Result;

            // pagination
            this.totalPages = result.PageCount;
            this.totalRecords = result.RowCount;

            // table rows
            this.roleMenuList = result.Items;
            this.originalList = JSON.parse(JSON.stringify(result.Items));
            this.modifiedIndexes.clear();
          }
        },
        error: () => {
          this.loading = false;
          this.notify.showError('Error fetching role menu permissions','Error');
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

    changed
      ? this.modifiedIndexes.add(i)
      : this.modifiedIndexes.delete(i);
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
  // BULK SAVE
  // =========================================
  saveAll() {
    if (this.modifiedIndexes.size === 0) {
      this.notify.showWarning('No changes to save.', 'Warning');
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

    this.loader.setLoading(true);

    this.securityService.saveUpdateRoleMenuBulk(payload).subscribe({
      next: (res) => {
        this.loader.setLoading(false);

        if (res.Success) {
          this.notify.showSuccess('Permissions saved successfully','Success');
          this.loadRoleMenuPermissions();
        } else {
          this.notify.showError(res.Message, 'Error');
        }
      },
      error: () => {
        this.loader.setLoading(false);
        this.notify.showError('Error saving permissions', 'Error');
      },
    });
  }

  cancel() {
    this.roleMenuList = JSON.parse(JSON.stringify(this.originalList));
    this.modifiedIndexes.clear();
  }
}
