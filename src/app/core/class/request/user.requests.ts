export class LoginRequest {
  UserName: string;
  Password: string;
}

export class RefreshTokenRequest {
  Access_Token: string;
  Refresh_Token: string;
  // constructor(Access_Token: string, Refresh_Token: string) {
  //   this.Access_Token = Access_Token;
  //   this.Refresh_Token = Refresh_Token;
  // }
}

export class SaveUpdateRequest {
  ActionName: string;
  Id: string;
  FullName: string;
  UserName: string;
  Password: string;
  Email: string;
  UserRole: string;
}
