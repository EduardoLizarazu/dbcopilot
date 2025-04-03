interface SqlSchemaAction {
  id: number;
  name: string;
  type: string;
  sqlSchema: string;
}

export const sqlSchemaAction = async (sqlSchema: SqlSchemaAction) => {
  const { id, name, type, sqlSchema: sqlSchemaValue } = sqlSchema;
  const response = await fetch("/api/sqlschema", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      name,
      type,
      sqlSchema: sqlSchemaValue,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}