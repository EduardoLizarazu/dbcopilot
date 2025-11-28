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
  Grid2 as Grid,
  Paper,
} from "@mui/material";
import { ChatBtnAction } from "@/components/chat/prompt/chatBtnAction";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { ChatFeedbackBtn } from "@/components/chat/chatFeedbackBtn";
import { CreateNlqQaAction } from "@/_actions/nlq-qa/create.action";
import { ReadAllDbConnectionAction } from "@/_actions/dbconnection/read-all.action";
import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { SchemaCtxDrawerForAdminComponent } from "../schemaCtx/schemaCtxDrawerForAdmin";

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

  // STATE
  const [promptId, setPromptId] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState<string>(props?.prompt || "");
  const [result, setResult] = React.useState<Record<string, unknown>[]>([]);

  const [isResetHf, setIsResetHf] = React.useState<boolean>(false);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [warn, setWarn] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const dbConnData = await ReadAllDbConnectionAction();
      if (dbConnData.ok) {
        setDbConn(dbConnData.data || []);
      }
      if (!dbConnData.ok) {
        setError(dbConnData.message || "Failed to load DB connections");
      }
    })();
  }, []);

  // HANDLERS
  async function handleSubmitPrompt() {
    if (!prompt.trim()) return;
    setIsResetHf(true);
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setWarn(null);

    const response = await CreateNlqQaAction({
      question: prompt,
      dbConnectionId: dbConnId,
    });

    if (response.ok) {
      if (!response.data.results || response.data.results.length === 0) {
        setResult([]);
        setWarn("No results found for the given prompt.");
        return;
      }

      setResult(response.data.results || []);
      setPromptId(response.data.id ?? null);
      setSuccess("Prompt submitted successfully");
    }

    if (!response.ok) {
      setResult([]);
      setError(response.message || "Failed to submit prompt");
    }

    setSubmitting(false);
    setIsResetHf(false);
  }

  function handleReset() {
    setPrompt("");
    setPromptId(null);
    setResult([]);
    setIsResetHf(true);
    setError(null);
    setWarn(null);
    setSuccess(null);
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
            {/* <SchemaCtxDrawerForAdminComponent dbConnectionId={dbConnId || ""} /> */}
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

          {/* Actions */}
          <ChatBtnAction
            handleSubmitPrompt={handleSubmitPrompt}
            handleReset={handleReset}
          />
          {/* Error (inline) */}
          {success ? <Alert severity="success">{success}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {warn ? <Alert severity="warning">{warn}</Alert> : null}

          {/* Results (no tabs — just the table) */}
          {submitting ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ChatResultTable data={result || []} />
          )}
        </Stack>
      </Suspense>
    </Container>
  );
}
