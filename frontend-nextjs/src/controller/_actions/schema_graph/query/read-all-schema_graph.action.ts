"use server";

type TSchemaGraph = {
  table_neo4j_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
  columns: TSchemaGraphColumn[];
};

type TSchemaGraphColumn = {
  column_type: string;
  column_alias: string;
  column_key_type: string;
  column_name: string;
  column_description: string;
  column_neo4j_id: number;
};
export async function ReadAllSchemaGraphAction(): Promise<TSchemaGraph[]> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/schema-graph`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TSchemaGraph[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error reading all roles:", error);
    throw new Error("Failed to read roles");
  }
}
