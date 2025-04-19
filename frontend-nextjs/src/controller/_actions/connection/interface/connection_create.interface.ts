export interface ConnectionCreateInput {
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbTypeId: number;
  is_connected: false;
}

export const convertToConnectionCreateInput = (
  data: unknown
): ConnectionCreateInput => {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid input data");
  }

  const {
    name,
    description,
    dbName,
    dbHost,
    dbPort,
    dbUsername,
    dbPassword,
    dbTypeId,
    is_connected,
  } = data as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof dbName !== "string" ||
    typeof dbHost !== "string" ||
    typeof dbPort !== "number" ||
    typeof dbUsername !== "string" ||
    (dbPassword !== undefined && typeof dbPassword !== "string") ||
    typeof dbTypeId !== "number" ||
    // Check if is_connected is a boolean if it exists
    typeof is_connected !== "boolean" ||
    // Check if is_connected is false
    (is_connected !== undefined && is_connected !== false)
  ) {
    throw new Error("Invalid input data");
  }

  return {
    name,
    description,
    dbName,
    dbHost,
    dbPort,
    dbUsername,
    dbPassword: dbPassword as string,
    dbTypeId,
    is_connected: is_connected as false,
  };
};
