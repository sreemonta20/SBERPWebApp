export interface RoleMenuPermissionRequest {
  RoleMenuId?: string | null;
  MenuId: string;
  IsView: boolean;
  IsCreate: boolean;
  IsUpdate: boolean;
  IsDelete: boolean;
  IsActive: boolean;
}