"use server";
import { TSchemaRelationUpdate } from "../interface/schema_relation.interface";

export async function UpdateSchemaRelation(data: TSchemaRelationUpdate) {
  try {
    const response = await fetch(`${process.env.BASE_URL}/schema-relation`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    console.log("UPDATE SCHEMA RELATION: ", body);

    return {
      status: body,
    };
  } catch (error) {
    console.error("Error updating schema relation: ", error);
    return {
      status: 500,
    };
  }
}
