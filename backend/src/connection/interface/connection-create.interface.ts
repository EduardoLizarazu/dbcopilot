import { z } from 'zod';

// Basic boolean schema
export interface ConnectionCreate {
  id: number;
  name: string;
  description: string;
  dbName: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword?: string;
  is_connected: boolean;
  databasetypeId: { id: number }; // Foreign key to Databasetype
}

export const ValidateConnectionCreate = (data: unknown): ConnectionCreate => {
  // validate data with zod schema
  const schema = z.object({
    id: z.number().positive().int(), // Ensure id is a positive integer
    name: z.string(),
    description: z.string(),
    dbName: z.string(),
    dbHost: z.string(),
    dbPort: z.number().int().positive(), // Ensure dbPort is a positive integer
    dbUsername: z.string(),
    dbPassword: z.string(),
    is_connected: z.boolean(),
    databasetypeId: z.object({
      id: z.number().positive().int(), // Ensure databasetypeId is a positive integer
    }),
  });
  try {
    return schema.parse(data); // parse and validate data
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors); // Log validation errors
    }
    throw new Error('Validation failed'); // Throw a generic error
  }
};
