"use server";

type Permission = {
  id: string;
  name: string;
  description?: string;
};

export async function ReadPermissionByIdAction(id: string) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/permissions/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching permission with ID ${id}: ${response.statusText}`
      );
    }

    const permission = await response.json();
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description || "",
    } as Permission;
  } catch (error) {
    console.error(`Error reading permission by ID ${id}:`, error);
    throw new Error(`Failed to read permission with ID ${id}.`);
  }
}
