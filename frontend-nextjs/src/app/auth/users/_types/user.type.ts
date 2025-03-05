
export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface Role {
  id: number;
  name: string;
}
export interface UserWithRolesAndPermssions {
  id: number;
  fullName: string;
  email: string;
  accountStatus: number;
  roles: RoleWithPermissions[];
  directPermissions: Permission[];
}

export interface UserWithRoles {
  id: number;
  fullName: string;
  email: string;
  accountStatus: number;
  roles: Role[];
}
