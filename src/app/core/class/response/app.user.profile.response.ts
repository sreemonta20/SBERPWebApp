export class AppUserProfileResponse {
  Id!: string;
  FullName!: string;
  Address!: string;
  Email!: string;
  AppUserRoleId!: string | null;
  RoleName!: string;
  /** Role name / designation / position (free text, not the user role). */
  JobTitle?: string | null;
  UserName?: string; // Added, optional
  EmployeeId?: string | null;
  /** Null when no photo was uploaded: the default avatar is shown. */
  ProfilePhotoId?: string | null;
  CreatedBy!: string;
  CreatedDate!: Date;
  UpdatedBy!: string;
  UpdatedDate!: Date;
  IsActive!: boolean;
}
