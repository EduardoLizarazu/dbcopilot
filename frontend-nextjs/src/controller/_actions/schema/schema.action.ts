"use server";
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

export async function GetSchemaData() {
  return rows;
}
