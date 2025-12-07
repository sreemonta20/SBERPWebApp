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
import {
  DataResponse,
  LoginRequest,
  TokenResponse,
  ProfileMenuResponse,
} from '@app/core/class';
import { MessageConstants, RouteConstants } from '@app/core/constants/index';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  host: { class: 'hold-transition login-page' },
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  // Declaration & initialization
  loginForm!: FormGroup;
  submitted = false;
  formErrors: any;
  hide: boolean = true;
  error_message: string = '';
  isLoggedIn: boolean = false;
  public tokenResponse: TokenResponse = new TokenResponse();
  public profileMenuResponse: ProfileMenuResponse = new ProfileMenuResponse();

  // loginModelRequest = new LoginRequest();
  userMenus: MenuItem[] = [];
  private subscriptions = new Subscription();

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

  ngOnInit(): void {}

  ngAfterViewInit() {
    // this.loadScripts(['assets/js/adminlte.js']);
  }

  get f() {
    return this.loginForm.controls;
  }

  createForm() {
    this.loginForm = this.fb.group({
      userName: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  signIn(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loadingService.setLoading(true);

    const loginModelRequest: LoginRequest = {
      UserName: this.f.userName.value,
      Password: this.f.password.value,
    };

    const loginSub = this.authService.login(loginModelRequest).subscribe({
      next: async (response: DataResponse) => {
        this.loadingService.setLoading(false);

        if (response.ResponseCode === 200) {
          debugger
          this.tokenResponse = response.Result;
          this.isLoggedIn = true;

          this.commonService.UpdateIsLoggedIn(true);
          this.commonService.UpdateAccessToken(this.tokenResponse.access_token);
          this.commonService.UpdateRefreshToken(
            this.tokenResponse.refresh_token
          );

          const userProfileMenuResponse =
            await this.authService.getUserProfileMenuAsync();

          if (userProfileMenuResponse?.Success) {
            this.profileMenuResponse = userProfileMenuResponse.Result;

            this.commonService.UpdateLoggedInUser(
              this.profileMenuResponse.user
            );
            this.commonService.UpdateUserMenus(
              this.profileMenuResponse.userMenus
            );
            this.commonService.UpdateSerializedUserMenus(
              this.commonService.parseMenu(this.profileMenuResponse.userMenus)
            );

            setTimeout(() => {
              this.router.navigate([RouteConstants.BUSINESS_HOME_URL]);
            }, 500);
          } else {
            this.commonService.RevokeSession();
          }
        } else {
          this.notifyService.showError(
            response.Message,
            MessageConstants.GENERAL_ERROR_TITLE
          );
        }
      },
      error: (error) => {
        this.loadingService.setLoading(false);
        this.notifyService.showError(
          error?.error,
          MessageConstants.GENERAL_ERROR_TITLE
        );
      },
    });

    this.subscriptions.add(loginSub);
  }

  loadScripts(urls: string[]) {
    for (const url of urls) {
      const script = this.renderer.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      this.renderer.appendChild(document.body, script);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Important for preventing memory leaks
  }
}
