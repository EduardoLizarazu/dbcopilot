"use server";

type User = {
  id: number;
  name: string;
  username: string;
  password: string;
  roles: Role[];
};

type Role = {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
};

type Permission = {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
};
export async function UpdateUserByIdAction(input: User): Promise<void> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/users/${input.id}`, {
      method: "PUT",
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
