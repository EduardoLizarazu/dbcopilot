"use server";

type TUser = {
  id: number;
  name: string;
  username: string;
  password: string;
  roles: TRole[];
};

type TRole = {
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

export async function ReadUserByIdAction(id: number): Promise<TUser> {
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

    const data: TUser = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading all users:", error);
    throw new Error("Failed to read users");
  }
}
