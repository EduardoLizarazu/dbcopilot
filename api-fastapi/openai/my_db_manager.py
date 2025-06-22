import psycopg2
from psycopg2 import sql
import re
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add to your environment variables
POSTGRES_HOST = os.getenv("MY_POSTGRES_HOST")
POSTGRES_PORT = os.getenv("MY_POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("MY_POSTGRES_DB")
POSTGRES_USER = os.getenv("MY_POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("MY_POSTGRES_PASSWORD")


class MyDbManager:
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

    def save_query(self, prompt: str, sql_query: str):
        """Save query and results to the database"""
        try:
            with self.conn.cursor() as cursor:
                insert_query = sql.SQL('INSERT INTO "prompt" (prompt, sql_query) VALUES (%s, %s)')
                print(f"Values to insert: {prompt}, {sql_query}")
                cursor.execute(insert_query, (str(prompt), str(sql_query)))
                self.conn.commit()
                logger.info("Query saved successfully")

        except psycopg2.Error as e:
            logger.error(f"Failed to save query: {str(e)}")
            raise RuntimeError(f"Database error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while saving query: {str(e)}")
            raise RuntimeError(f"Execution error: {str(e)}")

    def save_query_error(self, prompt: str, sql_query: str, error: str):
        """Save query and results to the database"""
        try:
            with self.conn.cursor() as cursor:
                insert_query = sql.SQL("""
                    INSERT INTO prompt (prompt, sql_query, message_error)
                    VALUES (%s, %s, %s)
                """)
                cursor.execute(insert_query, (prompt, sql_query, error))
                self.conn.commit()
                logger.info("Query saved successfully")

        except psycopg2.Error as e:
            logger.error(f"Failed to save query: {str(e)}")
            raise RuntimeError(f"Database error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error while saving query: {str(e)}")
            raise RuntimeError(f"Execution error: {str(e)}")


    def close(self):
        if hasattr(self, 'conn') and self.conn:
            self.conn.close()
            logger.info("PostgreSQL connection closed")