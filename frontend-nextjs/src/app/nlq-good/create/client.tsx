// app/nlq-good/create/client.tsx
"use client";

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { runSqlAction } from "@/controller/_actions/nlq/run-sql";
import { createNlqAdminAction } from "@/controller/_actions/nlq/create-admin";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";

export default function CreateNlqClient() {
  const router = useRouter();
  const { setFeedback } = useFeedbackContext();

  const [question, setQuestion] = React.useState("");
  const [sql, setSql] = React.useState("");

  const [running, setRunning] = React.useState(false);
  const [ranOk, setRanOk] = React.useState(false);
  const [runErr, setRunErr] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<any[] | null>(null);

  const [saving, setSaving] = React.useState(false);
  const disabledRun = !question.trim() || !sql.trim();
  const disabledSave = !ranOk || saving;

  const onRun = async () => {
    if (disabledRun) return;
    setRunning(true);
    setRunErr(null);
    setRanOk(false);
    setRows(null);
    try {
      const r = await runSqlAction(sql);
      setRows(r.rows || []);
      setRanOk(true);
      setFeedback({
        isActive: true,
        severity: "success",
        message: "SQL executed successfully.",
      });
    } catch (e: any) {
      const msg = e?.message ?? "Failed to run SQL";
      setRunErr(msg);
      setFeedback({ isActive: true, severity: "error", message: msg });
    } finally {
      setRunning(false);
    }
  };

  const onSave = async () => {
    if (disabledSave) return;
    setSaving(true);
    try {
      await createNlqAdminAction({ question, sql });
      setFeedback({
        isActive: true,
        severity: "success",
        message: "NLQ created & uploaded.",
      });
      router.push("/nlq-good");
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => router.push("/nlq-good");

  return (
    <Box className="max-w-5xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Create NLQ (Admin)
      </Typography>

      <Paper className="p-4" elevation={1}>
        <Stack spacing={2}>
          <TextField
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            fullWidth
          />
          <TextField
            label="SQL"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            fullWidth
            multiline
            minRows={6}
            placeholder="Write a SELECT query…"
          />

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={onRun}
              disabled={disabledRun || running}
            >
              {running ? <CircularProgress size={18} /> : "Run SQL"}
            </Button>
            <Button
              variant="contained"
              onClick={onSave}
              disabled={disabledSave}
            >
              {saving ? <CircularProgress size={18} /> : "Save"}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Stack>

          {runErr && <Alert severity="error">{runErr}</Alert>}

          <Divider sx={{ my: 2 }} />

          {running ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          ) : rows ? (
            <ChatResultTable data={rows} />
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
