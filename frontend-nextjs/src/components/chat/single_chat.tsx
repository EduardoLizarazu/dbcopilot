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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ChatBtnAction } from "@/components/chat/prompt/chatBtnAction";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { ChatFeedbackBtn } from "@/components/chat/chatFeedbackBtn";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { useRouter } from "next/navigation";
import { CreateNlqQaAction } from "@/_actions/nlq-qa/create.action";
import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";

interface Props {
  props?: {
    prompt?: string;
  } | null;
}

export function SingleChat({ props = null }: Props = { props: null }) {
  const [dbConn, setDbConn] = React.useState<
    TDbConnectionOutRequestDtoWithVbAndUser[]
  >([]);
  const [dbConnId, setDbConnId] = React.useState<string | null>(null);

  // CONTEXT
  const { setFeedback } = useFeedbackContext();

  // STATE
  const [promptId, setPromptId] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState<string>(props?.prompt || "");
  const [result, setResult] = React.useState<{
    error?: string | null;
    data: Record<string, unknown>[];
  }>({ data: [], error: null });

  const [isResetHf, setIsResetHf] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        const dbConnData = await ReadAllDbConnectionAction();
        setDbConn(dbConnData.data || []);
      } catch (error) {
        setFeedback({
          isActive: true,
          message: `Error: ${error.message}`,
          severity: "error",
        });
      }
    })();
  }, []);

  // HANDLERS
  async function handleSubmitPrompt() {
    if (!prompt.trim()) return;
    setIsResetHf(true);
    setSubmitting(true);

    try {
      const response = await CreateNlqQaAction({
        question: prompt,
        dbConnectionId: dbConnId,
      });

      const hasError = response.data === null;
      if (hasError) {
        setResult({ data: [], error: response.message ?? "Unknown error" });
        return;
      }

      setResult({ data: response.data.results || [], error: null });
      setPromptId(response.data.id ?? null);

      setFeedback({
        isActive: true,
        message: "Prompt submitted successfully",
        severity: "success",
      });
    } catch (error) {
      setResult({ data: [], error: `Error: ${error}` });
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

          {/* DB Connections */}
          <FormControl fullWidth>
            <InputLabel id="db-connection-label">DB Connection</InputLabel>
            <Select
              labelId="db-connection-label"
              value={dbConnId || ""} // Ensure value defaults to an empty string
              onChange={(e) => setDbConnId(e.target.value)}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {dbConn && dbConn.length > 0 ? (
                dbConn.map((dbConnection) => (
                  <MenuItem key={dbConnection.id} value={dbConnection.id}>
                    {dbConnection.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <em>Loading...</em>
                </MenuItem>
              )}
            </Select>
          </FormControl>

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
