import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DataResponse, User } from '@app/core/class';
import { SessionConstants } from '@app/core/constants';
import { SessionStorageService, AuthService, CommonService, UserCard, UserCardService } from '@app/core/services';
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
  /** Name, designation / role and photo (employee photo, else profile photo, else default avatar). */
  public card: UserCard;
  private subscriptions = new Subscription();
  
  constructor(
    private datePipe: DatePipe,
    public router: Router,
    private commonService: CommonService,
    private authService: AuthService,
    private userCardService: UserCardService
  ) {
    this.subscriptions.add(this.userCardService.card$.subscribe((card) => (this.card = card)));

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
  }

  signOut(): void {
     this.authService.logout();
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions when component is destroyed
    this.subscriptions.unsubscribe();
  }
}
