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

export async function ReadUserByIdAction(input: User): Promise<void> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/users/${input.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error reading all users:", error);
    throw new Error("Failed to read users");
  }
}
