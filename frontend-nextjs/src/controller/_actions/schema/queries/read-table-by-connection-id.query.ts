"use server";
import { ISchemaTable } from "../interface/read-schema-table-column.interface";

export async function ReadTableByConnectionId(
  connectionId: number
): Promise<ISchemaTable[]> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-table/connection/${connectionId}`,
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
    const data: ISchemaTable[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error finding all tables by connection ID: ", error);
    return []; // Return an empty array in case of an error
  }
}
