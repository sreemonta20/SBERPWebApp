export class AppUserProfile {
    Id: string | null; // Guid in C# is typically represented as a string in TypeScript
    FullName?: string | null;
    Address?: string | null;
    Email?: string | null;
    AppUserRoleId?: string | null; // Guid is represented as a string
    CreatedBy?: string | null;
    CreatedDate?: Date | null; // DateTime in C# is represented as Date in TypeScript
    UpdatedBy?: string | null;
    UpdatedDate?: Date | null;
    IsActive?: boolean;
}
