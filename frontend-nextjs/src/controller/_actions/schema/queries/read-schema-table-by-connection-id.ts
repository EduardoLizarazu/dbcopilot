"use server";
import { ISchemaTable } from "../interface/read-schema-table-column.interface";

export async function ReadSchemaTableByConnId(
  connId: number
): Promise<ISchemaTable[]> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema/table/connection/${connId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch schema data");
    }
    const data = await response.json();
    const formattedData: ISchemaTable[] = data.map((item: any) => ({
      table_id: item.schema_table_id,
      table_name: item.schema_table_technicalName,
      table_alias: item.schema_table_alias,
      table_description: item.schema_table_description,
    }));

    return formattedData;
  } catch (error) {
    console.error("Error finding all tables by connection ID: ", error);
    return []; // Return an empty array in case of an error
  }
}
