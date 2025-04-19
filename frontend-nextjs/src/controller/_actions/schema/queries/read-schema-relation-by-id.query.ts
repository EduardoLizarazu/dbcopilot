"use server";
import { TSchemaRelationReadByIds } from "../interface/schema_relation.interface";

export async function ReadSchemaRelationByIds(data: TSchemaRelationReadByIds) {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-relation/find-one`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const res = await response.json();
    return {
      data: res,
      status: response.status,
    };
  } catch (error) {
    console.error("Error finding schema relation by ID: ", error);
    return {
      data: null,
      status: 500,
    };
  }
}
