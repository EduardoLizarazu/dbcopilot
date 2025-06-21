import psycopg2
from psycopg2 import sql
import re
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add to your environment variables
POSTGRES_HOST = os.getenv("POSTGRES_HOST")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")

class QueryExecutor:
    def __init__(self):
        try:
            self.conn = psycopg2.connect(
                host=POSTGRES_HOST,
                port=POSTGRES_PORT,
                dbname=POSTGRES_DB,
                user=POSTGRES_USER,
                password=POSTGRES_PASSWORD
            )
            logger.info("Connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"PostgreSQL connection failed: {str(e)}")
            raise RuntimeError(f"Database connection error: {str(e)}")
    
    def close(self):
        if hasattr(self, 'conn') and self.conn:
            self.conn.close()
            logger.info("PostgreSQL connection closed")

    def is_select_query(self, sql_query: str) -> bool:
        """Check if query is a safe SELECT statement"""
        # Remove comments and normalize
        normalized = re.sub(r"/\*.*?\*/", "", sql_query, flags=re.DOTALL)
        normalized = re.sub(r"--.*", "", normalized)
        normalized = normalized.strip().lower()
        
        # Check for allowed patterns
        return normalized.startswith(("select", "with")) and not any(
            keyword in normalized 
            for keyword in [
                "insert", "update", "delete", "drop", "alter", 
                "create", "truncate", "grant", "revoke", "lock", 
                "unlock", "merge", "execute", "explain", "copy"
            ]
        )

    def execute_safe_query(self, sql_query: str) -> list:
        """Execute query and return results if safe"""
        # Validate query type
        if not self.is_select_query(sql_query):
            logger.warning(f"Blocked non-SELECT query: {sql_query}")
            raise ValueError("Only SELECT queries are allowed")

        try:
            with self.conn.cursor() as cursor:
                logger.info(f"Executing SQL: {sql_query}")
                cursor.execute(sql_query)
                
                # Get column names
                columns = [desc[0] for desc in cursor.description]
                
                # Fetch results
                results = cursor.fetchall()
                
                # Format as list of dictionaries
                formatted_results = []
                for row in results:
                    formatted_row = {}
                    for i, value in enumerate(row):
                        # Handle various data types
                        if isinstance(value, (int, float, str, bool, type(None))):
                            formatted_row[columns[i]] = value
                        else:
                            # Convert other types to string
                            formatted_row[columns[i]] = str(value)
                    formatted_results.append(formatted_row)
                
                logger.info(f"Query returned {len(formatted_results)} rows")
                return formatted_results
                
        except psycopg2.Error as e:
            logger.error(f"Query execution failed: {str(e)}")
            raise RuntimeError(f"Database error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise RuntimeError(f"Execution error: {str(e)}")
        
    def save_query(self, prompt: str, sql_query: str, results: list):
        """Save query and results to the database"""
        try:
            with self.conn.cursor() as cursor:
                insert_query = sql.SQL("""
                    INSERT INTO prompt (title, prompt)
                    VALUES (%s, %s)
                """)
                cursor.execute(insert_query, ("", prompt))
                self.conn.commit()
                logger.info("Query saved successfully")

                insert_query = sql.SQL("""
                    INSERT INTO query (prompt_id, query, results)
                    VALUES (
                        (SELECT id FROM prompt WHERE prompt = %s),
                        %s,
                        %s
                    )
                """)

        except psycopg2.Error as e:
            logger.error(f"Failed to save query: {str(e)}")
            raise RuntimeError(f"Database error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while saving query: {str(e)}")
            raise RuntimeError(f"Execution error: {str(e)}")

