from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from graphrag import GraphRAGSQLGenerator, initialize_graphrag
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain_community.chat_models import ChatOpenAI
from pydantic import BaseModel
import uuid
from dotenv import load_dotenv
import os

from openai.building_graphrag import set_up_schema_loader
from openai.retriever_embedding_index import embed_and_index

# Load environment variables
load_dotenv()

app = FastAPI()

global generator 

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/setup_schema")
async def setup_endpoint():
    try:
        set_up_schema_loader()
        return {"message": "Schema setup completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("setup_graphrag")
async def setup_graphrag_endpoint():
    try:
        embed_and_index()
        return {"message": "GraphRAG setup completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# set up generator
generator = GraphRAGSQLGenerator()
@app.post("setup_generator")
async def startup_generator():
    global generator
    try:
        generator = GraphRAGSQLGenerator()
        return {"message": "GraphRAGSQLGenerator initialized successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def chat_endpoint(query: str):
    try:
        generated_sql = generator.execute_pipeline(query)
        return {"query": query, "generated_sql": generated_sql}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)