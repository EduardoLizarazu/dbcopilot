export function PromptBuilder(data: {
  dbType: string;
  question: string;
  similarKnowledgeBased: {
    id: string;
    score: number;
    question: string;
    query: string;
  }[];
  schemaBased: {
    SCHEMA_NAME: string;
    TABLE_NAME: string;
    COLUMN_NAME: string;
    DATA_TYPE: string;
  }[];
}) {
  return `
    You are a SQL expert specialized in ${data.dbType} databases. 
            Generate a SELECT query that answers the user's question using ONLY the provided database schema and the help of the similar questions with its sql and score to guide you.
    
            ### Database Type:
            ${data.dbType}
     
            ### Database Schema SQL:
            ${JSON.stringify(data.schemaBased)}
    
            ### User Question:
            ${JSON.stringify(data.question, null, 2)}
    
            ### Similar Questions with SQL:
            ${JSON.stringify(data.similarKnowledgeBased, null, 2)}
    
            ### Instructions:
            A) Scope & Validation
            1) Use ONLY the tables and columns present in the provided schema list.
            2) Build an internal map: schema.table -> {columns, datatypes}; validate every referenced column.
            3) Qualify tables as TABLE_SCHEMA.TABLE_NAME and use table aliases; qualify selected/filtered columns.
    
    
            B) Dialect: mssql
            5) Use standard T-SQL for SELECT/JOIN/WHERE/ORDER BY. Avoid vendor-specific features from other engines.
    
            C) Query Construction
            6) Always use explicit JOINs inferred from columns that exist on both sides (e.g., *_ID ↔ ID). Do not invent columns.
            7) Add necessary WHERE clauses implied by the question; respect datatypes (no quoting numerics; use parameters for strings/dates).
            8) Use table aliases; format the query with indentation and line breaks.
            9) When “top/latest/best” is implied, add a deterministic ORDER BY and (if needed) OFFSET … FETCH.
            10) Limit the query to SELECT statements only. Do not generate data-modifying queries.
            11) Answer only the sql query, do not add any explanations and without ";" at the end.
            12) Ignore D_E_L_E_T_E columns in all tables when constructing queries.
    
            D) Similarity Enforcement (STRICT)
            13) Let similarity_threshold = 0.95:
                - Validate the candidate SQL against the current schema map.
                - If score is greater than similarity_threshold, then, reuse it as-is, do not modify anything, generate it as it is. Do not add anything else!.
                - If score is less than similarity_threshold, then, minimally adapt invalid identifiers or may have to combine multiple similar items; if still invalid, return NOT_ANSWERED.
    
            E) Output & Fallback
            14) Return ONLY the SQL query, inside a code block, with no extra text and no trailing semicolon.
    
    
            ### Response Format, if you know the answer:
            Return ONLY the SQL query inside a code block:
            \`\`\`sql
              SELECT ...
              FROM schema.table AS t
              JOIN schema.other AS o ON ...
              WHERE ...
              ORDER BY ...
            \`\`\`
    
            ### Response Format, if you don't know the answer:
            \`\`\`NOT_ANSWERED
              I don't know because ...
            \`\`\`
            `;
}
