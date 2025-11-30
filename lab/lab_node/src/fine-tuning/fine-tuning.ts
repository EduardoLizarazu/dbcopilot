import { env } from "../env";
import { openai } from "../service/openai";
import fs from "fs";
import { createInterface } from "readline";

// Upload training data for fine-tuning:
// First, upload your training data to OpenAI. Once uploaded,
// you’ll receive a file ID that you’ll need to start the fine-tuning job.
export async function UploadFile() {
  try {
    const filePath = "src/data/train-data.jsonl";

    // Verify file is present and that at least some lines parse as JSON
    const verify = await verifyTrainingFile(filePath, 50);
    if (!verify.valid) {
      throw new Error(
        `Training file verification failed: ${verify.error ?? "invalid lines"}`
      );
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.on("open", () =>
      console.log("Read stream opened for training file")
    );
    fileStream.on("error", (err) =>
      console.error("Read stream error:", err.message)
    );

    const file = await openai.files.create({
      file: fileStream,
      purpose: "fine-tune",
    });

    console.log("File uploaded:", file.id);
    return file.id;
  } catch (error) {
    console.error("Error uploading file:", (error as Error).message);
    throw new Error("File upload failed");
  }
}

// Verify the `.jsonl` training file by checking existence and parsing the first N lines.
export async function verifyTrainingFile(
  filePath: string,
  maxLines = 10
): Promise<{ valid: boolean; linesChecked: number; error?: string }> {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
  } catch (err) {
    return {
      valid: false,
      linesChecked: 0,
      error: `File not found or not readable: ${(err as Error).message}`,
    };
  }

  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let checked = 0;
  try {
    for await (const rawLine of rl) {
      const line = rawLine.trim();
      if (line === "") continue;
      checked++;
      try {
        JSON.parse(line);
      } catch (err) {
        rl.close();
        stream.destroy();
        return {
          valid: false,
          linesChecked: checked,
          error: `Line ${checked} is not valid JSON: ${(err as Error).message}`,
        };
      }
      if (checked >= maxLines) break;
    }
    return { valid: true, linesChecked: checked };
  } catch (err) {
    return {
      valid: false,
      linesChecked: checked,
      error: (err as Error).message,
    };
  } finally {
    // graceful cleanup
    try {
      rl.close();
    } catch {}
    try {
      stream.close?.();
    } catch {}
  }
}

// Simple CLI entry: `npx ts-node src/fine-tuning/fine-tuning.ts --verify-file`
if (process.argv.includes("--verify-file")) {
  (async () => {
    const filePath = "src/data/train-data.jsonl";
    console.log("Verifying training file:", filePath);
    const result = await verifyTrainingFile(filePath, 100);
    console.log("Verification result:", result);
    if (!result.valid) process.exit(2);
    process.exit(0);
  })();
}

// Fine-Tune the Model with the uploaded file ID
async function FineTune(file_id: string) {
  try {
    const job = await openai.fineTuning.jobs.create({
      training_file: file_id,
      model: "gpt-3.5-turbo", // Model to fine-tune
    });

    console.log("Fine-tune started:", job.id);
    return job.id;
  } catch (err) {
    console.error("Error:", err);
    throw new Error("Fine-tuning failed");
  }
}

// Also you can check status of training by job ID:
async function track(job_id: string) {
  try {
    const events = await openai.fineTuning.jobs.listEvents(job_id);

    for (const ev of events.data) {
      console.log(`[${ev.created_at}] ${ev.level}: ${ev.message}`);
    }
  } catch (error) {
    console.error("Error tracking job:", (error as Error).message);
    throw new Error("Tracking job failed");
  }
}

// Real time tracking (optional)
async function trackRealtime(job_id: string) {
  try {
    let lastEventCount = 0;

    while (true) {
      const { data } = await openai.fineTuning.jobs.listEvents(job_id, {
        limit: 50,
      });

      // Detectar eventos nuevos
      const newEvents = data.slice(lastEventCount);

      for (const ev of newEvents) {
        console.log(`[${ev.created_at}] ${ev.level}: ${ev.message}`);
      }

      lastEventCount = data.length;

      // Si el entrenamiento terminó, salimos
      if (data[data.length - 1]?.message.includes("Training completed")) {
        break;
      }

      await new Promise((r) => setTimeout(r, 5000)); // esperar 5s
    }
  } catch (error) {
    console.error("Error tracking job in real-time:", (error as Error).message);
    throw new Error("Real-time tracking job failed");
  }
}

// Use the Fine-Tuned Model
const sessionMessages: Array<{
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}> = [
  {
    role: "system",
    content:
      "You are professional and very kind full stack developer and your name is Ariuka...",
  },
];

export async function chatWithFineTunedModel(userInput: string) {
  sessionMessages.push({ role: "user", content: userInput });
  const response = await openai.chat.completions.create({
    model: env.openaiModelToFineTune,
    messages: sessionMessages,
  });

  const assistantMessage =
    response.choices?.[0]?.message?.content ?? "No response provided";
  sessionMessages.push({ role: "assistant", content: assistantMessage });

  return assistantMessage;
}

export async function TestFineTuneOpenAi() {
  if (!env.openaiModelToFineTune)
    throw new Error(
      "OPENAI_FINE_TUNED_MODEL is not set in environment variables"
    );
  const fileId = await UploadFile();
  if (!fileId) throw new Error("File upload failed");
  const jobId = await FineTune(fileId);
  if (!jobId) throw new Error("Fine-tuning failed");
  console.log("Fine-tuning job started with ID:", jobId);
  await track(jobId);
  //   await trackRealtime(jobId);
}

export async function TestChatFineTunedModel() {
  const userInput = "What's your opinion on politics?";
  const response = await chatWithFineTunedModel(userInput);
  console.log("Response from fine-tuned model:", response);
}
