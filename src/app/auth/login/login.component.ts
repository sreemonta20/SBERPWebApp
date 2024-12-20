import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DataResponse, LoginRequest, UserResponse } from '@app/core/class';
import {
  MessageConstants,
  RouteConstants,
  SessionConstants,
} from '@app/core/constants/index';
import { MenuItem } from '@app/core/interface';
import {
  AuthService,
  CommonService,
  LoaderService,
  NotificationService,
  SessionStorageService,
  ValidationFormsService,
} from '@app/core/services/index';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  host: { class: 'hold-transition login-page' },
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  // Declaration & initialization
  //host: { class: 'form-v6' },
  loginForm!: FormGroup;
  submitted = false;
  formErrors: any;
  hide: boolean = true;
  error_message: string = '';
  isLoggedIn: boolean = false;
  loggedInUser: UserResponse = new UserResponse();
  formControls!: string[];

  loginModelRequest = new LoginRequest();
  userMenus: MenuItem[];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    public router: Router,
    private http: HttpClient,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private loadingService: LoaderService,
    private authService: AuthService,
    private sessionService: SessionStorageService,
    private notifyService: NotificationService,
    private validationService: ValidationFormsService,
    private spinnerService: NgxSpinnerService,
    private commonService: CommonService
  ) {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    // this.commonService.isLoggedIn$.subscribe(
    //   (response) => (this.isLoggedIn = response)
    // );

    // this.commonService.loggedInUser$.subscribe(
    //   (response) => (this.loggedInUser = response)
    // );
  }

  ngAfterViewInit() {
    // this.loadScripts(['assets/js/adminlte.js']);
  }

  get f() {
    return this.loginForm.controls;
  }

  signIn(): void {
    this.submitted = true;
    this.loadingService.setLoading(true);
    if (this.loginForm.invalid) {
      return;
    }

    this.loginModelRequest.UserName = this.loginForm.controls['userName'].value;
    this.loginModelRequest.Password = this.loginForm.controls['password'].value;
    this.authService.login(this.loginModelRequest).subscribe({
      next: (response: DataResponse) => {
        if (response.ResponseCode === 200) {
          this.loadingService.setLoading(false);
          this.isLoggedIn = true;
          this.loggedInUser = response.Result;
          this.userMenus = JSON.parse(this.loggedInUser.userMenus);

          this.commonService.UpdateIsLoggedIn(this.isLoggedIn);
          this.commonService.UpdateLoggedInUser(this.loggedInUser);
          this.commonService.UpdateUserMenus(this.userMenus);
          this.commonService.UpdateSerializedUserMenus(this.userMenus);
          
          this.router.navigate([RouteConstants.BUSINESS_HOME_URL]);
        } else {
          this.loadingService.setLoading(false);
          this.notifyService.showError(
            response.Message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
          return;
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.error_message = error.error;
        this.notifyService.showError(
          this.error_message,
          MessageConstants.GENERAL_ERROR_TITLE
        );
        return;
      },
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

  ngOnDestroy(): void {}
}
