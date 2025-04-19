"use server";
import { TSchemaRelationWithKeyTypeDelete } from "../interface/schema_relation.interface";

export async function DeleteSchemaRelation(
  data: TSchemaRelationWithKeyTypeDelete
) {
  console.log("DELETE SCHEMA RELATION: ", data);

  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema/relation-with-keytype`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const res = await response.json();
    return {
      status: res,
    };
  } catch (error) {
    console.error("Error deleting schema relation: ", error);
    return {
      status: 500,
    };
  }
}
