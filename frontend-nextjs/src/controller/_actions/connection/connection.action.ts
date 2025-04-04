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
    console.log('Response:', response);
    
    const data: ReadConnectionOutput[] = await response.json();
    return data;
  }
  catch (error) {
    console.error('Error fetching SQL schema actions:', error);
    throw new Error('Failed to fetch SQL schema actions');
  }
}