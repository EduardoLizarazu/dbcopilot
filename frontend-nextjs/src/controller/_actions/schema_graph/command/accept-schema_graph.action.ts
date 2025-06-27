"use server";

type TSchemaGraphDb = {
  role_id: number;
  column_id: number;
  table_id: number;
};

export async function AcceptSchemaGraphRole(
  input: TSchemaGraphDb[]
): Promise<void> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-graph/${input[0].role_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error accepting the schema graph role:", error);
    throw new Error("Failed to accept the schema graph role");
  }
}
