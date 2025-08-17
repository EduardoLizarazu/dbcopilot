import OpenAI from "openai";

// Configuration for OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calls the AI model to generate SQL
 */
export async function callAIModel(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use "gpt-3.5-turbo" for faster/cheaper results
      messages: [
        {
          role: "system",
          content:
            "You are a SQL expert that generates safe, efficient database queries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for deterministic output
      max_tokens: 500,
      top_p: 0.1,
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("AI API Error:", error);
    throw new Error("Failed to generate SQL from AI model");
  }
}
