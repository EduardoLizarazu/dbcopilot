"use server";

type ReadPermission = {
  id: number;
  name: string;
  description?: string;
};

export async function ReadAllPermissions(): Promise<ReadPermission[]> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/permissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data.map((permission: any) => ({
      id: permission.id,
      name: permission.name,
      description: permission.description || "",
    })) as ReadPermission[];
  } catch (error) {
    console.error("Error reading all permissions:", error);
    throw new Error("Failed to read permissions");
  }
}
