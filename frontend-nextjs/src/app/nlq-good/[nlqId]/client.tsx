"use client";

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Chip,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { LocalTime } from "@/components/shared/LocalTime";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { runSqlAction } from "@/controller/_actions/nlq/run-sql";
import { updateNlqAdminAction } from "@/controller/_actions/nlq/update-admin";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { TNlqQaGoodOutWithUserRequestDto } from "@/core/application/dtos/nlq/nlq-qa-good.app.dto";
import { NlqQaInfoExecQuery } from "@/_actions/nlq-qa-info/execute-query.action";
import { UpdateNlqQaGoodAction } from "@/_actions/nlq-qa-good/update.action";

export default function NlqGoodEditClient({
  initial,
}: {
  initial: TNlqQaGoodOutWithUserRequestDto;
}) {
  const router = useRouter();
  const { setFeedback } = useFeedbackContext();

  // Editable fields
  const [question, setQuestion] = React.useState(initial.question || "");
  const [sql, setSql] = React.useState(initial.query || "");

  // Run state
  const [running, setRunning] = React.useState(false);
  const [ranOk, setRanOk] = React.useState(false);
  const [runErr, setRunErr] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<any[] | null>(null);

  // Save state
  const [saving, setSaving] = React.useState(false);

  const onRun = async () => {
    if (!question.trim() || !sql.trim()) return;
    setRunning(true);
    setRunErr(null);
    setRanOk(false);
    setRows(null);
    try {
      const r = await NlqQaInfoExecQuery(sql);
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
    if (!ranOk || saving) return; // must run successfully first
    setSaving(true);
    try {
      // await updateNlqAdminAction({ nlqId: initial.id, question, sql });
      await UpdateNlqQaGoodAction({
        id: initial.id,
        question,
        query: sql,
        isOnKnowledgeSource: initial.isOnKnowledgeSource,
      });
      setFeedback({
        isActive: true,
        severity: "success",
        message: "NLQ updated & re-uploaded.",
      });
      router.push("/nlq-good");
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => router.push("/nlq-good");

  return (
    <Box className="max-w-6xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Edit NLQ Good
      </Typography>

      {/* Detail panel */}
      <Paper className="p-4" elevation={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text">
                <strong>NLQ Good ID:</strong> {initial.id}
              </Typography>

              <Typography variant="subtitle2" color="text" sx={{ mt: 2 }}>
                <strong>User email:</strong> {initial.user?.email || "—"}
              </Typography>

              <Typography variant="subtitle2" color="text" sx={{ mt: 2 }}>
                <strong>Is on vector database:</strong>{" "}
                {initial.isOnKnowledgeSource ? "Yes" : "No"}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Editors */}
      <Paper className="p-4" elevation={1}>
        <Stack spacing={2}>
          <TextField
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Question..."
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
              disabled={running || !question.trim() || !sql.trim()}
            >
              {running ? <CircularProgress size={18} /> : "Run SQL"}
            </Button>
            <Button
              variant="contained"
              onClick={onSave}
              disabled={!ranOk || saving}
            >
              {saving ? <CircularProgress size={18} /> : "Save"}
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </Stack>

          {runErr && <Alert severity="error">{runErr}</Alert>}

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
