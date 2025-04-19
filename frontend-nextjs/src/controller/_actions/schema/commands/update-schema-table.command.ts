"use server";

import { ISchemaTable } from "../interface/read-schema-table-column.interface";

export async function UpdateSchemaTable(data: ISchemaTable) {
  try {
    const dataFormatted = {
      technicalName: data.table_name,
      alias: data.table_alias,
      description: data.table_description,
    };

    console.log("UPDATE SCHEMA TABLE: ", dataFormatted);

    const response = await fetch(
      `${process.env.BASE_URL}/schema-table/${data.table_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFormatted),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update schema table");
    }
    return {
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    console.error("Error updating schema table: ", error);
  }
}
