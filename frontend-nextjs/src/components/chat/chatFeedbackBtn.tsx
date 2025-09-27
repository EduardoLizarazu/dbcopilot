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

  React.useEffect(() => {
    if (isReset) {
      setExplanation("");
      setOpen(false);
      setActiveThumb(null);
      setFeedbackId(null);
    }
  }, [isReset]);

  const toggleThumb = async (type: 0 | 1) => {
    try {
      if (!promptId) throw new Error("Prompt ID is missing.");

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
        console.log("Feedback cleared on server");
        return;
      }

      // Activate the clicked thumb
      setActiveThumb(type);
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
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <Tooltip title="Looks good">
        <IconButton
          onClick={() => toggleThumb(1)}
          aria-label="thumb up"
          color={activeThumb === 1 ? "primary" : "default"}
        >
          <ThumbUpAlt fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Something’s wrong">
        <IconButton
          onClick={() => {
            if (activeThumb !== 0) setOpen(true);
          }}
          aria-label="thumb down"
          color={activeThumb === 0 ? "primary" : "default"}
        >
          <ThumbDownAlt fontSize="small" />
        </IconButton>
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
            disabled={!explanation.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
