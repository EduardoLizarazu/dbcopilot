"use server";

type User = {
  id: number;
  name: string;
  username: string;
  roles: TRole[];
  userPermissions: TUserPermission[];
};

type TRole = {
  id: number;
  name: string;
  description?: string;
};

type TUserPermission = {
  userId: number;
  permissionId: number;
  isActive: boolean;
};

export async function ReadUserByIdAction(id: number): Promise<User> {
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

    const data: User = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading all users:", error);
    throw new Error("Failed to read users");
  }
}
