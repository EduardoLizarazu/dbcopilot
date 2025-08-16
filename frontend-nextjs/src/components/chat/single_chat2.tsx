"use client";
import * as React from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

export function QueryPage() {
  const [q, setQ] = React.useState("");
  const [fields, setFields] = React.useState<string[]>([]);
  const [rows, setRows] = React.useState<any[]>([]);
  const [sql, setSql] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // downvote dialog
  const [openDlg, setOpenDlg] = React.useState(false);
  const [corrSQL, setCorrSQL] = React.useState("");
  const [comment, setComment] = React.useState("");

  const run = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/nlq/query", {
        method: "POST",
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setFields(data.fields || []);
      setRows(data.rows || []);
      setSql(data.sql || "");
    } catch (e: any) {
      setFields([]);
      setRows([]);
      setSql("");
      setErr(e?.message ?? "Query failed");
    } finally {
      setLoading(false);
    }
  };

  const exportFile = async (format: "csv" | "xlsx") => {
    const r = await fetch("/api/nlq/export", {
      method: "POST",
      body: JSON.stringify({ format, fields, rows, filename: "results" }),
    });
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `results.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendThumb = async (thumbs: "up" | "down") => {
    if (thumbs === "down") {
      setOpenDlg(true);
      return;
    }
    await fetch("/api/nlq/feedback", {
      method: "POST",
      body: JSON.stringify({ question: q, attempted_sql: sql, thumbs }),
    });
  };

  const submitCorrection = async () => {
    await fetch("/api/nlq/feedback", {
      method: "POST",
      body: JSON.stringify({
        question: q,
        attempted_sql: sql,
        thumbs: "down",
        comment,
        corrected_sql: corrSQL,
      }),
    });
    setOpenDlg(false);
    setCorrSQL("");
    setComment("");
  };

  return (
    <Box className="max-w-7xl mx-auto">
      <Typography variant="h5" sx={{ mb: 2 }} fontWeight={800}>
        Ask your data
      </Typography>
      <Paper className="p-3 sm:p-4" elevation={1}>
        <Box display="grid" gap={8}>
          <Box display="grid" gap={8}>
            <TextField
              label="Type a question (e.g., sales last month by region)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
              onKeyDown={(e) => e.key === "Enter" && run()}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                disabled={loading || !q.trim()}
                onClick={run}
              >
                {loading ? <CircularProgress size={20} /> : "Run"}
              </Button>
              <Button
                variant="outlined"
                disabled={!rows.length}
                onClick={() => exportFile("csv")}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                disabled={!rows.length}
                onClick={() => exportFile("xlsx")}
              >
                Export Excel
              </Button>
              <Box flexGrow={1} />
              <Tooltip title="This was helpful">
                <IconButton onClick={() => sendThumb("up")}>
                  <ThumbUpAltIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Something was wrong">
                <IconButton onClick={() => sendThumb("down")}>
                  <ThumbDownAltIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {err && <Alert severity="error">{err}</Alert>}

          {!!rows.length && (
            <>
              <Typography variant="caption" color="text.secondary">
                SQL used:
              </Typography>
              <Paper variant="outlined" className="p-2 overflow-x-auto text-xs">
                <pre className="whitespace-pre-wrap">{sql}</pre>
              </Paper>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {fields.map((f) => (
                        <TableCell key={f} sx={{ fontWeight: 700 }}>
                          {f}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={i}>
                        {fields.map((f) => (
                          <TableCell key={f}>{String(r[f] ?? "")}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Box>
      </Paper>

      <Dialog
        open={openDlg}
        onClose={() => setOpenDlg(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Tell us what went wrong</DialogTitle>
        <DialogContent>
          <TextField
            label="Correct SQL (optional but ideal)"
            value={corrSQL}
            onChange={(e) => setCorrSQL(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            sx={{ my: 1 }}
          />
          <TextField
            label="Notes"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDlg(false)}>Cancel</Button>
          <Button onClick={submitCorrection} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
