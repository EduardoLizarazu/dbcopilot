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

export async function ReadAllRolesWithPermAction(): Promise<Role[]> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Role[] = await response.json();
    return data.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description || "",
      permissions: role.permissions,
    }));
  } catch (error) {
    console.error("Error reading all roles:", error);
    throw new Error("Failed to read roles");
  }
}
