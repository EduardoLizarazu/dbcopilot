"use server";

import {
  CreateSqlSchemaActionInput,
  ReadSqlSchemaActionOutput,
} from "./interface/sqlschema_create.interface";

const BASE_URL = process.env.BASE_URL;

export const readAllSqlSchemaAction = async (): Promise<
  ReadSqlSchemaActionOutput[]
> => {
  try {
    const response = await fetch(`${BASE_URL}/databasetype`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch SQL schema actions");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching SQL schema actions:", error);
    throw new Error("Failed to fetch SQL schema actions");
  }
};

export const readSqlSchemaActionById = async (
  id: string
): Promise<ReadSqlSchemaActionOutput> => {
  const response = await fetch(`${BASE_URL}/databasetype/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch SQL schema action by ID");
  }
  return response.json();
};

export const createSqlSchemaAction = async (
  data: CreateSqlSchemaActionInput
): Promise<void> => {
  const response = await fetch(`${BASE_URL}/databasetype`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create SQL schema action");
  }
};

export const updateSqlSchemaAction = async (
  id: number,
  data: CreateSqlSchemaActionInput
): Promise<void> => {
  console.log("updateSqlSchemaAction", id, data);
  const response = await fetch(`${BASE_URL}/databasetype/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update SQL schema action");
  }
};

export const DeleteSqlSchemaAction = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}/databasetype/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return { status: response.status };
  } catch (error) {
    console.error("Error deleting SQL schema action:", error);
    return { status: 500 };
  }
};
