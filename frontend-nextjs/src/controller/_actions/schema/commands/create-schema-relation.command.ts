"use server";
import { TSchemaRelation } from "../interface/schema_relation.interface";

export async function SchemaRelationCreateAction(data: TSchemaRelation) {
  try {
    const formattedData = {
      columnIdFather: data.columnIdFather,
      columnIdChild: data.columnIdChild,
      description: data.description,
      isStatic: false,
    };

    console.log("CREATE SCHEMA RELATION: ", formattedData);

    const response = await fetch(`${process.env.BASE_URL}/schema-relation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error creating schema relation: ", error);
    return {
      status: 500,
    };
  }
}
