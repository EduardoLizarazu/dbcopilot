from neo4j import GraphDatabase
from langchain.schema import BaseRetriever
from langchain.schema import Document
import openai
import os
from dotenv import load_dotenv
import json
import time

# Load environment variables from .env file
load_dotenv()

# Configuration with fallbacks
NEO4J_URI = os.getenv("NEO4J_URI", "")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo")
EMBEDDING_DIM = 1536
TOP_K_TABLES = 3      # Number of top tables to retrieve
TOP_K_COLUMNS = 5     # Number of top columns per table

# Validate required configurations
if not NEO4J_URI:
    raise ValueError("NEO4J_URI environment variable is required")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required")

openai.api_key = OPENAI_API_KEY

class Neo4jSchemaLoader:
    def __init__(self, uri=None, user=None, password=None):
        uri = uri or NEO4J_URI
        user = user or NEO4J_USER
        password = password or NEO4J_PASSWORD
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def _execute_query(self, query, params=None):
        with self.driver.session() as session:
            session.run(query, params)

    def clear_database(self):
        self._execute_query("MATCH (n) DETACH DELETE n")

    def load_tables(self, tables):
        for table in tables:
            self._create_table_node(table)

    def _create_table_node(self, table):
        query = """
        MERGE (t:Table {name: $table_name})
        SET t.alias = $table_alias,
            t.description = $table_description
        """
        params = {
            "table_name": table["table_name"],
            "table_alias": table.get("table_alias", ""),
            "table_description": table.get("table_description", "")
        }
        self._execute_query(query, params)

        # Process columns
        for column in table["columns"]:
            self._create_column_node(table["table_name"], column)

    def _create_column_node(self, table_name, column):
        query = """
        MATCH (t:Table {name: $table_name})
        MERGE (c:Column {name: $column_name})
        SET c.alias = $column_alias,
            c.type = $column_type,
            c.key_type = $key_type,
            c.description = $column_description

        MERGE (t)-[r:HAS_COLUMN]->(c)
        SET r.source = "schema_table"
        """
        params = {
            "table_name": table_name,
            "column_name": column["column_name"],
            "column_alias": column.get("column_alias", ""),
            "column_type": column.get("column_type", ""),
            "key_type": column.get("key_type", ""),
            "column_description": column.get("column_description", "")
        }
        self._execute_query(query, params)

    def load_relationships(self, relationships):
        for rel in relationships:
            self._create_relationship_edge(rel)

    def _create_relationship_edge(self, relationship):
        query = """
        MATCH (from:Table {name: $from_table})
        MATCH (to:Table {name: $to_table})
        MERGE (from)-[r:RELATED_TO]->(to)
        SET r.from_column = $from_column,
            r.to_column = $to_column,
            r.description = $description,
            r.cardinality = $cardinality
        """
        params = {
            "from_table": relationship["from_table"],
            "to_table": relationship["to_table"],
            "from_column": relationship["from_column"],
            "to_column": relationship["to_column"],
            "description": relationship.get("description", ""),
            "cardinality": relationship.get("cardinality", "")
        }
        self._execute_query(query, params)

class Neo4jEmbeddingManager:
    def __init__(self, uri=None, user=None, password=None):
        uri = uri or NEO4J_URI
        user = user or NEO4J_USER
        password = password or NEO4J_PASSWORD
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.embedding_model = EMBEDDING_MODEL  # Add this line
        self.embedding_dim = EMBEDDING_DIM  # Add this line

    def _initialize_embedding_properties(self):
        """Create embedding property if it doesn't exist"""
        queries = [
            "MATCH (t:Table) WHERE NOT EXISTS(t.embedding) SET t.embedding = null",
            "MATCH (c:Column) WHERE NOT EXISTS(c.embedding) SET c.embedding = null"
        ]
        for query in queries:
            try:
                self._execute_query(query)
            except Exception as e:
                print(f"Error initializing properties: {e}")

    def close(self):
        self.driver.close()

    def _execute_query(self, query, params=None):
        with self.driver.session() as session:
            result = session.run(query, params)
            return list(result)  # Convert to list to consume results

    def generate_embeddings(self, batch_size=10):
        """Generate and store embeddings for all nodes"""
        # First ensure the embedding property exists
        self._initialize_embedding_properties()

        # Then generate embeddings
        self._generate_table_embeddings(batch_size)
        self._generate_column_embeddings(batch_size)

    def _initialize_embedding_properties(self):
        """Ensure embedding property exists on all nodes"""
        queries = [
            "MATCH (t:Table) WHERE t.embedding IS NULL SET t.embedding = null",
            "MATCH (c:Column) WHERE c.embedding IS NULL SET c.embedding = null"
        ]
        for query in queries:
            try:
                self._execute_query(query)
            except Exception as e:
                print(f"Error initializing properties: {e}")

    def _generate_table_embeddings(self, batch_size):
        """Generate embeddings for Table nodes"""
        # Fetch tables needing embeddings
        tables = self._execute_query(
            "MATCH (t:Table) WHERE t.embedding IS NULL RETURN t.name AS name, t.description AS description"
        )

        for i in range(0, len(tables), batch_size):
            batch = tables[i:i+batch_size]
            texts = [
                f"Table: {table['name']}\nDescription: {table.get('description', '')}"
                for table in batch
            ]

            # Generate embeddings via OpenAI
            try:
                embeddings = self._get_openai_embeddings(texts)
            except Exception as e:
                print(f"Error generating embeddings: {e}")
                continue

            # Update nodes with embeddings
            for idx, table in enumerate(batch):
                try:
                    self._execute_query(
                        "MATCH (t:Table {name: $name}) SET t.embedding = $embedding",
                        {"name": table['name'], "embedding": embeddings[idx]}
                    )
                except Exception as e:
                    print(f"Error updating table {table['name']}: {e}")

            time.sleep(1)  # Rate limit protection

    def _generate_column_embeddings(self, batch_size):
        """Generate embeddings for Column nodes"""
        # Fetch columns needing embeddings
        columns = self._execute_query(
            """MATCH (t:Table)-[:HAS_COLUMN]->(c:Column)
            WHERE c.embedding IS NULL
            RETURN c.name AS name, t.name AS table_name,
                   c.description AS description, c.type AS type"""
        )

        for i in range(0, len(columns), batch_size):
            batch = columns[i:i+batch_size]
            texts = [
                f"Column: {col['name']}\nTable: {col['table_name']}\n"
                f"Type: {col.get('type', '')}\nDescription: {col.get('description', '')}"
                for col in batch
            ]

            # Generate embeddings via OpenAI
            try:
                embeddings = self._get_openai_embeddings(texts)
            except Exception as e:
                print(f"Error generating embeddings: {e}")
                continue

            # Update nodes with embeddings
            for idx, col in enumerate(batch):
                try:
                    self._execute_query(
                        """MATCH (c:Column {name: $name})<-[:HAS_COLUMN]-(t:Table {name: $table_name})
                        SET c.embedding = $embedding""",
                        {
                            "name": col['name'],
                            "table_name": col['table_name'],
                            "embedding": embeddings[idx]
                        }
                    )
                except Exception as e:
                    print(f"Error updating column {col['name']}: {e}")

            time.sleep(1)  # Rate limit protection

    def _get_openai_embeddings(self, texts):
        """Get embeddings from OpenAI API"""
        response = openai.embeddings.create(
            input=texts,
            model=self.embedding_model
        )
        return [embedding.embedding for embedding in response.data]

    def create_vector_indexes(self):
        """Create vector indexes in Neo4j"""
        # First check if indexes exist
        existing_indexes = self._execute_query(
            "SHOW INDEXES WHERE type = 'VECTOR'"
        )

        # Drop existing indexes if needed
        if any(idx['name'] == 'table_embeddings' for idx in existing_indexes):
            self._execute_query("DROP INDEX table_embeddings IF EXISTS")
        if any(idx['name'] == 'column_embeddings' for idx in existing_indexes):
            self._execute_query("DROP INDEX column_embeddings IF EXISTS")

        # Create new vector indexes
        self._execute_query(f"""
        CREATE VECTOR INDEX table_embeddings IF NOT EXISTS
        FOR (t:Table) ON (t.embedding)
        OPTIONS {{indexConfig: {{
            `vector.dimensions`: {self.embedding_dim},
            `vector.similarity_function`: 'cosine'
        }}}}
        """)

        self._execute_query(f"""
        CREATE VECTOR INDEX column_embeddings IF NOT EXISTS
        FOR (c:Column) ON (c.embedding)
        OPTIONS {{indexConfig: {{
            `vector.dimensions`: {self.embedding_dim},
            `vector.similarity_function`: 'cosine'
        }}}}
        """)

    def verify_embeddings(self):
        """Check embedding generation status"""
        stats = self._execute_query("""
        RETURN
            [(t:Table) WHERE t.embedding IS NOT NULL | count(t)][0] AS embedded_tables,
            [(c:Column) WHERE c.embedding IS NOT NULL | count(c)][0] AS embedded_columns
        """)[0]
        print(f"Embedded tables: {stats['embedded_tables']}")
        print(f"Embedded columns: {stats['embedded_columns']}")

class GraphRAGSQLGenerator:
    def __init__(self, uri=None, user=None, password=None):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        self.top_k_tables = TOP_K_TABLES    # Add this line
        self.top_k_columns = TOP_K_COLUMNS  # Add this line

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
            # Use the constants in your queries
            table_results = session.run("""
            CALL db.index.vector.queryNodes('table_embeddings', $top_k, $embedding)
            YIELD node, score
            RETURN node.name AS table_name, score AS table_score
            ORDER BY score DESC
            """, {"top_k": self.top_k_tables, "embedding": embedding})

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
        You are an expert SQL developer. Generate SQLite-compatible SQL queries based on the given database schema context.

        Database Schema Context:
        {schema_context}

        Guidelines:
        1. Use ONLY tables and columns mentioned in the schema context
        2. Include necessary JOINs using the specified relationships
        3. Use table aliases for clarity
        4. Return ONLY the SQL query without explanations
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

class GraphRetriever(BaseRetriever):
    def __init__(self, driver):
        self.driver = driver
    
    def get_relevant_documents(self, query):
        # 1. Get query embedding
        embedding = get_embedding(query)  # Implement using OpenAI
        
        # 2. Vector search in Neo4j
        with self.driver.session() as session:
            result = session.run("""
            CALL db.index.vector.queryNodes('table_embeddings', 3, $embedding)
            YIELD node, score
            RETURN node.name AS table, node.description AS description, score
            ORDER BY score DESC
            """, {"embedding": embedding})
            
            docs = []
            for record in result:
                docs.append(Document(
                    page_content=f"Table: {record['table']}\nDescription: {record['description']}",
                    metadata={"score": record["score"]}
                ))
            return docs

def create_graph_retriever():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    return GraphRetriever(driver)

# Utility function for one-time setup
def initialize_graphrag():
    """One-time setup function for GraphRAG"""
    try:
        # 1. Load schema data
        with open("schema_table.json") as f:
            tables_data = json.load(f)
        with open("schema_relationship.json") as f:
            relationships_data = json.load(f)
        
        # 2. Initialize and load schema
        loader = Neo4jSchemaLoader(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
        loader.clear_database()
        loader.load_tables(tables_data)
        loader.load_relationships(relationships_data)
        loader.close()
        print("✅ Schema loaded successfully")
        
        # 3. Initialize embeddings
        embedding_manager = Neo4jEmbeddingManager()
        
        # First create embedding properties using MERGE to ensure they exist
        print("🔄 Initializing embedding properties...")
        queries = [
            "MATCH (t:Table) SET t.embedding = null",
            "MATCH (c:Column) SET c.embedding = null"
        ]
        for query in queries:
            embedding_manager._execute_query(query)
        
        # Then generate embeddings
        print("🧠 Generating embeddings...")
        embedding_manager.generate_embeddings(batch_size=5)
        
        # Create vector indexes
        print("🔍 Creating vector indexes...")
        embedding_manager.create_vector_indexes()
        
        # Verify with fixed syntax
        print("🔎 Verifying setup...")
        stats = embedding_manager._execute_query("""
        MATCH (t:Table) 
        WHERE t.embedding IS NOT NULL 
        WITH count(t) AS embedded_tables
        MATCH (c:Column) 
        WHERE c.embedding IS NOT NULL 
        RETURN embedded_tables, count(c) AS embedded_columns
        """)[0]
        
        print(f"Embedded tables: {stats['embedded_tables']}")
        print(f"Embedded columns: {stats['embedded_columns']}")
        embedding_manager.close()
        
        return {
            "status": "GraphRAG initialized successfully",
            "tables_loaded": len(tables_data),
            "relationships_loaded": len(relationships_data),
            "embedded_tables": stats["embedded_tables"],
            "embedded_columns": stats["embedded_columns"]
        }
        
    except Exception as e:
        print(f"❌ Initialization failed: {str(e)}")
        raise RuntimeError(f"GraphRAG initialization failed: {str(e)}") from e