import dotenv from "dotenv";
dotenv.config();

export const env = {
  openaiKey: process.env.OPENAI_API_KEY!,
  pineconeKey: process.env.PINECONE_API_KEY!,
  pineconeIndex: process.env.PINECONE_INDEX!,
};
