"use server";
export interface CreateConnectionInput {
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword?: string;
  dbTypeId: number;
  dbType: string;
}

export interface ReadConnectionOutput extends CreateConnectionInput {
  id: number;
}

export type UpdateConnectionInput = ReadConnectionOutput;


const BASE_URL = process.env.BASE_URL;

export const ReadConnectionAction = async (): Promise<ReadConnectionOutput[]> => {
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

    // Check the object structure of the response
    const output: ReadConnectionOutput[] = data.map((item: any) => ({
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
    }));

    console.log('Parsed data:', output);
    
    return output;
  }
  catch (error) {
    console.error('Error fetching SQL schema actions:', error);
    throw new Error('Failed to fetch SQL schema actions');
  }
}