"use server";

type Permission = {
  id: string;
  name: string;
  description?: string;
};

type Role = {
  name: string;
  description?: string;
  permissions: Permission[];
};

export async function CreateRoleWithPermAction(input: Role) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/roles`, {
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
    console.error("Error creating role with permissions:", error);
    throw new Error("Failed to create role with permissions.");
  }
}
