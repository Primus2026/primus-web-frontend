export type UserRole = "WAREHOUSEMAN" | "ADMIN"

export interface IUser {
    id: number;
    login: string;
    email: string;
    role: UserRole;
    totp_secret?: string;
    is_2fa_enabled: boolean;
    is_active: boolean;
}