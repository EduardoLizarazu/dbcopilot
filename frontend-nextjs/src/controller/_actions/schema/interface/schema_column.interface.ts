type TSchemaTableSimple = {
  id: number;
  technicalName: string;
  alias: string | null;
  description: string | null;
};

export type TSchemaColumnWithTableSimple = {
  id: number;
  technicalName: string;
  alias: string | null;
  description: string | null;
  dataType: string;
  schemaTable: TSchemaTableSimple;
};
