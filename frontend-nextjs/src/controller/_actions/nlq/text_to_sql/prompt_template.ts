type promptTemplate = {
  user_question: string;
  db_type: string;
  physical_db_schema: string;
};

export function buildPromptTemplate(params: promptTemplate): string {
  const { user_question, db_type, physical_db_schema } = params;
  return `
        You are a SQL expert specialized in ${db_type} databases. 
        Generate a SELECT query that answers the user's question using ONLY the provided database schema.

        ### Database Schema (${db_type}):
        ${physical_db_schema}

        ### User Question:
        ${user_question}

        ### Instructions:
        1. Use ONLY the tables and columns from the provided schema
        2. Generate standard ${db_type} SQL without database-specific extensions
        3. Return ONLY the SQL query with no additional text
        4. Always use explicit JOIN syntax instead of implicit joins
        5. Include necessary WHERE clauses based on the question
        6. Use table aliases for readability
        7. Format the query for readability

        ### Response Format:
        Return ONLY the SQL query inside a code block:
        \`\`\`sql
        SELECT ... WHERE ...;
        \`\`\`
    `;
}
