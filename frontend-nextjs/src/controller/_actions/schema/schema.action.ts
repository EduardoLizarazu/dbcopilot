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

export async function GetSchemaData() {
  return rows;
}

export async function ReadSchemaData(connectionId: number): Promise<IReadSchemaData[]> {
  try {
    // fetch schema data from the database using the connectionId
    const response = await fetch(`${process.env.BASE_URL}/schema/${connectionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch schema data');
    }
    const data: IReadSchemaData[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error finding schema by connection ID: ', error);
    return []; // Return an empty array in case of an error
  }
}

// Find all table by connection id
export async function ReadAllTableByConnectionId(connectionId: number): Promise<ISchemaTable[]> {
  try {
    const response = await fetch(`${process.env.BASE_URL}/schema/connection/${connectionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch schema data');
    }
    const data: ISchemaTable[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error finding all tables by connection ID: ', error);
    return []; // Return an empty array in case of an error
  }
}