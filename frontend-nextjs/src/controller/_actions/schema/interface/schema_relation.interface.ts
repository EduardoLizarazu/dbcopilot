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

export type TSchemaRelationUpdate = {
  columnIdFather: number;
  columnIdChild: number;
  description: string;
};

export type TSchemaRelationWithKeyTypeDelete = Omit<
  TSchemaRelationWithKeyType,
  "isStatic" | "description"
>;

export type TSchemaRelationReadByIds = TSchemaRelationWithKeyTypeDelete;
