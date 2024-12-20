export class User {
    Id: string;
    FullName: string;
    UserName: string;
    Password:  string;
    Email: string;
    UserRole: string;
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