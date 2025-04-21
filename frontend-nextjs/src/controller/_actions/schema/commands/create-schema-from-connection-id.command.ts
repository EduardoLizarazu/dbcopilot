"use server";

export async function CreateSchemaFromConnectionIdCmd(id: number) {
  console.log("CREATE SCHEMA FROM CONNECTION ID: ", id);

  const res = await fetch(`${process.env.BASE_URL}/schema/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await res.json();

  return {
    status: response,
  };
}
