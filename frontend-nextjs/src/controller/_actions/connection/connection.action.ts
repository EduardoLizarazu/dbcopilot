"use server";

import { revalidatePath  } from "next/cache"


const CONTEXT_PATH = '/connection';


export interface TestConnOutput {schema: string, result: boolean};

export interface ReadDatabaseTypeOutput { id: number; name: string; type: string }

export interface CreateConnectionInput {
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword?: string;
  dbTypeId: number;
}

export interface ReadConnectionOutput extends CreateConnectionInput {
  id: number;
  dbType: string; // Added dbType field
}

export type UpdateConnectionInput = Omit<ReadConnectionOutput, 'dbType'>;


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

export const DeleteConnectionAction = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/connection/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete connection');
    }

    revalidatePath('/connection'); // Revalidate the path to refresh the data

  } catch (error) {
    console.error('Error deleting connection:', error);
    throw new Error('Failed to delete connection');
  }
}

export const CreateConnectionAction = async (input: CreateConnectionInput): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error('Failed to create connection');
    }

    revalidatePath(CONTEXT_PATH); // Revalidate the path to refresh the data

  } catch (error) {
    console.error('Error creating connection:', error);
    throw new Error('Failed to create connection');
  }
}

export const ReadAllDatabaseTypeAction = async (): Promise<ReadDatabaseTypeOutput[]> => {
  try {
    const response = await fetch(`${BASE_URL}/databasetype`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch database types');
    }
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
    }));
  } catch (error) {
    console.error('Error fetching database types:', error);
    throw new Error('Failed to fetch database types');
  }
}

export const ReadConnectionByIdAction = async (id: number): Promise<ReadConnectionOutput> => {
  try {
    const response = await fetch(`${BASE_URL}/connection/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch connection by ID');
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
      dbTypeId: data.databasetype.id,
      dbType: data.databasetype.type, 
    };

    return output;
  } catch (error) {
    console.error('Error fetching connection by ID:', error);
    throw new Error('Failed to fetch connection by ID');
  }
}

export const UpdateConnectionAction = async (input: UpdateConnectionInput): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/connection/${input.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error('Failed to update connection');
    }

    revalidatePath(CONTEXT_PATH); // Revalidate the path to refresh the data

  } catch (error) {
    console.error('Error updating connection:', error);
    throw new Error('Failed to update connection');
  }
}

export const TestConnectionAction = async (input: CreateConnectionInput): Promise<TestConnOutput> => {
  try {
    const response = await fetch(`${BASE_URL}/connection/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error('Failed to test connection');
    }

    const data = await response.json();

    console.log('Test connection response:', data);
    
    return data;
  } catch (error) {
    console.error('Error testing connection:', error);
    throw new Error('Failed to test connection');
  }
}