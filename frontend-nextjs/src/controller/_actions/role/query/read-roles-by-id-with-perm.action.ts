"use server";

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
};

export async function ReadRoleByIdWithPerm(id: string): Promise<Role> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/roles/${id}/permissions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading roles by id with permissions:", error);
    throw new Error("Failed to read role by id with permissions");
  }
}
