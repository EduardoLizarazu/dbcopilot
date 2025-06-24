"use server";

type ReadPermission = {
  id: number;
  name: string;
  description?: string;
};

export async function UpdatePermissionById(input: ReadPermission) {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/permissions/${input.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          description: input.description || "",
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Error updating permission with ID ${input.id}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error reading all permissions:", error);
    throw new Error("Failed to read permissions");
  }
}
