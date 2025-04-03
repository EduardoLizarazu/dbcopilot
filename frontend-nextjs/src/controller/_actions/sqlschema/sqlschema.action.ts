"use server";
interface SqlSchemaAction {
  id: number;
  name: string;
  type: string;
  sqlSchema: string;
}

const BASE_URL = process.env.BASE_URL;

export const readAllSqlSchemaAction = async (): Promise<SqlSchemaAction[]> => {
  const response = await fetch(`${BASE_URL}/databasetype`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch SQL schema actions');
  }
  return response.json();
}