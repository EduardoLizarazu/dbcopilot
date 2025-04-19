"use server";
import {
  TSchemaRelation,
  TSchemaRelationUpdate,
  TSchemaRelationWithKeyType,
  TSchemaRelationWithKeyTypeDelete,
} from "./interface/schema_relation.interface";

interface RowData {
  tableId: number;
  tableName: string;
  tableDesc: string;
  columns: { columnId: number; columnName: string; columnDesc: string }[];
}
const rows: IReadSchemaData[] = [
  //  Fake
  {
    table_id: 1,
    table_name: "users",
    table_alias: "u",
    table_description: "User information",
    columns: [
      {
        column_id: 1,
        column_name: "user_id",
        column_alias: "id",
        column_description: "Unique identifier for the user",
        column_data_type: "int",
        foreign_key: 0,
        primary_key: 1,
        relation_description: "",
      },
      {
        column_id: 2,
        column_name: "username",
        column_alias: "name",
        column_description: "Username of the user",
        column_data_type: "varchar",
        foreign_key: 0,
        primary_key: 0,
        relation_description: "",
      },
    ],
  },
  {
    table_id: 2,
    table_name: "products",
    table_alias: "p",
    table_description: "Product information",
    columns: [
      {
        column_id: 1,
        column_name: "product_id",
        column_alias: "id",
        column_description: "Unique identifier for the product",
        column_data_type: "int",
        foreign_key: 0,
        primary_key: 1,
        relation_description: "",
      },
      {
        column_id: 2,
        column_name: "product_name",
        column_alias: "name",
        column_description: "Name of the product",
        column_data_type: "varchar",
        foreign_key: 0,
        primary_key: 0,
        relation_description: "",
      },
    ],
  },
  {
    table_id: 3,
    table_name: "orders",
    table_alias: "o",
    table_description: "Order information",
    columns: [
      {
        column_id: 1,
        column_name: "order_id",
        column_alias: "id",
        column_description: "Unique identifier for the order",
        column_data_type: "int",
        foreign_key: 0,
        primary_key: 1,
        relation_description: "",
      },
      {
        column_id: 2,
        column_name: "user_id",
        column_alias: "userId",
        column_description: "Identifier for the user who placed the order",
        column_data_type: "int",
        foreign_key: 1,
        primary_key: 0,
        relation_description: "Foreign key to users table",
      },
    ],
  },
];

export interface IReadSchemaData {
  table_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
  columns: {
    column_id: number;
    column_name: string;
    column_alias: string;
    column_description: string;
    column_data_type: string;
    foreign_key: number;
    primary_key: number;
    relation_description: string;
  }[];
}

export interface ISchemaTable {
  table_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
}

export interface ISchemaColumn {
  column_id: number;
  column_alias: string | null;
  column_description: string | null;
}

export async function GetSchemaData() {
  return rows;
}

export async function UpdateSchemaTable(data: ISchemaTable) {
  try {
    const dataFormatted = {
      technicalName: data.table_name,
      alias: data.table_alias,
      description: data.table_description,
    };

    console.log("UPDATE SCHEMA TABLE: ", dataFormatted);

    const response = await fetch(
      `${process.env.BASE_URL}/schema-table/${data.table_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFormatted),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update schema table");
    }
    return {
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    console.error("Error updating schema table: ", error);
  }
}

export async function UpdateSchemaColumn(data: ISchemaColumn) {
  try {
    const formattedData = {
      alias: data.column_alias,
      description: data.column_description,
    };

    console.log("UPDATE SCHEMA COLUMN: ", formattedData);

    const response = await fetch(
      `${process.env.BASE_URL}/schema-column/${data.column_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update schema table");
    }
    return {
      status: response.status,
      message: response.statusText,
    };
  } catch (error) {
    console.error("Error updating schema column: ", error);
  }
}

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
