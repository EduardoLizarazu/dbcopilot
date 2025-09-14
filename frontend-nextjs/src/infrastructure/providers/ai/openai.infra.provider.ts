import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
export const CHAT_MODEL = "gpt-4o-mini"; // fast, good reasoning
export const EMBEDDING_MODEL = "text-embedding-3-small"; // cost-effective
