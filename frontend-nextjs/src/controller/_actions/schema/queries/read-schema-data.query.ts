"use server";
import { IReadSchemaData } from "../schema.action";

export async function ReadSchemaData(
  connectionId: number
): Promise<IReadSchemaData[]> {
  try {
    // fetch schema data from the database using the connectionId
    const response = await fetch(
      `${process.env.BASE_URL}/schema/${connectionId}`,
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
    const data: IReadSchemaData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error finding schema by connection ID: ", error);
    return []; // Return an empty array in case of an error
  }
}
