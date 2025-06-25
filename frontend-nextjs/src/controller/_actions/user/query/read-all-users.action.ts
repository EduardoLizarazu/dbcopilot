"use server";

type User = {
  id: number;
  name: string;
  username: string;
  roles: Role[];
  permissions: Permission[];
};

type Role = {
  id: number;
  name: string;
  description?: string;
};

type Permission = {
  id: number;
  name: string;
  description?: string;
};

export async function ReadAllUsersAction(): Promise<User[]> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: User[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading all users:", error);
    throw new Error("Failed to read users");
  }
}
