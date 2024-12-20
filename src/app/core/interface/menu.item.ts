export interface MenuItem {
    Id: string;
    Name: string;
    IsHeader: boolean;
    IsModule: boolean;
    IsComponent: boolean;
    CssClass: string;
    RouteLink: string;
    RouteLinkClass: string;
    Icon: string;
    Remark: string;
    ParentId: string;
    DropdownIcon: string;
    SerialNo: number;
    CreatedBy: string;
    CreatedDate: Date;
    UpdatedBy: string;
    UpdatedDate: Date;
    IsActive: boolean;
    IsView: boolean;
    IsCreate: boolean;
    IsUpdate: boolean;
    IsDelete: boolean;
    Children?: MenuItem[];
  }