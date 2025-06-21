import json
from neo4j import GraphDatabase
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration with fallbacks
NEO4J_URI = os.getenv("NEO4J_URI", "")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "")


class Neo4jSchemaLoader:
    def __init__(self, uri, user, password):
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


def set_up_schema_loader():
    try:
        # Load JSON data
        with open("schema_table.json") as f:
            tables_data = json.load(f)

        with open("schema_relationship.json") as f:
            relationships_data = json.load(f)

        # Initialize loader
        loader = Neo4jSchemaLoader(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)

        # Clear existing data
        loader.clear_database()

        # Load schema
        loader.load_tables(tables_data)
        loader.load_relationships(relationships_data)

        # Verify connection
        loader.close()
        print("Schema loaded successfully!")
    except Exception as e:
        print(f"Error setting up schema loader: {e}")
        raise

