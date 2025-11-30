import dotenv from "dotenv";
dotenv.config();

export const env = {
  openaiKey: process.env.OPENAI_API_KEY!,
  pineconeKey: process.env.PINECONE_API_KEY!,
  pineconeIndex: process.env.PINECONE_INDEX!,
  openaiModelToFineTune: process.env.OPENAI_MODEL_TO_FINE_TUNE!,
};
