import { z } from 'zod';

export interface CreateSchemaQuery {
  table_name: string;
  column_name?: string;
  data_type: string;
  primary_key?: string;
  foreign_key?: string;
  unique_key?: string;
  referenced_table?: string;
  referenced_column?: string;
}

export interface CreateDatabaseTypeQuery {
  name: string;
  type: string;
  query: string;
}

export const ValidateDatabaseTypeQuery = (data: unknown) => {
  const schema = z.object({
    name: z.string(),
    type: z.string(),
    query: z.string(),
  });
  try {
    return schema.parse(data);
  } catch (error) {
    // zod error
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    }
  }
};

export const ValidateSquemaQuery = (data: unknown) => {
  const schema = z.object({
    table_name: z.string(),
    column_name: z.string().optional(),
    data_type: z.string(),
    primary_key: z.string().optional(),
    foreign_key: z.string().optional(),
    unique_key: z.string().optional(),
    referenced_table: z.string().optional(),
    referenced_column: z.string().optional(),
  });
  try {
    return schema.parse(data);
  } catch (error) {
    // zod error
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
    }
  }
};
