export interface AppUserRoleMenuResponse {
  RoleMenuId?: string | null;
  RoleId: string;
  MenuId: string;

  MenuName: string;

  // metadata (read-only)
  IsHeader: boolean;
  IsModule: boolean;
  IsComponent: boolean;
  IsRouteLink: boolean;
  Url: string;
  SerialNo: number;
  IsActiveMenu: boolean;

  // editable permissions
  IsView: boolean;
  IsCreate: boolean;
  IsUpdate: boolean;
  IsDelete: boolean;
  IsActive: boolean;
}
