"use server";
interface RowData {
  tableId: number;
  tableName: string;
  tableDesc: string;
  columns: { columnId: number; columnName: string; columnDesc: string }[];
}
const rows: RowData[] = [
  {
    tableId: 1,
    tableName: "Users",
    tableDesc: "User information",
    columns: [
      { columnId: 1, columnName: "user_id", columnDesc: "User ID" },
      { columnId: 2, columnName: "username", columnDesc: "Username" },
      { columnId: 3, columnName: "email", columnDesc: "Email" },
    ],
  },
  {
    tableId: 2,
    tableName: "Products",
    tableDesc: "Product information",
    columns: [
      { columnId: 1, columnName: "product_id", columnDesc: "Product ID" },
      { columnId: 2, columnName: "product_name", columnDesc: "Product Name" },
      { columnId: 3, columnName: "price", columnDesc: "Price" },
    ],
  },
  {
    tableId: 3,
    tableName: "Orders",
    tableDesc: "Order information",
    columns: [
      { columnId: 1, columnName: "order_id", columnDesc: "Order ID" },
      { columnId: 2, columnName: "user_id", columnDesc: "User ID" },
      { columnId: 3, columnName: "product_id", columnDesc: "Product ID" },
    ],
  },
];

interface IReadSchemaData {
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
