"use server";

type TSchemaGraphDb = {
  role_id: number;
  column_id: number;
  table_id: number;
};

export async function ReadAllSchemaGraphByRoleIdAction(
  roleId: number
): Promise<TSchemaGraphDb[]> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-graph/roles/${roleId}`,
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

    const data: TSchemaGraphDb[] = await response.json();
    console.log("ReadAllSchemaGraphByRoleIdAction", data);

    return data;
  } catch (error) {
    console.error("Error reading all roles:", error);
    throw new Error("Failed to read roles");
  }
}
