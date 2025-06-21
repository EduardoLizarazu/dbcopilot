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

# Load environment variables
load_dotenv()

app = FastAPI()

# Session store
session_memories = {}

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize generator instance on demand
def get_generator():
    return GraphRAGSQLGenerator()

class Query(BaseModel):
    prompt: str
    session_id: str = None

@app.post("/setup")
async def setup_endpoint():
    try:
        result = initialize_graphrag()
        return {"status": "success", "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.post("/query")
async def chat_endpoint(query: Query):
    session_id = query.session_id or str(uuid.uuid4())
    
    # Get or create memory for this session
    if session_id not in session_memories:
        session_memories[session_id] = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
    
    memory = session_memories[session_id]
    
    # Initialize LangChain components (move this to startup in production)
    llm = ChatOpenAI(model=LLM_MODEL, temperature=0.1)
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=create_graph_retriever(),  # Implement this
        memory=memory,
        chain_type="stuff"
    )
    
    # Execute the chain
    result = qa_chain({"question": query.prompt})
    
    return {
        "session_id": session_id,
        "response": result["answer"],
        "chat_history": format_chat_history(memory)
    }

def format_chat_history(memory):
    return [
        {"role": msg.type, "content": msg.content} 
        for msg in memory.chat_history
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)