export class AppUserMenu {
    public Id: string | null; // Guid in C# is typically represented as a string in TypeScript
    public Name?: string | null;
    public IsHeader?: boolean;
    public IsModule?: boolean;
    public IsComponent?: boolean;
    public CssClass?: string | null;
    public RouteLink?: string | null;
    public RouteLinkClass?: string | null;
    public Icon?: string | null;
    public Remark?: string | null;
    public ParentId?: string | null; // Guid in C# is typically represented as a string in TypeScript
    public DropdownIcon?: string | null;
    public SerialNo?: number | null;
    public CreatedBy?: string | null;
    public CreatedDate?: Date | null;
    public UpdatedBy?: string | null;
    public UpdatedDate?: Date | null;
    public IsActive?: boolean;
    public AppUserRoleMenus?: any | null;
}