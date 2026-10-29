export class AppUserProfileRegisterRequest {
  Id: string | null;
  ActionName: string | null;
  FullName: string | null;
  Address: string | null;
  Email: string | null;
  AppUserRoleId: string | null;
  /** Role name / designation / position shown beside the name (free text, not the user role). */
  JobTitle?: string | null;
  CreateUpdateBy: string | null;
  IsActive: boolean | null;
  UserName?: string | null;
  Password?: string | null;
  ConfirmPassword?: string | null;
}
