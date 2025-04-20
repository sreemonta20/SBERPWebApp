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
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  AppUserRoleMenuInitialData,
  InitialDataResponse,
  AppUserMenuResponse,
  CustomValidators,
  DataResponse,
  AppUserMenuRequest,
  User,
  PagingResult,
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
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-appusermenu',
  standalone: false,
  templateUrl: './appusermenu.component.html',
  styleUrls: ['./appusermenu.component.css'],
})
export class AppUserMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private destroy$: Subject<void> = new Subject<void>();

  // Current User
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;
  public loading: boolean = false;
  public errorMessage: string = '';

  // DataTable Properties & Pagination
  public dataTable: any;
  public pageSizeList: number[] = this.commonService.pageSize();
  public appUserMenuList: AppUserMenuResponse[] = [];
  public searchTerm: string = '';
  public sortColumnName: string = '';
  public sortColumnDirection: string = 'ASC'; // ASC or DESC
  public pageNumber: number = 1;
  public pageSize: number = 5;
  public totalRecords: number = 0;
  public totalPages: number = 0;

  // Form Details
  public appUserMenuForm: FormGroup;
  public isEdit: boolean = false;

  // Response related
  public initialDataResponse: InitialDataResponse;
  public cssClassList: { name: string }[] = [];
  public filteredCssClassList: { name: string }[] = [];
  public routeLinkList: { name: string }[] = [];
  public filteredRouteLinkList: { name: string }[] = [];
  public routeLinkClassList: { name: string }[] = [];
  public filteredRouteLinkClassList: { name: string }[] = [];
  public iconList: { name: string }[] = [];
  public filteredIconList: { name: string }[] = [];
  public parentMenuList: AppUserRoleMenuInitialData[] = [];
  public dropdownIconList: { name: string }[] = [];
  public filteredDropdownIconList: { name: string }[] = [];

  public nextMenuSerialNo: number = 0;
  public isSerialNoDisabled: boolean = false;

  public error_message: any;

  // dtMainOptions: DataTables.Settings = {};

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
    this.subscription = this.commonService
      .GetLoggedInUser()
      .subscribe((userInformation: User) => {
        debugger;
        this.appUserProfileId = userInformation.Id;
      });
    this.loadPermission(this.router.url);
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.APP_USER_MENU_TITLE);
    this.createForm();
    this.initializeFormData();
    // this.getAllAppUserMenuPagingWithSearch();
    this.getAllAppUserMenuPagingWithSearch();
  }

  ngAfterViewInit() {
    // ($('#appUserMenuTable') as any).DataTable({
    //   paging: true,
    //   lengthChange: true,
    //   searching: true,
    //   ordering: true,
    //   responsive: true,
    // });
    // this.getAllAppUserMenuPagingWithSearch();
  }

  loadPermission(url: any): void {
    console.log('Execution from Home');
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  createForm() {
    this.appUserMenuForm = this.formBuilder.group({
      Id: [null],
      Name: ['', [Validators.required, CustomValidators.englishText(1, 50)]],
      IsHeader: [false],
      IsModule: [false],
      IsComponent: [false],
      CssClass: new FormControl('', Validators.required),
      RouteLink: new FormControl('', Validators.required),
      RouteLinkClass: new FormControl('', Validators.required),
      Icon: new FormControl('', Validators.required),
      Remark: new FormControl(''),
      ParentId: new FormControl(''),
      DropdownIcon: new FormControl(''),
      SerialNo: new FormControl('', Validators.required),
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });
  }

  initializeFormData() {
    try {
      this.securityService.getAppUserRoleMenuInitialData().subscribe({
        next: (response: DataResponse) => {
          if (response.ResponseCode === 200) {
            this.initialDataResponse = response.Result;

            this.initialDataResponse.cssClassList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.cssClassList.push({ name: item.Name });
                }
              }
            );
            this.filteredCssClassList = [...this.cssClassList];

            this.initialDataResponse.routeLinkList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.routeLinkList.push({ name: item.Name });
                }
              }
            );
            this.filteredRouteLinkList = [...this.routeLinkList];

            this.initialDataResponse.routeLinkClassList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.routeLinkClassList.push({ name: item.Name });
                }
              }
            );
            this.filteredRouteLinkClassList = [...this.routeLinkClassList];

            this.initialDataResponse.iconList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.iconList.push({ name: item.Name });
                }
              }
            );
            this.filteredIconList = [...this.iconList];

            this.parentMenuList = this.initialDataResponse.parentMenuList;

            this.initialDataResponse.dropdownIconList.forEach(
              (item: AppUserRoleMenuInitialData) => {
                if (item.Name) {
                  this.dropdownIconList.push({ name: item.Name });
                }
              }
            );
            this.filteredDropdownIconList = [...this.dropdownIconList];

            if (
              this.commonService.isValid(this.initialDataResponse.nextMenuSlNo)
            ) {
              this.nextMenuSerialNo = this.initialDataResponse.nextMenuSlNo;
              this.appUserMenuForm
                .get('SerialNo')
                .setValue(this.nextMenuSerialNo);
              this.isSerialNoDisabled = true;
            }
          } else {
            this.notifyService.showError(
              MessageConstants.APP_USER_ROLE_MENU_INITIAL_DATA_NOT_FOUND_MEG,
              MessageConstants.GENERAL_ERROR_TITLE
            );
            return;
          }
        },
        error: (error) => {
          this.error_message = error.error;
          this.notifyService.showError(
            MessageConstants.INTERNAL_ERROR_MEG,
            MessageConstants.GENERAL_ERROR_TITLE
          );
          return;
        },
      });
    } catch (error) {
      this.notifyService.showError(
        error.error.message,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  onCssClassInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();

    this.filteredCssClassList = this.cssClassList.filter((cssClass) =>
      cssClass.name.toLowerCase().includes(inputValue)
    );
  }

  onRouteLinkClassInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredRouteLinkClassList = this.routeLinkClassList.filter(
      (routeLinkClass) => routeLinkClass.name.toLowerCase().includes(inputValue)
    );
  }

  onIconInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredIconList = this.iconList.filter((icon) =>
      icon.name.toLowerCase().includes(inputValue)
    );
  }

  onDropdownIconInput(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDropdownIconList = this.dropdownIconList.filter(
      (dropdownIcon) => dropdownIcon.name.toLowerCase().includes(inputValue)
    );
  }

  ///-----------------------------------------List & Pagination Starts----------------------------------------------

  // getAllAppUserMenuPagingWithSearch(): void {
  //   // Destroy existing DataTable if it exists
  //   if (this.dataTable) {
  //     this.dataTable.destroy();
  //   }

  //   // Initialize the DataTable with proper column definitions
  //   this.dataTable = $('#appUserMenuTable').DataTable({
  //     processing: true,
  //     serverSide: true,
  //     searching: true,
  //     ordering: true,
  //     lengthChange: true,
  //     lengthMenu: this.pageSizeList,
  //     pageLength: 5,
  //     ajax: (dataTablesParameters: any, callback: any) => {
  //       // Show loading indicator
  //       this.loading = true;
  //       this.errorMessage = '';

  //       // Extract pagination, search and sort parameters
  //       const pageNumber =
  //         dataTablesParameters.start !== 0
  //           ? Math.floor(
  //               dataTablesParameters.start / dataTablesParameters.length
  //             ) + 1
  //           : 1;
  //       const pageSize = dataTablesParameters.length;
  //       const searchTerm = dataTablesParameters.search.value || '';

  //       // Default sort values
  //       let sortColumnName = '';
  //       let sortColumnDirection = 'asc';

  //       // Get sort column and direction if available
  //       if (
  //         dataTablesParameters.order &&
  //         dataTablesParameters.order.length > 0
  //       ) {
  //         const columnIndex = dataTablesParameters.order[0].column;
  //         sortColumnName = dataTablesParameters.columns[columnIndex].data || '';
  //         sortColumnDirection = dataTablesParameters.order[0].dir || 'asc';
  //       }

  //       // Unsubscribe from previous request if it exists
  //       if (this.subscription) {
  //         this.subscription.unsubscribe();
  //       }

  //       // Call the service directly and store the subscription
  //       this.subscription = this.securityService
  //         .getAllAppUserMenuPagingWithSearch(
  //           searchTerm,
  //           sortColumnName,
  //           sortColumnDirection,
  //           pageNumber,
  //           pageSize
  //         )
  //         .pipe(takeUntil(this.destroy$))
  //         .subscribe({
  //           next: (response: DataResponse | undefined) => {
  //             this.loading = false;

  //             if (response && response.Success && response.Result) {
  //               const result =
  //                 response.Result as PagingResult<AppUserMenuResponse>;

  //               // Update component properties
  //               this.appUserMenuList = result.Items || [];

  //               // Return data to DataTables with properly formatted data
  //               callback({
  //                 recordsTotal: result.RowCount || 0,
  //                 recordsFiltered: result.RowCount || 0,
  //                 data: this.appUserMenuList
  //               });
  //             } else {
  //               this.errorMessage = response?.Message || 'Failed to fetch data';
  //               this.appUserMenuList = [];

  //               // Return empty dataset
  //               callback({
  //                 recordsTotal: 0,
  //                 recordsFiltered: 0,
  //                 data: []
  //               });
  //             }
  //           },
  //           error: (error) => {
  //             this.loading = false;
  //             this.errorMessage = 'Error loading data';
  //             this.appUserMenuList = [];
  //             console.error('Error in data fetch:', error);

  //             // Return empty dataset on error
  //             callback({
  //               recordsTotal: 0,
  //               recordsFiltered: 0,
  //               data: []
  //             });
  //           },
  //         });
  //     },
  //     columns: [
  //       { data: 'Name' },  // Menu Name
  //       {
  //         data: 'IsHeader',
  //         render: function(data) {
  //           return data ? 'Yes' : 'No';
  //         }
  //       },
  //       {
  //         data: 'IsModule',
  //         render: function(data) {
  //           return data ? 'Yes' : 'No';
  //         }
  //       },
  //       {
  //         data: 'IsComponent',
  //         render: function(data) {
  //           return data ? 'Yes' : 'No';
  //         }
  //       },
  //       { data: 'RouteLink' },  // Route Link
  //       { data: 'ParentName' },  // Parent Menu
  //       {
  //         data: 'IsActive',
  //         render: function(data) {
  //           return data ? 'Yes' : 'No';
  //         }
  //       },
  //       {
  //         data: null,
  //         orderable: false,
  //         render: (data, type, row) => {
  //           return `
  //             <ul class="list-inline m-0">
  //               <li class="list-inline-item" ${!this.isUpdate ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
  //                 <i class="fa fa-edit edit-menu" data-id="${row.Id}"></i>
  //               </li>
  //               <li class="list-inline-item" ${!this.isDelete ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
  //                 <i class="fa fa-trash delete-menu" data-id="${row.Id}"></i>
  //               </li>
  //             </ul>
  //           `;
  //         }
  //       }
  //     ],
  //     drawCallback: () => {
  //       // Add event listeners for edit and delete buttons
  //       $('.edit-menu').on('click', (e) => {
  //         if (this.isUpdate) {
  //           const menuId = $(e.currentTarget).data('id');
  //           const menuToEdit = this.appUserMenuList.find(menu => menu.Id === menuId);
  //           if (menuToEdit) {
  //             this.editAppUserMenu(menuToEdit);
  //           }
  //         }
  //       });

  //       $('.delete-menu').on('click', (e) => {
  //         if (this.isDelete) {
  //           const menuId = $(e.currentTarget).data('id');
  //           this.deleteAppUserMenu(menuId);
  //         }
  //       });
  //     }
  //   });
  // }

  // getAllAppUserMenuPagingWithSearch(): void {
  //   this.dataTable = $('#appUserMenuTable').DataTable({
  //     processing: true,
  //     serverSide: true,
  //     searching: true,
  //     ordering: true,
  //     lengthChange: true,
  //     lengthMenu: this.pageSizeList,
  //     pageLength: 5,
  //     ajax: (dataTablesParameters: any, callback: any) => {
  //       this.loading = true;
  //       this.errorMessage = '';

  //       const pageNumber =
  //         dataTablesParameters.start !== 0
  //           ? Math.floor(
  //               dataTablesParameters.start / dataTablesParameters.length
  //             ) + 1
  //           : 1;
  //       const pageSize = dataTablesParameters.length;
  //       const searchTerm = dataTablesParameters.search.value || '';

  //       let sortColumnName = '';
  //       let sortColumnDirection = 'asc';

  //       if (
  //         dataTablesParameters.order &&
  //         dataTablesParameters.order.length > 0
  //       ) {
  //         const columnIndex = dataTablesParameters.order[0].column;
  //         sortColumnName = dataTablesParameters.columns[columnIndex].data || '';
  //         sortColumnDirection = dataTablesParameters.order[0].dir || 'asc';
  //       }

  //       if (this.subscription) {
  //         this.subscription.unsubscribe();
  //       }

  //       this.subscription = this.securityService
  //         .getAllAppUserMenuPagingWithSearch(
  //           searchTerm,
  //           sortColumnName,
  //           sortColumnDirection,
  //           pageNumber,
  //           pageSize
  //         )
  //         .pipe(takeUntil(this.destroy$))
  //         .subscribe({
  //           next: (response: DataResponse | undefined) => {
  //             this.loading = false;

  //             if (response && response.Success && response.Result) {
  //               const result =
  //                 response.Result as PagingResult<AppUserMenuResponse>;
  //               this.appUserMenuList = result.Items || [];

  //               callback({
  //                 recordsTotal: result.RowCount || 0,
  //                 recordsFiltered: result.RowCount || 0,
  //                 data: this.appUserMenuList,
  //               });
  //             } else {
  //               this.errorMessage = response?.Message || 'Failed to fetch data';
  //               this.appUserMenuList = [];

  //               callback({
  //                 recordsTotal: 0,
  //                 recordsFiltered: 0,
  //                 data: [],
  //               });
  //             }
  //           },
  //           error: (error) => {
  //             this.loading = false;
  //             this.errorMessage = 'Error loading data';
  //             this.appUserMenuList = [];
  //             console.error('Error in data fetch:', error);

  //             callback({
  //               recordsTotal: 0,
  //               recordsFiltered: 0,
  //               data: [],
  //             });
  //           },
  //         });
  //     },
  //     columns: [
  //       { data: 'Name' },
  //       { data: 'IsHeader' },
  //       { data: 'IsModule' },
  //       { data: 'IsComponent' },
  //       { data: 'RouteLink' },
  //       { data: 'ParentName' },
  //       { data: 'IsActive' },
  //       { data: null, orderable: false },
  //     ],
  //   });
  // }

  // getAllAppUserMenuPagingWithSearch(): void {
  //   this.dataTable = $('#appUserMenuTable').DataTable({
  //     pagingType: "full_numbers",
  //     processing: true,
  //     serverSide: true,
  //     searching: true,
  //     ordering: true,
  //     lengthChange: true,
  //     lengthMenu: this.pageSizeList,
  //     pageLength: 5,
  //     order: [1, 'desc'],
  //     responsive: true,
  //     destroy: true,
  //     ajax: (dataTablesParameters: any, callback: any) => {
  //       this.loading = true;
  //       this.errorMessage = '';

  //       const pageNumber =
  //         dataTablesParameters.start !== 0
  //           ? Math.floor(
  //               dataTablesParameters.start / dataTablesParameters.length
  //             ) + 1
  //           : 1;
  //       const pageSize = dataTablesParameters.length;
  //       const searchTerm = dataTablesParameters.search.value || '';

  //       let sortColumnName = '';
  //       let sortColumnDirection = 'asc';

  //       if (
  //         dataTablesParameters.order &&
  //         dataTablesParameters.order.length > 0
  //       ) {
  //         const columnIndex = dataTablesParameters.order[0].column;
  //         sortColumnName = dataTablesParameters.columns[columnIndex].data || '';
  //         sortColumnDirection = dataTablesParameters.order[0].dir || 'asc';
  //       }

  //       this.securityService
  //         .getAllAppUserMenuPagingWithSearch(
  //           searchTerm,
  //           sortColumnName,
  //           sortColumnDirection,
  //           pageNumber,
  //           pageSize
  //         )
  //         .subscribe({
  //           next: (response: DataResponse | undefined) => {
  //             this.loading = false;

  //             if (response && response.Success && response.Result) {
  //               const result =
  //                 response.Result as PagingResult<AppUserMenuResponse>;
  //               this.appUserMenuList = result.Items || [];

  //               callback({
  //                 recordsTotal: result.RowCount || 0,
  //                 recordsFiltered: result.RowCount || 0,
  //               });
  //             } else {
  //               this.errorMessage = response?.Message || 'Failed to fetch data';
  //               this.appUserMenuList = [];

  //               callback({
  //                 recordsTotal: 0,
  //                 recordsFiltered: 0
  //               });
  //             }
  //           },
  //           error: (error) => {
  //             this.loading = false;
  //             this.errorMessage = 'Error loading data';
  //             this.appUserMenuList = [];
  //             console.error('Error in data fetch:', error);

  //             callback({
  //               recordsTotal: 0,
  //               recordsFiltered: 0
  //             });
  //           },
  //         });
  //     }
  //   });
  // }

  getAllAppUserMenuPagingWithSearch(): void {
    this.loading = true;
    this.errorMessage = '';
  
    this.securityService
      .getAllAppUserMenuPagingWithSearch('', '', '', 1, 1000) // Adjust page size if needed
      .subscribe({
        next: (response: DataResponse | undefined) => {
          this.loading = false;
  
          if (response && response.Success && response.Result) {
            const result = response.Result as PagingResult<AppUserMenuResponse>;
            this.appUserMenuList = result.Items || [];
  
            // Allow Angular time to render rows before initializing DataTables
            setTimeout(() => {
              if (this.dataTable) {
                this.dataTable.destroy(); // Destroy existing instance before re-initializing
              }
  
              this.dataTable = $('#appUserMenuTable').DataTable({
                pagingType: 'full_numbers',
                lengthChange: true,
                lengthMenu: this.pageSizeList,
                pageLength: 5,
                ordering: true,
                searching: true,
                responsive: true,
                destroy: true
              });
            }, 0);
          } else {
            this.errorMessage = response?.Message || 'Failed to fetch data';
            this.appUserMenuList = [];
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Error loading data';
          this.appUserMenuList = [];
          console.error('Error fetching data:', error);
        }
      });
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }
  ///-----------------------------------------List & Pagination Ends----------------------------------------------

  ///-----------------------------------------Create, Update, and Delete Starts-----------------------------------
  createUpdateAppUserMenu(appUserMenu): void {
    let appUserMenuRequest: AppUserMenuRequest = new AppUserMenuRequest();
    this.loadingService.setLoading(true);
    if (this.appUserMenuForm.invalid) {
      this.loadingService.setLoading(false);
      this.appUserMenuForm.markAllAsTouched();
      return;
    }
    if (!this.isEdit) {
      appUserMenuRequest.ActionName = 'Save';
      appUserMenuRequest.Id = null;
      appUserMenuRequest.Name = appUserMenu['Name'];
      appUserMenuRequest.IsHeader = appUserMenu['IsHeader'];
      appUserMenuRequest.IsModule = appUserMenu['IsModule'];
      appUserMenuRequest.IsComponent = appUserMenu['IsComponent'];
      appUserMenuRequest.CssClass = appUserMenu['CssClass'];
      appUserMenuRequest.RouteLink = appUserMenu['RouteLink'];
      appUserMenuRequest.RouteLinkClass = appUserMenu['RouteLinkClass'];
      appUserMenuRequest.Icon = appUserMenu['Icon'];
      appUserMenuRequest.Remark = appUserMenu['Remark'];
      appUserMenuRequest.ParentId = appUserMenu['ParentId'];
      appUserMenuRequest.DropdownIcon = appUserMenu['DropdownIcon'];
      appUserMenuRequest.SerialNo = appUserMenu['SerialNo'];
      appUserMenuRequest.CreateUpdateBy = appUserMenu['CreateUpdateBy'];
      appUserMenuRequest.IsActive = appUserMenu['IsActive'];
    } else {
      appUserMenuRequest.ActionName = 'Update';
      appUserMenuRequest.Id = appUserMenu['Id'];
      appUserMenuRequest.Name = appUserMenu['Name'];
      appUserMenuRequest.IsHeader = appUserMenu['IsHeader'];
      appUserMenuRequest.IsModule = appUserMenu['IsModule'];
      appUserMenuRequest.IsComponent = appUserMenu['IsComponent'];
      appUserMenuRequest.CssClass = appUserMenu['CssClass'];
      appUserMenuRequest.RouteLink = appUserMenu['RouteLink'];
      appUserMenuRequest.RouteLinkClass = appUserMenu['RouteLinkClass'];
      appUserMenuRequest.Icon = appUserMenu['Icon'];
      appUserMenuRequest.Remark = appUserMenu['Remark'];
      appUserMenuRequest.ParentId = appUserMenu['ParentId'];
      appUserMenuRequest.DropdownIcon = appUserMenu['DropdownIcon'];
      appUserMenuRequest.SerialNo = appUserMenu['SerialNo'];
      appUserMenuRequest.CreateUpdateBy = appUserMenu['CreateUpdateBy'];
      appUserMenuRequest.IsActive = appUserMenu['IsActive'];
    }

    this.securityService.createUpdateAppUserMenu(appUserMenuRequest).subscribe({
      next: (response: DataResponse) => {
        this.loadingService.setLoading(false);
        if (response.Success) {
          this.notifyService.showSuccess(
            response.Message,
            MessageConstants.GENERAL_SUCCESS_TITLE
          );
          this.getAllAppUserMenuPagingWithSearch();
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

  editAppUserMenu(menu: AppUserMenuResponse): void {
    this.isEdit = true;
    if (!this.commonService.isInvalidObject(menu)) {
      this.appUserMenuForm.patchValue({
        Id: menu.Id,
        Name: menu.Name,
        IsHeader: menu.IsHeader,
        IsModule: menu.IsModule,
        IsComponent: menu.IsComponent,
        CssClass: menu.CssClass,
        RouteLink: menu.RouteLink,
        RouteLinkClass: menu.RouteLinkClass,
        Icon: menu.Icon,
        Remark: menu.Remark,
        ParentId: menu.ParentId,
        DropdownIcon: menu.DropdownIcon,
        SerialNo: menu.SerialNo,
        CreateUpdateBy: this.appUserProfileId,
        IsActive: menu.IsActive,
      });
    } else {
      this.notifyService.showError(
        MessageConstants.APP_USER_MENU_NOT_FOUND_TO_UPDATE_MEG,
        MessageConstants.GENERAL_ERROR_TITLE
      );
    }
  }

  deleteAppUserMenu(roleId: string): void {
    if (confirm(MessageConstants.APP_USER_MENU_DELETE_CONFIRMATION_MSG)) {
      this.loadingService.setLoading(true);

      this.securityService.deleteAppUserMenu(roleId).subscribe({
        next: (response: DataResponse) => {
          this.loadingService.setLoading(false);
          if (response.Success) {
            this.notifyService.showSuccess(
              response.Message,
              MessageConstants.GENERAL_SUCCESS_TITLE
            );
            this.getAllAppUserMenuPagingWithSearch();
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

    this.appUserMenuForm = this.formBuilder.group({
      Id: [null],
      Name: ['', [Validators.required, CustomValidators.englishText(1, 50)]],
      IsHeader: [false],
      IsModule: [false],
      IsComponent: [false],
      CssClass: new FormControl('', Validators.required),
      RouteLink: new FormControl('', Validators.required),
      RouteLinkClass: new FormControl('', Validators.required),
      Icon: new FormControl('', Validators.required),
      Remark: new FormControl(''),
      ParentId: new FormControl(''),
      DropdownIcon: new FormControl(''),
      SerialNo: new FormControl('', Validators.required),
      CreateUpdateBy: this.appUserProfileId,
      IsActive: [true],
    });

    this.appUserMenuForm.reset({
      Id: null,
      Name: '',
      IsHeader: false,
      IsModule: false,
      IsComponent: false,
      CssClass: '',
      RouteLink: '',
      RouteLinkClass: '',
      Icon: '',
      Remark: '',
      ParentId: '',
      DropdownIcon: '',
      SerialNo: '',
      CreateUpdateBy: this.appUserProfileId,
      IsActive: true,
    });
    this.initializeFormData();
  }
  ///------------------------------------------Create, Update, and Delete Ends-----------------------------------

  ngOnDestroy(): void {
    // Unsubscribe from the Subject (for takeUntil approach)
    this.destroy$.next();
    this.destroy$.complete();

    // Unsubscribe from any direct subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe(); // Prevent memory leaks
    }

    // Destroy datatable
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}
