"use server";

import { ISchemaColumn } from "../interface/read-schema-table-column.interface";

export async function UpdateSchemaColumn(data: ISchemaColumn) {
  try {
    const formattedData = {
      alias: data.column_alias,
      description: data.column_description,
    };

    console.log("UPDATE SCHEMA COLUMN: ", formattedData);

    const response = await fetch(
      `${process.env.BASE_URL}/schema-column/${data.column_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
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
    console.error("Error updating schema column: ", error);
  }
}
