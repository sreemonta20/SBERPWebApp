import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataResponse, User, UserResponse } from '@app/core/class';
import { SessionConstants } from '@app/core/constants';
import { SessionStorageService, CommonService } from '@app/core/services';
import { JwtHelperService } from '@auth0/angular-jwt';
import {jwtDecode} from 'jwt-decode';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  //LoggedIn Related
  public isLoggedIn: boolean = false;
  public loggedInUser: UserResponse = new UserResponse();
  public user: User = new User();
  public jwtHelper: JwtHelperService = new JwtHelperService();
  
  constructor(
    private datePipe: DatePipe,
    public router: Router,
    private commonService: CommonService
  ) {
    this.commonService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  ngOnInit(): void {
    this.isUserAuthenticated();
  }

  isUserAuthenticated() {
    // this.loggedInUser = this.sessionService.get(
    //   SessionConstants.LOGGED_IN_USER
    // ) as UserResponse;

    this.commonService.loggedInUser$.subscribe((loggedInUser) => {
      
      this.loggedInUser = loggedInUser;
    });

    this.user = this.loggedInUser.user;
    const token: string | null = this.loggedInUser.access_token;
    const tokenPayload = jwtDecode(token) as any;
    const expirationTimestamp = tokenPayload.exp;
    const currentTimestamp = new Date().getTime() / 1000; // Convert to seconds
    if (
      token &&
      !this.commonService.IsExpired(expirationTimestamp, currentTimestamp)
    ) {
      return true;
    } else {
      return false;
    }
  }

  signOut(): void {
    this.commonService.RevokeSession();
  }
}
