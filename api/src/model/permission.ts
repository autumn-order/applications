export enum Permissions {
    // Application Permissions
    // View Application also grants ability to view users & roles
    ViewApplication = "View Application",
    AcceptApplication = "Accept Application",
    RejectApplication = "Reject Application",

    // Role Permissions
    SetRolePermissions = "Set Role Permissions",

    // Settings Permissions
    ManageSettings = "Manage Settings",

    // Admin Permissions
    Admin = "Admin"
}

export interface RolePermissionsDto {
    permissions: Permissions[];
    total: number;
}