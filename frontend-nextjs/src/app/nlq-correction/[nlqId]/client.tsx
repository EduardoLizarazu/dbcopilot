// app/nlq-correction/[nlqId]/client.tsx
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
import { useFeedbackContext } from "@/contexts/feedback.context";
import { useRouter } from "next/navigation";
import { TNlqQaWitFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { NlqQaInfoExecQuery } from "@/_actions/nlq-qa-info/execute-query.action";

export default function NlqCorrectionClient({
  initial,
}: {
  initial: TNlqQaWitFeedbackOutRequestDto;
}) {
  const router = useRouter();
  const { setFeedback } = useFeedbackContext();

  const [prevSql, setPrevSql] = React.useState(initial.query || "");
  const [newSql, setNewSql] = React.useState("");

  const [prevRows, setPrevRows] = React.useState<any[] | null>(null);
  const [newRows, setNewRows] = React.useState<any[] | null>(null);
  const [loadingPrev, setLoadingPrev] = React.useState(false);
  const [loadingNew, setLoadingNew] = React.useState(false);

  const [runError, setRunError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveOk, setSaveOk] = React.useState<string | null>(null);

  const runPrev = async () => {
    setLoadingPrev(true);
    setRunError(null);
    setPrevRows(null);
    try {
      const r = await NlqQaInfoExecQuery(prevSql);
      setPrevRows(r.data || []);
    } catch (e: any) {
      setRunError(e?.message ?? "Failed to run previous SQL");
    } finally {
      setLoadingPrev(false);
    }
  };

  const runNew = async () => {
    setLoadingNew(true);
    setRunError(null);
    setNewRows(null);
    try {
      const r = await NlqQaInfoExecQuery(newSql);
      setNewRows(r.data || []);
    } catch (e: any) {
      setRunError(e?.message ?? "Failed to run corrected SQL");
    } finally {
      setLoadingNew(false);
    }
  };

  const saveCorrection = async () => {
    setSaveError(null);
    setSaveOk(null);
    try {
      const res = await saveNlqCorrectionAction({
        nlq_id: initial.id,
        corrected_sql: newSql,
      });
      setSaveOk("Everything was OK — correction saved and NLQ marked as good.");
      setFeedback({
        isActive: true,
        severity: "success",
        message: "Correction saved.",
      });
      router.push("/nlq-correction");
    } catch (e: any) {
      const msg = e?.message ?? "Save failed";
      setSaveError(msg);
      setFeedback({ isActive: true, severity: "error", message: msg });
    }
  };

  return (
    <Box className="max-w-7xl mx-auto px-4 py-6">
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Correct NLQ
      </Typography>

      {/* NLQ Details */}
      <Paper className="p-4" elevation={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          NLQ Details
        </Typography>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            Question
          </Typography>
          <Typography>{initial.question || "—"}</Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            Time Asked
          </Typography>
          <Typography>
            {/* <LocalTime iso={initial.timeQuestion || undefined} /> */}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            User Email
          </Typography>
          <Typography>{initial.user?.email || "—"}</Typography>
        </Stack>
      </Paper>

      {/* Feedback Details */}
      {initial.feedback && (
        <Paper className="p-4" elevation={1} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Feedback
          </Typography>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Feedback Status
            </Typography>
            <Chip
              size="small"
              color={
                initial.feedback.isGood
                  ? "success"
                  : initial.feedback.isGood === false
                    ? "error"
                    : "default"
              }
              label={
                initial.feedback.isGood
                  ? "Positive"
                  : initial.feedback.isGood === false
                    ? "Negative"
                    : "Unknown"
              }
              sx={{ maxWidth: 120, width: "fit-content" }}
            />

            {initial.feedback.comment && (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Comment
                </Typography>
                <Typography>{initial.feedback.comment}</Typography>
              </>
            )}
          </Stack>
        </Paper>
      )}

      {/* Error Details */}
      {initial.error && (
        <Paper className="p-4" elevation={1} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Error Details
          </Typography>
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              Execution Error Message
            </Typography>
            <Typography>{initial.error.errorMessage || "—"}</Typography>
          </Stack>
        </Paper>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="text" onClick={() => router.push("/nlq-correction")}>
          Cancel
        </Button>
      </Stack>

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

            {runError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {runError}
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

            {saveOk && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {saveOk}
              </Alert>
            )}
            {saveError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {saveError}
              </Alert>
            )}

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
