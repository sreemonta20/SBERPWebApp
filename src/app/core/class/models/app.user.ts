export class AppUser {
    id: string;
    appUserProfileId?: string | null;
    userName?: string | null;
    password?: string | null;
    saltKey?: string | null;
    refreshToken?: string | null;
    refreshTokenExpiryTime?: Date | null;
    createdBy?: string | null;
    createdDate?: Date | null;
    updatedBy?: string | null;
    updatedDate?: Date | null;
    isActive?: boolean | null;
}