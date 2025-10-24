const schemaV2 = [
  // ===== public schema =====
  // Renombrada tabla: users -> app_users
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "app_users",
    COLUMN_NAME: "id",
    data_type: "integer",
  },
  // Renombrada columna: username -> user_name
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "app_users",
    COLUMN_NAME: "user_name",
    DATA_TYPE: "varchar",
  },
  // Tipo actualizado (opcional según motor): email varchar -> citext
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "app_users",
    COLUMN_NAME: "email",
    DATA_TYPE: "citext",
  },
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "app_users",
    COLUMN_NAME: "created_at",
    DATA_TYPE: "timestamp",
  },
  // Columna añadida
  {
    TABLE_SCHEMA: "public",
    TABLE_NAME: "app_users",
    COLUMN_NAME: "last_login",
    DATA_TYPE: "timestamp",
  },

  // ===== sales -> commerce (renombrado el esquema) =====

  // customers (igual)
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "customers",
    COLUMN_NAME: "customer_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "customers",
    COLUMN_NAME: "first_name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "customers",
    COLUMN_NAME: "last_name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "customers",
    COLUMN_NAME: "email",
    DATA_TYPE: "varchar",
  },

  // orders (cambio tipo + columna nueva)
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "orders",
    COLUMN_NAME: "order_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "orders",
    COLUMN_NAME: "customer_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "orders",
    COLUMN_NAME: "order_date",
    DATA_TYPE: "date",
  },
  // total_amount numeric -> decimal(12,2)
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "orders",
    COLUMN_NAME: "total_amount",
    DATA_TYPE: "decimal(12,2)",
  },
  // columna nueva
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "orders",
    COLUMN_NAME: "status",
    DATA_TYPE: "varchar",
  },

  // order_items → ***ELIMINADO*** (no aparece en v2)

  // products (igual)
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "products",
    COLUMN_NAME: "product_id",
    DATA_TYPE: "integer",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "products",
    COLUMN_NAME: "name",
    DATA_TYPE: "varchar",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "products",
    COLUMN_NAME: "price",
    DATA_TYPE: "numeric",
  },

  // tabla nueva: order_returns
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "order_returns",
    COLUMN_NAME: "return_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "order_returns",
    COLUMN_NAME: "order_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "commerce",
    TABLE_NAME: "order_returns",
    COLUMN_NAME: "created_at",
    DATA_TYPE: "date",
  },

  // ===== hr schema =====

  // employees (columna eliminada + columna nueva)
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
  // department_id removida
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "employees",
    COLUMN_NAME: "location_id",
    DATA_TYPE: "integer",
  },

  // departments → ***ELIMINADO***

  // tabla nueva: locations
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "locations",
    COLUMN_NAME: "location_id",
    DATA_TYPE: "integer",
  },
  {
    TABLE_SCHEMA: "hr",
    TABLE_NAME: "locations",
    COLUMN_NAME: "location_name",
    DATA_TYPE: "varchar",
  },

  // ===== analytics schema → ***ELIMINADO*** =====

  // ===== nuevo esquema: billing =====
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "invoices",
    COLUMN_NAME: "invoice_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "invoices",
    COLUMN_NAME: "order_id",
    DATA_TYPE: "bigint",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "invoices",
    COLUMN_NAME: "issued_at",
    DATA_TYPE: "timestamp",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "invoices",
    COLUMN_NAME: "amount_due",
    DATA_TYPE: "numeric",
  },

  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "payments",
    COLUMN_NAME: "payment_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "payments",
    COLUMN_NAME: "invoice_id",
    DATA_TYPE: "uuid",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "payments",
    COLUMN_NAME: "paid_at",
    DATA_TYPE: "timestamp",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "payments",
    COLUMN_NAME: "amount",
    DATA_TYPE: "numeric",
  },
  {
    TABLE_SCHEMA: "billing",
    TABLE_NAME: "payments",
    COLUMN_NAME: "method",
    DATA_TYPE: "varchar",
  },
];

module.exports = { schemaV2 };
