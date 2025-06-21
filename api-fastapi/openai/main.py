from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from generation import GraphRAGSQLGenerator
from sql_retriever import QueryExecutor
from building_graphrag import set_up_schema_loader
from retriever_embedding_index import embed_and_index
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Load environment variables
load_dotenv()

app = FastAPI()

generator = GraphRAGSQLGenerator()
# Add to your endpoint
executor = QueryExecutor()

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
        sql_query = generator.execute_pipeline(query.prompt)
        
        # Execute on PostgreSQL
        results = executor.execute_safe_query(sql_query)
        
        return {
            "prompt": query.prompt,
            "sql": sql_query,
            "results": results,
            "row_count": len(results)
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=500, detail=str(re))
    except Exception as e:
        logger.exception("Unexpected error in endpoint")
        raise HTTPException(status_code=500, detail="Internal server error")
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000, log_level="info")