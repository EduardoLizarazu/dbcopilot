"use server";

type TReadSqlQueryByPromptIdOutput = {
  data: unknown[];
  sqlQuery: string;
};

export async function ReadSqlQueryByPromptId(promptId: number) {
  try {
    // not working yet
    throw new Error("Not implemented yet");
    console.log("read sql query by promptId: ", promptId);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sqlquery/${promptId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    console.log("response read sql query by promptId: ", data);
    return data;
  } catch (error) {
    console.error("Error fetching SQL query by prompt ID:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
