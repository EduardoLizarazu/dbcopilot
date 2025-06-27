"use server";

export async function DeleteRoleByIdAction(id: number) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/roles/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error deleting role with ID ${id}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`Error deleting role by ID ${id}:`, error);
    throw new Error(`Failed to delete role with ID ${id}.`);
  }
}
