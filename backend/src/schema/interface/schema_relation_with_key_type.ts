import { z } from 'zod';
export type TSchemaRelationWithKeyType = {
  columnIdFather: number;
  columnIdChild: number;
  description: string | null;
  isStatic: boolean;
};

export const verifiedSchemaRelationWithKeyType = (
  data: TSchemaRelationWithKeyType,
) => {
  const schemaRelationWithKeyType = z.object({
    columnIdFather: z.number().positive().int(),
    columnIdChild: z.number().positive().int(),
    description: z.string().nullable(),
    isStatic: z.boolean(),
  });

  try {
    return schemaRelationWithKeyType.parse(data);
  } catch (error) {
    console.error('Error validating schema relation with key type:', error);
    return null;
  }
};
