export class LoginRequest {
  UserName: string;
  Password: string;
}

export class RefreshTokenRequest {
  Access_Token: string;
  Refresh_Token: string;
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
