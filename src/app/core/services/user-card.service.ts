import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { gatewayUrl } from '@environments/environment';
import { APIConstants } from '@app/core/constants';
import { User } from '@app/core/class';
import { CommonService } from './common.service';
import { DEFAULT_AVATAR_URL, PhotoService } from './photo.service';

/** What the top bar, its user dropdown and the sidebar show for the signed-in user. */
export interface UserCard {
  profileId: string;
  fullName: string;
  /** Profile role name / designation (JobTitle), else the linked employee's designation; empty otherwise. */
  title: string;
  memberSince?: Date | string;
  photoUrl: string;
}

/** HR getMyEmployeeBrief result (camelCase). */
interface EmployeeBrief {
  id: string;
  employeeCode?: string;
  fullName?: string;
  designationName?: string;
  departmentName?: string;
  photoId?: string | null;
}

const EMPTY_CARD: UserCard = { profileId: '', fullName: '', title: '', photoUrl: DEFAULT_AVATAR_URL };

/**
 * Builds the signed-in user's card. When the login is linked to an employee and that employee has a
 * photo, the employee photo is shown; otherwise the user profile photo; otherwise
 * the default avatar. Reloads when the user changes or one of the two photos is uploaded / removed.
 */
@Injectable({
  providedIn: 'root',
})
export class UserCardService {
  private readonly card = new BehaviorSubject<UserCard>(EMPTY_CARD);
  public readonly card$ = this.card.asObservable();

  private readonly reload = new Subject<User | null>();
  private user: User | null = null;
  private employeeId: string | null = null;

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private photoService: PhotoService,
  ) {
    this.reload.pipe(switchMap((user) => this.buildCard(user))).subscribe((card) => this.card.next(card));

    this.commonService.GetLoggedInUser().subscribe((user) => {
      this.user = user;
      this.reload.next(user);
    });

    this.photoService.photoChanged$
      .pipe(
        filter(
          (change) =>
            (change.owner === 'user' && change.id === this.user?.Id) ||
            (change.owner === 'employee' && (change.id === this.employeeId || change.id === this.user?.EmployeeId)),
        ),
      )
      .subscribe(() => this.reload.next(this.user));
  }

  private buildCard(user: User | null): Observable<UserCard> {
    this.employeeId = null;
    if (!user?.Id) {
      return of(EMPTY_CARD);
    }
    const base: UserCard = {
      profileId: user.Id,
      fullName: user.FullName ?? user.UserName ?? '',
      title: user.JobTitle?.trim() || '',
      memberSince: user.CreatedDate,
      photoUrl: DEFAULT_AVATAR_URL,
    };
    return this.myEmployee(user).pipe(
      switchMap((employee) => {
        this.employeeId = employee?.id ?? null;
        const card: UserCard = { ...base, title: base.title || employee?.designationName || '' };
        const photo$ = employee?.photoId
          ? this.photoService.photoUrl('employee', employee.id, employee.photoId)
          : this.photoService.photoUrl('user', user.Id);
        return photo$.pipe(map((photoUrl) => ({ ...card, photoUrl })));
      }),
    );
  }

  /** Employee linked to the login (by token user id, else AppUserProfiles.EmployeeId); null when none or HR is down. */
  private myEmployee(user: User): Observable<EmployeeBrief | null> {
    let params = new HttpParams();
    if (user.EmployeeId) {
      params = params.set('employeeId', user.EmployeeId);
    }
    return this.http.get<any>(`${gatewayUrl}${APIConstants.API_GET_MY_EMPLOYEE_BRIEF_URL}`, { params }).pipe(
      map((response) => (response?.success ? (response.result as EmployeeBrief | null) : null)),
      catchError(() => of(null)),
    );
  }
}
