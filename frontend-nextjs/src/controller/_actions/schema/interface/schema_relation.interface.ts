export type TSchemaRelation = {
  columnIdFather: number;
  columnIdChild: number;
  description?: string;
  isStatic: boolean;
};

export type TSchemaRelationWithKeyType = {
  columnIdFather: number;
  columnIdChild: number;
  description: string | null;
  isStatic: boolean;
};
