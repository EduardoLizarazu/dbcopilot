from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from generation import GraphRAGSQLGenerator
from sql_retriever import QueryExecutor
from building_graphrag import set_up_schema_loader
from retriever_embedding_index import embed_and_index
import logging
from my_db_manager import MyDbManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Load environment variables
load_dotenv()

app = FastAPI()

generator = GraphRAGSQLGenerator()
# Add to your endpoint
executor = QueryExecutor()

my_executor = MyDbManager()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    prompt: str


@app.post("/setup_schema")
async def setup_endpoint():
    try:
        set_up_schema_loader()
        return {"message": "Schema setup completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/setup_graphrag")
async def setup_graphrag_endpoint():
    try:
        embed_and_index()
        return {"message": "GraphRAG setup completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add to your endpoint
@app.post("/query")
async def generate_sql_endpoint(query: QueryRequest):
    try:
        # Generate SQL
        # sql_query = generator.execute_pipeline(query.prompt)
        sql_query = "select * from customers"
        if sql_query == "No valid SQL query can be generated.":
            return {
                "prompt": query.prompt, 
                "sql": "", 
                "results": [], 
                "row_count": 0,
                "error": "No valid SQL query can be generated."
            }
                
        # Execute on PostgreSQL
        results = executor.execute_safe_query(sql_query)
        
        # Save the query to the database
        prompt_generated_id = my_executor.save_query(query.prompt, sql_query)
        return {
            "id_prompt": prompt_generated_id,
            "prompt": query.prompt,
            "sql": sql_query,
            "results": results,
            "row_count": len(results)
        }
        
    except ValueError as ve:
        # Validation error (non-SELECT query)
        my_executor.save_query_error(
            prompt=query.prompt,
            sql_query=sql_query,
            error=f"Validation Error: {str(ve)}"
        )
        raise HTTPException(status_code=400, detail=str(ve))
        
    except RuntimeError as re:
        # Query execution error
        my_executor.save_query_error(
            prompt=query.prompt,
            sql_query=sql_query,
            error=f"Execution Error: {str(re)}"
        )
        raise HTTPException(status_code=500, detail=str(re))
        
    except Exception as e:
        # Unexpected error
        my_executor.save_query_error(
            prompt=query.prompt,
            sql_query="N/A" if 'sql_query' not in locals() else sql_query,
            error=f"Unexpected Error: {str(e)}"
        )
        logger.exception("Unexpected error in endpoint")
        raise HTTPException(status_code=500, detail="Internal server error")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000, log_level="info")