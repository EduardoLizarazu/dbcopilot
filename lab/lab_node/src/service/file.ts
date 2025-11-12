import { writeFile, appendFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// __dirname is not defined in ES modules. Convert import.meta.url -> path.
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function saveAsFile(data: { prompt: string; response: string }) {
  try {
    const outDir = join(__dirname, "..", ".."); // ajusta según dónde quieras guardar
    const fileName = `chat_${Date.now()}.txt`;
    const filePath = join(outDir, fileName);
    const content = [
      "PROMPT:",
      data.prompt.trim(),
      "",
      "RESPONSE:",
      data.response.trim(),
    ].join("\n\n");
    await writeFile(filePath, content, { encoding: "utf8" });
    console.log("Saved chat to", filePath);
  } catch (error) {
    throw new Error("Error saving file: " + (error as Error).message);
  }
}
