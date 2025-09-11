type promptTemplate = {
  user_question: string;
  db_type: string;
  physical_db_schema: string;
  vbd_similarity: unknown;
};

export function buildPromptTemplate(params: promptTemplate): string {
  const { user_question, db_type, physical_db_schema, vbd_similarity } = params;
  let physical_db_schema_string = params.physical_db_schema;
  /**
   * Transform vbd_similarity to string if it's not already 
   * [{
    TABLE_SCHEMA: 'TMPRD',
    TABLE_NAME: 'SC6300',
    COLUMN_NAME: 'C6_ID',
    DATA_TYPE: 'NUMBER',
    DATA_LENGTH: 22,
    DATA_PRECISION: 38,
    DATA_SCALE: 0,
    NULLABLE: 'Y',
    IS_PRIMARY_KEY: 'FALSE',
    IS_FOREIGN_KEY: 'FALSE',
    REFERENCED_TABLE_SCHEMA: null,
    REFERENCED_TABLE_NAME: null,
    REFERENCED_COLUMN_NAME: null
  },
  {
    TABLE_SCHEMA: 'TMPRD',
    TABLE_NAME: 'SC6300',
    COLUMN_NAME: 'C6_NUM',
    DATA_TYPE: 'NUMBER',
    DATA_LENGTH: 22,
    DATA_PRECISION: 38,
    DATA_SCALE: 0,
    NULLABLE: 'Y',
    IS_PRIMARY_KEY: 'FALSE',
    IS_FOREIGN_KEY: 'FALSE',
    REFERENCED_TABLE_SCHEMA: null,
    REFERENCED_TABLE_NAME: null,
    REFERENCED_COLUMN_NAME: null
    },...]
  */
  try {
    // Transform array of object to string physical_db_schema in the variable physical_db_schema_string con json
    physical_db_schema_string = JSON.stringify(physical_db_schema, null, 2);
  } catch (err) {
    console.error("Error transforming physical_db_schema:", err);
  }

  let vbd_similarity_string = params.vbd_similarity;
  try {
    // Transform array of object to string vbd_similarity in the variable vbd_similarity_string con json
    vbd_similarity_string = JSON.stringify(vbd_similarity, null, 2);
  } catch (err) {
    console.error("Error transforming vbd_similarity:", err);
  }

  return `
        You are a SQL expert specialized in ${db_type} databases. 
        Generate a SELECT query that answers the user's question using ONLY the provided database schema.

        ### Database Schema (${db_type}):
        ${physical_db_schema_string}

        ### User Question:
        ${user_question}

        ### Similar Questions with SQL:
        ${vbd_similarity_string}

        ### Instructions:
        1. Use ONLY the tables and columns from the provided schema
        2. Generate standard ${db_type} SQL without database-specific extensions
        3. Return ONLY the SQL query with no additional text
        4. Always use explicit JOIN syntax instead of implicit joins
        5. Include necessary WHERE clauses based on the question
        6. Use table aliases for readability
        7. Format the query for readability
        8. Use the similarity question as inspiration but adapt to the current question and schema
        9. Generate the sql without ";", even at the end of the query

        ### Response Format:
        Return ONLY the SQL query inside a code block:
        \`\`\`sql
        SELECT ... WHERE ...
        \`\`\`

    `;
}
