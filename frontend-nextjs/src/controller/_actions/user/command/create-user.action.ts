"use server";
type User = {
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

export async function CreateUserAction(input: User) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Failed to create role with permissions.");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user.");
  }
}
