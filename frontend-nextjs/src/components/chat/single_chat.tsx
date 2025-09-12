"use client";
import React, { Suspense } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
} from "@mui/material";
import { ChatBtnAction } from "@/components/chat/prompt/chatBtnAction";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
// import { ChatFeedbackBtn } from "@/components/chat/prompt/chatFeedbackBtn";
import { ChatFeedbackBtn } from "@/components/chat/chatFeedbackBtn";
// import { CreatePrompt } from "@/controller/_actions/chat/command/create-prompt";
import { CreatePrompt } from "@/controller/_actions/chat/create-prompt";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { useRouter } from "next/navigation";
import { searchWithQuery } from "@/controller/_actions/nlq/vbd/find-by-prompt";

interface Props {
  previousConversation?: {
    chatId: string;
    prompt: string;
    results: any;
    row_count: number;
  } | null;
}

export function SingleChat(
  { previousConversation = null }: Props = { previousConversation: null }
) {
  const router = useRouter();

  // CONTEXT
  const { setFeedback } = useFeedbackContext();

  // STATE
  const [promptId, setPromptId] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState<string>(
    previousConversation?.prompt ?? ""
  );
  const [result, setResult] = React.useState<{
    error?: string | null;
    data: Record<string, unknown>[];
  }>({ data: [], error: null });

  // State of similar prompts reset
  const [similarPrompts, setSimilarPrompts] = React.useState<unknown[]>([]);

  const [isResetHf, setIsResetHf] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  // const prevPromptRef = React.useRef(prompt);
  React.useEffect(() => {
    // if (prevPromptRef.current === prompt) return;
    (async () => {
      // prevPromptRef.current = prompt;
      if (prompt.length === 0) {
        setSimilarPrompts([]);
        return;
      }
      // const results = await searchWithQuery(prompt);
      // const results_question = results.map((r) => r.metadata?.question);

      // setSimilarPrompts(results_question);
      // console.log(prevPromptRef.current, prompt);
    })();
  }, [prompt]);

  // HANDLERS
  async function handleSubmitPrompt() {
    if (!prompt.trim()) return;
    setIsResetHf(true);
    setSubmitting(true);

    try {
      const response = await CreatePrompt({ prompt });

      const hasError =
        Boolean(response?.error) &&
        typeof response.error === "string" &&
        response.error.trim().length > 0;

      if (hasError) {
        setResult({ data: [], error: response.error });
        setFeedback({
          isActive: true,
          message: response.error ?? "Unknown error",
          severity: "error",
        });
        return;
      }

      setResult({ data: response.results || [], error: null });
      setPromptId(response.id_prompt ?? null);

      setFeedback({
        isActive: true,
        message: "Prompt submitted successfully",
        severity: "success",
      });
    } catch (error) {
      setResult({ data: [], error: "Failed to connect to the API" });
      setFeedback({
        isActive: true,
        message: "Network error occurred",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
      setIsResetHf(false);
    }
  }

  function handleReset() {
    setPrompt("");
    setPromptId(null);
    setResult({ data: [], error: null });
    setIsResetHf(true);
  }

  function handleResetBySelectedHistoryPrompt() {
    setPromptId(null);
    setResult({ data: [], error: null });
    setIsResetHf(true);
  }

  return (
    <Container>
      <Suspense fallback={<CircularProgress />}>
        <Stack spacing={3} direction="column">
          {/* Header */}
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h4">Chat with your database</Typography>
          </Stack>
          {/* Similar Prompts [ "Give me pb7300", "question form admin test" ] */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Similar Questions:
            </Typography>
            {similarPrompts.length > 0 && (
              <>
                <List>
                  {similarPrompts.map((sp, index) => (
                    <ListItem
                      // button effects with pointer cursor and hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "lightgray" },
                      }}
                      key={index}
                      onClick={() => setPrompt((sp as string) || "")}
                    >
                      {typeof sp === "string" ? sp : String(sp)}
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
          {/* Prompt */}
          <Box
            component="form"
            sx={{ "& .MuiTextField-root": { minWidth: 100 } }}
            autoComplete="off"
          >
            <TextField
              id="prompt-standard-textarea"
              label="prompt"
              placeholder="Write your prompt here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              variant="filled"
              rows={4}
              fullWidth
              disabled={submitting}
            />
            {promptId !== null && (
              <ChatFeedbackBtn promptId={promptId} isReset={isResetHf} />
            )}
          </Box>

          {/* Error (inline) */}
          {result?.error ? (
            <Alert severity="error">{result.error}</Alert>
          ) : null}

          {/* Actions */}
          <ChatBtnAction
            handleSubmitPrompt={handleSubmitPrompt}
            handleReset={handleReset}
          />

          {/* Results (no tabs — just the table) */}
          {submitting ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ChatResultTable data={result?.data || []} />
          )}
        </Stack>
      </Suspense>
    </Container>
  );
}
