"use server";

interface Column {
  column_alias: string;
  column_description: string;
}

interface Table {
  table_neo4j_id: number;
  table_alias: string;
  table_description: string;
  columns: Column[];
}

export async function ReadAllSchemaContextByRoleIdAction(
  roleId: number
): Promise<Table[]> {
  console.log("ReadAllSchemaContextByRoleIdAction", roleId);

  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-graph/roles-graph/${roleId}`,
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

    const data: Table[] = await response.json();
    console.log("ReadAllSchemaContextByRoleIdAction", data);

    return data;
  } catch (error) {
    console.error("Error reading all roles:", error);
    throw new Error("Failed to read roles");
  }
}
