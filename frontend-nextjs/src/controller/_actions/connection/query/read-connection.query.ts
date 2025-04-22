"use server";

/**
 * 
 * {
    "id": 1,
    "name": "string",
    "description": "string",
    "dbName": "dbcopilot",
    "dbHost": "localhost",
    "dbPort": 5432,
    "dbUsername": "postgres",
    "is_connected": true,
    "databasetype": {
      "id": 1,
      "type": "postgres"
    }
  },
 */
export type TReadConnectionQry = {
  id: number;
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbTypeId: number;
  dbType: string;
  is_connected: boolean;
};

export async function ReadConnectionQry() {
  const response = await fetch(`${process.env.BASE_URL}/connection`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch connections");
  }
  const res = await response.json();

  const resFormatted: TReadConnectionQry[] = res.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    dbName: item.dbName,
    dbHost: item.dbHost,
    dbPort: item.dbPort,
    dbUsername: item.dbUsername,
    dbPassword: item.dbPassword,
    dbTypeId: item.databasetype.id,
    dbType: item.databasetype.type,
    is_connected: item.is_connected,
  }));

  return resFormatted;
}
