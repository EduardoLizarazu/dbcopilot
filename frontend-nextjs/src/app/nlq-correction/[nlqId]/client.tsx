"use client";

import * as React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Stack,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { LocalTime } from "@/components/shared/LocalTime";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { runSqlAction } from "@/controller/_actions/nlq/run-sql";
import { saveNlqCorrectionAction } from "@/controller/_actions/nlq/save-correction";
import type { NlqDetail } from "@/controller/_actions/nlq/get-details";
import { useFeedbackContext } from "@/contexts/feedback.context";

export default function NlqCorrectionClient({
  initial,
}: {
  initial: NlqDetail;
}) {
  const { setFeedback } = useFeedbackContext();

  // SQL editors
  const [prevSql, setPrevSql] = React.useState(initial.sql_executed || "");
  const [newSql, setNewSql] = React.useState("");

  // Results
  const [prevRows, setPrevRows] = React.useState<any[] | null>(null);
  const [newRows, setNewRows] = React.useState<any[] | null>(null);
  const [loadingPrev, setLoadingPrev] = React.useState(false);
  const [loadingNew, setLoadingNew] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const runPrev = async () => {
    setLoadingPrev(true);
    setError(null);
    setPrevRows(null);
    try {
      const r = await runSqlAction(prevSql);
      setPrevRows(r.rows || []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to run previous SQL");
    } finally {
      setLoadingPrev(false);
    }
  };

  const runNew = async () => {
    setLoadingNew(true);
    setError(null);
    setNewRows(null);
    try {
      const r = await runSqlAction(newSql);
      setNewRows(r.rows || []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to run corrected SQL");
    } finally {
      setLoadingNew(false);
    }
  };

  const saveCorrection = async () => {
    try {
      const res = await saveNlqCorrectionAction({
        nlq_id: initial.id,
        corrected_sql: newSql,
      });
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Correction saved and NLQ marked as good.",
      });
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Save failed",
      });
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Correct NLQ
      </Typography>

      {/* Details */}
      <Paper className="p-4" elevation={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                NLQ ID
              </Typography>
              <Typography>{initial.id}</Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                User email
              </Typography>
              <Typography>{initial.email || "—"}</Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Time asked
              </Typography>
              <LocalTime iso={initial.time_question || undefined} />

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Execution error
              </Typography>
              <Typography>
                {initial.error_id ? initial.error_id : "-"}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Question
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                {initial.question || "—"}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Feedback
              </Typography>
              {initial.feedback?.id ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  {initial.feedback.type === 1 ? (
                    <Chip size="small" color="success" label="good" />
                  ) : initial.feedback.type === 0 ? (
                    <Chip size="small" color="error" label="bad" />
                  ) : (
                    <Chip size="small" label="unknown" />
                  )}
                  <Typography sx={{ ml: 1 }}>
                    {initial.feedback.explanation || "-"}
                  </Typography>
                </Stack>
              ) : (
                <Typography>-</Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      {/* Editors & runners */}
      <Grid container spacing={3}>
        {/* Previous SQL */}
        <Grid item xs={12} md={6}>
          <Paper className="p-4" elevation={1}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Previous SQL (generated)
            </Typography>
            <TextField
              value={prevSql}
              onChange={(e) => setPrevSql(e.target.value)}
              multiline
              minRows={8}
              fullWidth
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={runPrev}
                disabled={loadingPrev}
              >
                {loadingPrev ? <CircularProgress size={18} /> : "Run previous"}
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {loadingPrev ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            ) : prevRows ? (
              <Box sx={{ mt: 2 }}>
                <ChatResultTable data={prevRows} />
              </Box>
            ) : null}
          </Paper>
        </Grid>

        {/* Corrected SQL */}
        <Grid item xs={12} md={6}>
          <Paper className="p-4" elevation={1}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Corrected SQL
            </Typography>
            <TextField
              placeholder="Write your corrected SELECT here"
              value={newSql}
              onChange={(e) => setNewSql(e.target.value)}
              multiline
              minRows={8}
              fullWidth
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                onClick={runNew}
                disabled={loadingNew || !newSql.trim()}
              >
                {loadingNew ? <CircularProgress size={18} /> : "Run corrected"}
              </Button>
              <Button
                variant="contained"
                onClick={saveCorrection}
                disabled={!newSql.trim()}
              >
                Save correction
              </Button>
            </Stack>

            {loadingNew ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress />
              </Box>
            ) : newRows ? (
              <Box sx={{ mt: 2 }}>
                <ChatResultTable data={newRows} />
              </Box>
            ) : null}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
