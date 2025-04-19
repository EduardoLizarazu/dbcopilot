import { SchemaColumnQueryFormat } from "../interface/readColumnByTableId.interface";

export async function ReadColumnByTableId(
  tableId: number
): Promise<SchemaColumnQueryFormat[]> {
  try {
    console.log("READ COLUMN BY TABLE ID: ", tableId);
    const response = await fetch(
      `${process.env.BASE_URL}/schema-column/table/${tableId}`,
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
    const data: SchemaColumnQueryFormat[] = await response.json();

    // sort: 1) primary key, 2) other fields, 3) foreign key
    data.sort((a, b) => {
      if (a.is_primary_key && !b.is_primary_key) return -1; // a is primary key, b is not
      if (!a.is_primary_key && b.is_primary_key) return 1; // b is primary key, a is not
      if (a.is_foreign_key && !b.is_foreign_key) return 1; // a is foreign key, b is not
      if (!a.is_foreign_key && b.is_foreign_key) return -1; // b is foreign key, a is not
      return 0; // both are the same type
    });

    return data;
  } catch (error) {
    console.error("Error finding all columns by table ID: ", error);
    return []; // Return an empty array in case of an error
  }
}
