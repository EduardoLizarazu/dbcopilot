"use server";
import { TSchemaColumnWithTableSimple } from "../interface/schema_column.interface";

export async function ReadColumnByIdWithTable(id: number) {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-column/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data: TSchemaColumnWithTableSimple = await response.json();
    return {
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error finding all columns by table ID: ", error);
    return {
      data: null,
      status: 500,
    }; // Return an empty array in case of an error
  }
}
