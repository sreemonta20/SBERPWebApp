export class User {
    Id: string;
    FullName: string;
    UserName: string;
    Email: string;
    UserRole: string;
    /** Security role name (Admin, User, ...): used for access, never shown as the person's title. */
    RoleName?: string;
    /** Role name / designation / position from the user profile: shown beside the name. */
    JobTitle?: string;
    /** Linked HR employee (AppUserProfiles.EmployeeId); its photo / designation win over the profile ones. */
    EmployeeId?: string;
    CreatedDate:  Date;
  }
  
  export class SpecificUser {
    Id:  string;
    FullName:  string;
    UserName:  string;
    Password:  string;
    SaltKey:  string;
    Email:  string;
    UserRole:  string;
    LastLoginAttemptAt:  Date;
    LoginFailedAttemptsCount:  number;
    CreatedBy:  string;
    CreatedDate:  Date;
  }