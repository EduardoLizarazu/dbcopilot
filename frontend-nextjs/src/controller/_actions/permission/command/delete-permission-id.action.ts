"use server";

export async function DeletePermissionByIdAction(id: number) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/permissions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error deleting permission with ID ${id}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`Error deleting permission by ID ${id}:`, error);
    throw new Error(`Failed to delete permission with ID ${id}.`);
  }
}
