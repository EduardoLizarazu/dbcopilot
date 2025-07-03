import time
from neo4j import GraphDatabase
import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
NEO4J_URI = os.getenv("NEO4J_URI", "")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")


# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536  # Default dimension for text-embedding-3-small

LLM_MODEL = "gpt-4-turbo"
TOP_K_TABLES = 3
TOP_K_COLUMNS = 5

class GraphRAGSQLGenerator:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    def close(self):
        self.driver.close()

    def retrieve_schema_context(self, prompt_text):
        """Retrieve relevant schema context using vector search"""
        # Get query embedding
        response = openai.embeddings.create(
            input=[prompt_text],
            model=EMBEDDING_MODEL
        )
        embedding = response.data[0].embedding

        with self.driver.session() as session:
            # Retrieve relevant tables
            table_results = session.run("""
            CALL db.index.vector.queryNodes('table_embeddings', $top_k, $embedding)
            YIELD node, score
            RETURN node.name AS table_name, score AS table_score
            ORDER BY score DESC
            """, {"top_k": TOP_K_TABLES, "embedding": embedding})

            schema_context = ""
            for table_record in table_results:
                table_name = table_record["table_name"]
                table_score = table_record["table_score"]

                # Retrieve relevant columns for this table
                column_results = session.run("""
                CALL db.index.vector.queryNodes('column_embeddings', $top_k, $embedding)
                YIELD node, score
                MATCH (node)<-[:HAS_COLUMN]-(t:Table {name: $table_name})
                RETURN node.name AS column_name,
                       node.type AS column_type,
                       node.description AS column_description,
                       score
                ORDER BY score DESC
                """, {"top_k": TOP_K_COLUMNS, "embedding": embedding, "table_name": table_name})

                # Format table context
                table_context = f"\n\n### Table: {table_name} (Relevance: {table_score:.2f})\n"
                table_context += "Columns:\n"

                for col in column_results:
                    table_context += f"- {col['column_name']} ({col['column_type']}): {col['column_description']}\n"

                # Retrieve relationships
                relationship_results = session.run("""
                MATCH (t:Table {name: $table_name})-[r:RELATED_TO]->(related)
                RETURN related.name AS related_table,
                       r.from_column + " = " + r.to_column AS join_condition
                """, {"table_name": table_name})

                if relationship_results.peek():
                    table_context += "\nRelationships:\n"
                    for rel in relationship_results:
                        table_context += f"- JOIN {rel['related_table']} ON {rel['join_condition']}\n"

                schema_context += table_context

            return schema_context

    def generate_sql(self, prompt, schema_context):
        """Generate SQL using OpenAI with GraphRAG context"""
        system_message = f"""
        You are an expert SQL developer. Generate SQLPostgres-compatible SQL queries based on the given database schema context.

        Database Schema Context:
        {schema_context}

        Guidelines:
        1. Use ONLY tables and columns mentioned in the schema context
        2. Include necessary JOINs using the specified relationships
        3. Use table aliases for clarity
        4. Return ONLY the SQL query without explanations
        5. Ensure the query is safe and does not modify data
        6. If the query cannot be answered with the given schema, return "No valid SQL query can be generated."
        7. Use the following format for the SQL query:
        SELECT ... FROM table1 AS t1
        JOIN table2 AS t2 ON t1.column = t2.column
        WHERE ...
        8. Do not use ```sql SELECT ...``` format
        9. Do not include any comments or explanations in the SQL output.
        """

        response = openai.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()

    def execute_pipeline(self, user_prompt):
        """End-to-end query generation pipeline"""
        print(f"\n🔍 User Prompt: {user_prompt}")

        # Step 1: Retrieve schema context from GraphRAG
        schema_context = self.retrieve_schema_context(user_prompt)
        print("\n📚 Retrieved Schema Context:")
        print(schema_context)

        # Step 2: Generate SQL
        sql_query = self.generate_sql(user_prompt, schema_context)
        print("\n🚀 Generated SQL:")
        print(sql_query)

        return sql_query
    

def set_up_generator():
    """Set up the GraphRAGSQLGenerator instance"""
    generator = GraphRAGSQLGenerator()
    return generator