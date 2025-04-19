"use server";
export type TReadSchemaSimpleGeneralOutput = {
  table_name: string;
  column_name: string;
  data_type: string;
  primary_key: string | null;
  foreign_key: string | null;
  unique_key: string | null;
  referenced_table: string | null;
  referenced_column: string | null;
};

export type TConnection = {
  name: string;
  description: string | null;
  dbTypeId: number;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string | null;
  is_connected: boolean;
};

export async function ReadSchemaSimpleGeneral(input: TConnection) {
  const response = await fetch(
    `${process.env.BASE_URL}/connection/schema-simple`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return (await response.json()) as TReadSchemaSimpleGeneralOutput[];
}
