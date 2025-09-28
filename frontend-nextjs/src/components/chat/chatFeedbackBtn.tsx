// components/chat/prompt/chatFeedbackBtn.tsx
"use client";

import * as React from "react";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import ThumbUpAlt from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAlt from "@mui/icons-material/ThumbDownAlt";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { ManageFeedbackAction } from "@/_actions/feedback/manager";

export function ChatFeedbackBtn({
  promptId,
  isReset,
}: {
  promptId: string;
  isReset: boolean;
}) {
  const { setFeedback } = useFeedbackContext();
  const [open, setOpen] = React.useState(false);
  const [explanation, setExplanation] = React.useState("");
  const [activeThumb, setActiveThumb] = React.useState<0 | 1 | null>(null); // 0 = down, 1 = up, null = none
  const [feedbackId, setFeedbackId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<0 | 1 | null>(null); // Tracks which thumb is loading

  React.useEffect(() => {
    if (isReset) {
      setExplanation("");
      setOpen(false);
      setActiveThumb(null);
      setFeedbackId(null);
      setLoading(null);
    }
  }, [isReset]);

  const toggleThumb = async (type: 0 | 1) => {
    try {
      if (!promptId) throw new Error("Prompt ID is missing.");

      setLoading(type); // Set loading state for the pressed thumb

      if (activeThumb === type) {
        // Deactivate if the same thumb is clicked again
        setActiveThumb(null);
        setFeedback({
          isActive: true,
          severity: "info",
          message: "Feedback cleared.",
        });
        // Clear feedback on the server
        await ManageFeedbackAction({
          feedbackId: feedbackId,
          nlqQaId: promptId,
          isGood: null,
          comment: null,
        });
        setFeedbackId(null);
        setExplanation("");
        console.log("Feedback cleared on server");
        setLoading(null); // Clear loading state
        return;
      }

      // Activate the clicked thumb
      setActiveThumb(type);
      console.log("Submitting feedback:", {
        feedbackId: feedbackId,
        nlqQaId: promptId,
        isGood: type === 1,
        comment: explanation,
      });

      const res = await ManageFeedbackAction({
        feedbackId: feedbackId,
        nlqQaId: promptId,
        isGood: type === 1,
        comment: explanation,
      });
      console.log("Feedback response:", res);
      setFeedbackId(res.id);

      setFeedback({
        isActive: true,
        severity: "success",
        message: "Feedback saved. Thank you!",
      });
    } catch (e: any) {
      setFeedback({
        isActive: true,
        severity: "error",
        message: e?.message ?? "Failed to save feedback",
      });
    } finally {
      setLoading(null); // Clear loading state
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <Tooltip title="Looks good">
        <span>
          <IconButton
            onClick={() => toggleThumb(1)}
            aria-label="thumb up"
            color={activeThumb === 1 ? "primary" : "default"}
            disabled={loading !== null} // Disable if any thumb is loading
          >
            {loading === 1 ? (
              <CircularProgress size={20} />
            ) : (
              <ThumbUpAlt fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Something’s wrong">
        <span>
          <IconButton
            onClick={async () => {
              if (activeThumb === 0) {
                // If ThumbDownAlt is active, deactivate it first
                await toggleThumb(0);
              } else if (!loading) {
                // Open the dialog only if not active and not loading
                setOpen(true);
              }
            }}
            aria-label="thumb down"
            color={activeThumb === 0 ? "primary" : "default"}
            disabled={loading !== null} // Disable if any thumb is loading
          >
            {loading === 0 ? (
              <CircularProgress size={20} />
            ) : (
              <ThumbDownAlt fontSize="small" />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>What went wrong?</DialogTitle>
        <DialogContent>
          <TextField
            label="Explanation (required)"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            multiline
            minRows={3}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await toggleThumb(0);
              setOpen(false);
              setExplanation("");
            }}
            disabled={!explanation.trim() || loading !== null} // Disable if loading
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
