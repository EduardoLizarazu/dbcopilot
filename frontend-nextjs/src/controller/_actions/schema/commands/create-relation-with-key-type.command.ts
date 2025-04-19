"use server";
import { TSchemaRelationWithKeyType } from "../interface/schema_relation.interface";

export async function createRelationWithKeyType(
  data: TSchemaRelationWithKeyType
) {
  try {
    const formattedData = {
      columnIdFather: data.columnIdFather,
      columnIdChild: data.columnIdChild,
      description: data.description,
      isStatic: data.isStatic,
    };

    console.log("CREATE SCHEMA RELATION WITH KEY TYPE: ", formattedData);

    const response = await fetch(
      `${process.env.BASE_URL}/schema/relation-with-keytype`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      }
    );

    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error creating schema relation with key type: ", error);
    return {
      status: 500,
    };
  }
}
