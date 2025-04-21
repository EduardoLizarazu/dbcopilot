"use server";

import { TConnection } from "../queries/read-schema-simple.query";

// :connectionId
export async function CreateSchemaCmd(input: TConnection) {
  console.log("CREATE CONNECTION AND SCHEMA: ", input);

  if (!input.is_connected) return { status: 400 };
  if (!input.dbName) return { status: 400 };
  if (!input.dbHost) return { status: 400 };
  if (!input.dbPort) return { status: 400 };
  if (!input.dbUsername) return { status: 400 };
  if (!input.dbTypeId) return { status: 400 };
  if (!input.dbPassword) return { status: 400 };

  const res = await fetch(`${process.env.BASE_URL}/schema`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const response = await res.json();

  return {
    status: response,
  };
}
