import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataResponse, User } from '@app/core/class';
import { SessionConstants } from '@app/core/constants';
import { SessionStorageService, AuthService, CommonService } from '@app/core/services';
import { JwtHelperService } from '@auth0/angular-jwt';
import {jwtDecode} from 'jwt-decode';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy  {
  public isLoggedIn: boolean = false;
  public user: User = new User();
  private subscriptions = new Subscription();
  // public jwtHelper: JwtHelperService = new JwtHelperService();
  
  constructor(
    private datePipe: DatePipe,
    public router: Router,
    private commonService: CommonService,
    private authService: AuthService
  ) {
    // Subscribe to isLoggedIn status
    this.subscriptions.add(
      this.commonService.GetIsUserLoggedIn().subscribe(
        (isLoggedIn) => {
          this.isLoggedIn = isLoggedIn;
        }
      )
    );

    // Subscribe to logged in user
    this.subscriptions.add(
      this.commonService.GetLoggedInUser().subscribe(
        (user) => {
          this.user = user;
        }
      )
    );
  }

  ngOnInit(): void {
    // // this.isUserAuthenticated();
    // this.commonService.GetLoggedInUser().pipe(take(1)).subscribe((userInformation) => {
    //   this.user = userInformation;
    // });
  }

  // isUserAuthenticated() {
  //   this.commonService.loggedInUser$.subscribe((loggedInUser) => {
      
  //     this.loggedInUser = loggedInUser;
  //   });

  //   this.user = this.loggedInUser.user;
  //   const token: string | null = this.loggedInUser.access_token;
  //   const tokenPayload = jwtDecode(token) as any;
  //   const expirationTimestamp = tokenPayload.exp;
  //   const currentTimestamp = new Date().getTime() / 1000; // Convert to seconds
  //   if (
  //     token &&
  //     !this.commonService.IsExpired(expirationTimestamp, currentTimestamp)
  //   ) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // signOut(): void {
  //   this.commonService.RevokeSession();
  // }
  signOut(): void {
     this.authService.logout();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }
}
