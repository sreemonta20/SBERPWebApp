export class AppUserProfileResponse {
  Id!: string;
  FullName!: string;
  Address!: string;
  Email!: string;
  AppUserRoleId!: string | null;
  RoleName!: string;
  UserName?: string; // Added, optional
  CreatedBy!: string;
  CreatedDate!: Date;
  UpdatedBy!: string;
  UpdatedDate!: Date;
  IsActive!: boolean;
}
