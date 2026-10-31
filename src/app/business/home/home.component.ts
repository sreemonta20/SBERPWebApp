import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from '@app/core/class';
import { MessageConstants } from '@app/core/constants';
import {
  CommonService,
  LoaderService,
  NotificationService,
  SessionStorageService,
  ValidationFormsService,
} from '@app/core/services/index';
import { ScriptLoaderService } from '@app/core/services/script-loader.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, filter, take, takeUntil, tap } from 'rxjs';
declare var $: any;

/** Chart.js and jQuery Mapael (+ its Raphael / mousewheel / USA map dependencies), in load order. */
const DASHBOARD_LIBRARIES = [
  'assets/plugins/chart.js/Chart.min.js',
  'assets/plugins/jquery-mousewheel/jquery.mousewheel.js',
  'assets/plugins/raphael/raphael.min.js',
  'assets/plugins/jquery-mapael/jquery.mapael.min.js',
  'assets/plugins/jquery-mapael/maps/usa_states.min.js',
];

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // Current User
  public appUserProfileId: string = '';

  // Permission
  public isView = false;
  public isCreate = false;
  public isUpdate = false;
  public isDelete = false;

  // Subscription management
  private destroy$ = new Subject<void>();
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private renderer: Renderer2,
    private loadingService: LoaderService,
    private sessionService: SessionStorageService,
    private notifyService: NotificationService,
    private validationService: ValidationFormsService,
    private spinnerService: NgxSpinnerService,
    private commonService: CommonService,
    private titleService: Title,
    private scriptLoader: ScriptLoaderService
  ) {
  }

  ngOnInit(): void {
    this.titleService.setTitle(MessageConstants.HOME_DASHBOARD_TITLE);
    this.loadUserData();
  }

  ngAfterViewInit() {
    // the chart / map libraries are only needed here: loaded once, on the first visit to the
    // dashboard (they used to be in angular.json "scripts", i.e. downloaded by every page)
    this.scriptLoader
      .load(DASHBOARD_LIBRARIES)
      .then(() => this.scriptLoader.run('assets/js/pages/dashboard2.js'))
      .catch((error) => console.error('Dashboard charts could not be loaded.', error));
  }

  private loadUserData(): void {
    // Using takeUntil for proper subscription management
    this.commonService
      .GetLoggedInUser()
      .pipe(
        filter((userInformation) => !!userInformation),
        take(1),
        tap((userInformation: User) => {
          console.log('Home-> appUserProfileId: '+userInformation.Id);

          this.appUserProfileId = userInformation.Id;
          // Now that we have the user info, load permissions
          this.loadPermission(this.router.url);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadPermission(url: any): void {
    const permissionModel = this.commonService.getMenuPermission(url);
    this.isView = permissionModel.IsView;
    this.isCreate = permissionModel.IsCreate;
    this.isUpdate = permissionModel.IsUpdate;
    this.isDelete = permissionModel.IsDelete;
  }

  ngOnDestroy(): void {
    // Complete the subject to notify all subscriptions to unsubscribe
    this.destroy$.next();
    this.destroy$.complete();
  }
}
