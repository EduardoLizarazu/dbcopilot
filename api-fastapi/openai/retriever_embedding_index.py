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

class Neo4jEmbeddingManager:

    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.embedding_model = EMBEDDING_MODEL
        self.embedding_dim = EMBEDDING_DIM

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

def embed_and_index():
    # Initialize manager
    embedding_manager = Neo4jEmbeddingManager(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

    # Generate and store embeddings (with smaller batch size for safety)
    try:
        embedding_manager.generate_embeddings(batch_size=5)
        embedding_manager.create_vector_indexes()
        embedding_manager.verify_embeddings()
    except Exception as e:
        print(f"Error in embedding pipeline: {e}")
    finally:
        embedding_manager.close()
        print("Embedding pipeline completed!")

def check_embeddings():
    with GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)) as driver:
        # Check tables
        tables = driver.execute_query(
            "MATCH (t:Table) RETURN t.name AS name, t.embedding IS NOT NULL AS has_embedding LIMIT 5"
        )
        print("Table Embeddings:")
        for record in tables.records:
            print(f"{record['name']}: {'Has embedding' if record['has_embedding'] else 'No embedding'}")

        # Check columns
        columns = driver.execute_query(
            "MATCH (c:Column) RETURN c.name AS name, c.embedding IS NOT NULL AS has_embedding LIMIT 5"
        )
        print("\nColumn Embeddings:")
        for record in columns.records:
            print(f"{record['name']}: {'Has embedding' if record['has_embedding'] else 'No embedding'}")

def test_graphrag_search(query_text, top_k=5, column_top_k=3):
    with GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD)) as driver:
        # Get query embedding
        response = openai.embeddings.create(
            input=[query_text],
            model=EMBEDDING_MODEL
        )
        embedding = response.data[0].embedding

        # Stage 1: Semantic table search
        table_results = driver.execute_query("""
        CALL db.index.vector.queryNodes('table_embeddings', $top_k, $embedding)
        YIELD node AS table_node, score AS table_score
        RETURN table_node.name AS table_name, table_score
        ORDER BY table_score DESC
        """, {"top_k": top_k, "embedding": embedding})

        final_results = []
        for table_record in table_results.records:
            table_name = table_record["table_name"]
            table_score = table_record["table_score"]

            # Stage 2: Semantic column search for this table
            column_results = driver.execute_query("""
            CALL db.index.vector.queryNodes('column_embeddings', $column_top_k, $embedding)
            YIELD node AS col, score AS column_score
            MATCH (col)<-[:HAS_COLUMN]-(t:Table {name: $table_name})
            RETURN col.name AS column_name,
                   col.type AS column_type,
                   col.description AS column_description,
                   column_score
            ORDER BY column_score DESC
            """, {"embedding": embedding, "table_name": table_name, "column_top_k": column_top_k})

            # Get relationships for join conditions
            relationship_results = driver.execute_query("""
            MATCH (t:Table {name: $table_name})-[r:RELATED_TO]->(related)
            RETURN related.name AS related_table,
                   r.from_column + " = " + r.to_column AS join_condition,
                   r.description AS relationship_desc
            """, {"table_name": table_name})

            final_results.append({
                "table": table_name,
                "table_score": table_score,
                "columns": [dict(record) for record in column_results.records],
                "relationships": [dict(record) for record in relationship_results.records]
            })

        # Print optimized results
        print(f"\n🔍 GraphRAG Results for: '{query_text}'\n")
        for result in sorted(final_results, key=lambda x: x["table_score"], reverse=True):
            print(f"📌 Table: {result['table']} (Score: {result['table_score']:.2f})")

            if result["columns"]:
                print("\n✅ Relevant Columns:")
                for col in result["columns"]:
                    print(f"   - {col['column_name']} ({col['column_type']}): {col['column_description']}")

            if result["relationships"]:
                print("\n🔗 Join Paths:")
                for rel in result["relationships"]:
                    print(f"   - JOIN {rel['related_table']} ON {rel['join_condition']}")
                    print(f"     ({rel['relationship_desc']})")

            print("\n" + "="*50 + "\n")