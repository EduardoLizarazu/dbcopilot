export interface INlqQaTopologyGenerationPort {
  genDetailQuestion(data: {
    question: string;
    query: string;
  }): Promise<{ detailQuestion: string }>;
  genTablesColumns(data: {
    query: string;
  }): Promise<{ tablesColumns: string[] }>;
  genSemanticFields(data: {
    question: string;
    query: string;
  }): Promise<{ semanticFields: { field: string; purpose: string }[] }>;
  genSemanticTables(data: {
    question: string;
    query: string;
  }): Promise<{ semanticTables: { table: string; purpose: string }[] }>;
  genFlags(data: {
    question: string;
    query: string;
  }): Promise<{ flags: { field: string; flag: string }[] }>;
  genThinkProcess(data: {
    question: string;
    query: string;
  }): Promise<{ think: string }>;
}
