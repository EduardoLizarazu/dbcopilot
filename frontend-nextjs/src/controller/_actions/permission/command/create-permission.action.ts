"use server";

type CreatePermission = {};

export async function CreatePermission(
  createPermissionDto: CreatePermission
): Promise<void> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/permissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createPermissionDto),
    });

    if (!response.ok) {
      throw new Error("Failed to create permission");
    }
  } catch (error) {
    console.error("Error creating permission:", error);
    throw new Error("Failed to create permission");
  }
}
