import { AppUserRoleMenuInitialData } from "../models/app.user.role.menu.initial.data";

export class InitialDataResponse {
    userRolesList?: AppUserRoleMenuInitialData[] | any[];
    parentMenuList?: AppUserRoleMenuInitialData[] | any[];
    cssClassList?: AppUserRoleMenuInitialData[] | any[];
    routeLinkList?: AppUserRoleMenuInitialData[] | any[];
    routeLinkClassList?: AppUserRoleMenuInitialData[] | any[];
    iconList?: AppUserRoleMenuInitialData[] | any[];
    dropdownIconList?: AppUserRoleMenuInitialData[] | any[];
    nextMenuSlNo?: number | null;
}