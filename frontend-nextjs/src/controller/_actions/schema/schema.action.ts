"use server";
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
  column_name: string;
  column_alias: string;
  column_description?: string;
  column_data_type: string;
  foreign_key: number;
  primary_key: number;
  relation_description: string;
}

export async function GetSchemaData() {
  return rows;
}

export async function ReadSchemaData(
  connectionId: number
): Promise<IReadSchemaData[]> {
  try {
    // fetch schema data from the database using the connectionId
    const response = await fetch(
      `${process.env.BASE_URL}/schema/${connectionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch schema data");
    }
    const data: IReadSchemaData[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error finding schema by connection ID: ", error);
    return []; // Return an empty array in case of an error
  }
}

// Find all table by connection id
export async function ReadTableByConnectionId(
  connectionId: number
): Promise<ISchemaTable[]> {
  try {
    const response = await fetch(
      `${process.env.BASE_URL}/schema-table/connection/${connectionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch schema data");
    }
    const data: ISchemaTable[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error finding all tables by connection ID: ", error);
    return []; // Return an empty array in case of an error
  }
}

export async function ReadColumnByTableId(
  tableId: number
): Promise<ISchemaColumn[]> {
  try {
    console.log("READ COLUMN BY TABLE ID: ", tableId);
    const response = await fetch(
      `${process.env.BASE_URL}/schema-column/table/${tableId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch schema data");
    }
    const data = await response.json();

    const dataFormatted: ISchemaColumn[] = data.map((column: any) => ({
      column_id: column.id,
      column_name: column.technicalName,
      column_alias: column.alias,
      column_data_type: column.dataType,
      foreign_key: column.columnIdChild,
      primary_key: column.columnIdFather,
      relation_description: column.description,
    }));

    return dataFormatted;
  } catch (error) {
    console.error("Error finding all columns by table ID: ", error);
    return []; // Return an empty array in case of an error
  }
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
