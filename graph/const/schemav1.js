// Dummy physical information schema extraction data.
// This file exports `nlqQaInformationSchemaExtraction` — an array of objects
// with the minimal fields: TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE.

const schemaV1 = [
  // public schema - users
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "users",
    COLUMN_NAME: "id",
    DATA_TYPE: "integer",
  },
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "users",
    COLUMN_NAME: "username",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "users",
    COLUMN_NAME: "email",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "users",
    COLUMN_NAME: "created_at",
    DATA_TYPE: "timestamp",
  },

  // sales schema - customers, orders, order_items, products
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "customers",
    COLUMN_NAME: "customer_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "customers",
    COLUMN_NAME: "first_name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "customers",
    COLUMN_NAME: "last_name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "customers",
    COLUMN_NAME: "email",
    DATA_TYPE: "varchar",
  },

  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "orders",
    COLUMN_NAME: "order_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "orders",
    COLUMN_NAME: "customer_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "orders",
    COLUMN_NAME: "order_date",
    DATA_TYPE: "date",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "orders",
    COLUMN_NAME: "total_amount",
    DATA_TYPE: "numeric",
  },

  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "order_items",
    COLUMN_NAME: "order_item_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "order_items",
    COLUMN_NAME: "order_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "order_items",
    COLUMN_NAME: "product_id",
    DATA_TYPE: "integer",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "order_items",
    COLUMN_NAME: "quantity",
    DATA_TYPE: "integer",
  },

  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "products",
    COLUMN_NAME: "product_id",
    DATA_TYPE: "integer",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "products",
    COLUMN_NAME: "name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "sales",
    TABLE_NAME: "products",
    COLUMN_NAME: "price",
    DATA_TYPE: "numeric",
  },

  // hr schema - employees, departments
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "employees",
    COLUMN_NAME: "emp_id",
    DATA_TYPE: "serial",
  },
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "employees",
    COLUMN_NAME: "first_name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "employees",
    COLUMN_NAME: "last_name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "employees",
    COLUMN_NAME: "department_id",
    DATA_TYPE: "integer",
  },

  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "departments",
    COLUMN_NAME: "department_id",
    DATA_TYPE: "integer",
  },
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "departments",
    COLUMN_NAME: "department_name",
    DATA_TYPE: "varchar",
  },

  // analytics schema - events
  {
    TABLE_SCHEMA: "analytics",
    TABLE_NAME: "events",
    COLUMN_NAME: "event_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "analytics",
    TABLE_NAME: "events",
    COLUMN_NAME: "user_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "analytics",
    TABLE_NAME: "events",
    COLUMN_NAME: "event_type",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "analytics",
    TABLE_NAME: "events",
    COLUMN_NAME: "occurred_at",
    DATA_TYPE: "timestamp",
  },
];

// Export for CommonJS. This keeps it simple to require() from Node for quick checks.
module.exports = { schemaV1 };
