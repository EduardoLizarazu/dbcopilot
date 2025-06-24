"use server";

type Permission = {
  id: number;
  name: string;
  description?: string;
};

type Role = {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
};

export async function UpdateRoleWithPermAction(input: Role) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/roles/${input.id}`, {
      method: "PUT",
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
