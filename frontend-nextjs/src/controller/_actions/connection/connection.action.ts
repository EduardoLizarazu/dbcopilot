"use server";
export interface CreateConnectionInput {
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword?: string;
  dbType: { id: number; type: string };
}

export interface ReadConnectionOutput extends CreateConnectionInput {
  id: number;
}

export type UpdateConnectionInput = ReadConnectionOutput;


const BASE_URL = process.env.BASE_URL;

export const ReadConnectionAction = async (): Promise<ReadConnectionOutput> => {
  try {
    const response = await fetch(`${BASE_URL}/connection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch SQL schema actions');
    }
    const data = await response.json();

    const output: ReadConnectionOutput = {
      id: data.id,
      name: data.name,
      description: data.description,
      dbName: data.dbName,
      dbHost: data.dbHost,
      dbPort: data.dbPort,
      dbUsername: data.dbUsername,
      dbPassword: data.dbPassword,
      dbType: data.databasetype
    };

    return output;
  }
  catch (error) {
    console.error('Error fetching SQL schema actions:', error);
    throw new Error('Failed to fetch SQL schema actions');
  }
}