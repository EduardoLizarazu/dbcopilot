"use server";

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

interface UserPermission {
  userId: number;
  permissionId: number;
  isActive: boolean;
  permission: Permission;
}

interface User1 {
  id: number;
  username: string;
  name: string;
  accountStatus: string;
  roles: Role[];
  userPermissions: UserPermission[];
}

type TUserOutput = {
  id: number;
  name: string;
  username: string;
  password: string;
  roles: TRoleOutput[];
};

type TRoleOutput = {
  id: number;
  name: string;
  description?: string;
  permissions: TPermissionOutput[];
};

type TPermissionOutput = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
};

export async function ReadUserByIdAction(id: number): Promise<TUserOutput> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: User1 = await response.json();
    return transformUserStructure(data);
  } catch (error) {
    console.error("Error reading all users:", error);
    throw new Error("Failed to read users");
  }
}

function transformUserStructure(user1: User1): TUserOutput {
  // Create a map of user permissions for easy lookup
  const userPermissionMap = user1.userPermissions.reduce(
    (map, userPermission) => {
      map[`${userPermission.permissionId}`] = userPermission.isActive;
      return map;
    },
    {}
  );

  // Transform roles and their permissions
  const roles = user1.roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: role.permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description,
      isActive:
        userPermissionMap[permission.id] !== undefined
          ? userPermissionMap[permission.id]
          : true,
    })),
  }));

  // Create the new user object with transformed roles
  const user2 = {
    id: user1.id,
    username: user1.username,
    // Assuming password isn't derivable from user1 object for security reasons,
    // you'd typically get this from another source. For demonstration, let's say it's a fixed string.
    password: "securePassword123",
    name: user1.name,
    roles,
  };

  return user2;
}
