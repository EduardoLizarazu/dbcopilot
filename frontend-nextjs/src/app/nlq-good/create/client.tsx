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
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { CreateNlqQaGoodAction } from "@/_actions/nlq-qa-good/create.action";
import { InfoExtractorAction } from "@/_actions/nlq-qa-info/execute-query.action";
import { TNlqQaGoodOutWithUserAndConnRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";

export default function NlqClient({
  initial,
}: {
  initial?: TNlqQaGoodOutWithUserAndConnRequestDto;
}) {
  const router = useRouter();

  const [nlq, setNlq] =
    React.useState<TNlqQaGoodOutWithUserAndConnRequestDto | null>(
      initial || null
    );

  const { setFeedback } = useFeedbackContext();

  const [running, setRunning] = React.useState(false);
  const [ranOk, setRanOk] = React.useState(false);
  const [runErr, setRunErr] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<any[] | null>(null);

  const [saving, setSaving] = React.useState(false);
  const disabledRun = !nlq?.question.trim() || !nlq?.query.trim();
  const disabledSave = !ranOk || saving;

  const onRun = async () => {
    if (disabledRun) return;
    setRunning(true);
    setRunErr(null);
    setRanOk(false);
    setRows(null);
    try {
      const r = await InfoExtractorAction(sql);
      setRows(r.data || []);
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
      await CreateNlqQaGoodAction({
        question: question.trim(),
        query: sql.trim(),
      });
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
            value={nlq.question}
            onChange={(e) => setNlq({ ...nlq, question: e.target.value })}
            fullWidth
            placeholder="Write a question…"
            autoFocus
            multiline
            minRows={2}
          />
          <TextField
            label="Query (SQL)"
            value={nlq.query}
            onChange={(e) => setNlq({ ...nlq, query: e.target.value })}
            fullWidth
            multiline
            minRows={6}
            placeholder="Write a query…"
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
