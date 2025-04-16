"use server";

import { revalidatePath } from "next/cache";
import {
  convertToConnectionInput,
  InputTestConn,
} from "./interface/connection_test.interface";
import {
  ConnectionCreateInput,
  convertToConnectionCreateInput,
} from "./interface/connection_create.interface";

const CONTEXT_PATH = "/connection";

export interface TestConnOutput {
  schema: string;
  result: boolean;
}

export interface ReadDatabaseTypeOutput {
  id: number;
  name: string;
  type: string;
}

export interface CreateConnectionInput {
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword?: string;
  dbTypeId: number;
  is_connected: boolean;
}

export interface ReadConnectionOutput extends CreateConnectionInput {
  id: number;
  dbType: string; // Added dbType field
}

export type UpdateConnectionInput = CreateConnectionInput;

const BASE_URL = process.env.BASE_URL;

export const ReadConnectionAction = async (): Promise<
  ReadConnectionOutput[]
> => {
  try {
    const response = await fetch(`${BASE_URL}/connection`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch SQL schema actions");
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
      is_connected: item.is_connected,
    }));

    console.log("Parsed data:", output);

    return output;
  } catch (error) {
    console.error("Error fetching SQL schema actions:", error);
    throw new Error("Failed to fetch SQL schema actions");
  }
};

export const DeleteConnectionAction = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/connection/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error deleting connection:", error);
    throw new Error("Failed to delete connection");
  }
};

export const CreateConnectionAction = async (input: ConnectionCreateInput) => {
  try {
    // Validate input
    const inputVerified = convertToConnectionCreateInput(input);

    const response = await fetch(`${BASE_URL}/connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputVerified),
    });

    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error creating connection:", error);
    throw new Error("Failed to create connection");
  }
};

export const ReadAllDatabaseTypeAction = async (): Promise<
  ReadDatabaseTypeOutput[]
> => {
  try {
    const response = await fetch(`${BASE_URL}/databasetype`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch database types");
    }
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
    }));
  } catch (error) {
    console.error("Error fetching database types:", error);
    throw new Error("Failed to fetch database types");
  }
};

export const ReadConnectionByIdAction = async (
  id: number
): Promise<ReadConnectionOutput> => {
  try {
    const response = await fetch(`${BASE_URL}/connection/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch connection by ID");
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
      is_connected: data.is_connected,
    };

    return output;
  } catch (error) {
    console.error("Error fetching connection by ID:", error);
    throw new Error("Failed to fetch connection by ID");
  }
};

export const UpdateConnectionAction = async (
  id: number,
  input: UpdateConnectionInput
) => {
  try {
    // Validate input
    // const inputVerified = convertToConnectionCreateInput(input);

    const response = await fetch(`${BASE_URL}/connection/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error updating connection:", error);
    return {
      status: 500,
    };
  }
};

export const TestConnectionAction = async (input: InputTestConn) => {
  try {
    // Validate input
    const inputVerified = convertToConnectionInput(input);

    console.log("Testing connection with input:", input);

    const response = await fetch(`${BASE_URL}/connection/test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputVerified),
    });
    if (!response.ok) {
      return {
        status: response.status,
      };
    }

    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error testing connection:", error);
  }
};

export const TestConnectionActionByConnId = async (connId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/connection/test/${connId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      status: response.status,
    };
  } catch (error) {
    console.error("Error testing connection by ID:", error);
    return {
      status: 500,
    };
  }
};
