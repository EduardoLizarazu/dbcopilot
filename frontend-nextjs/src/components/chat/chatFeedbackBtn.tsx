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
import { SubmitFeedbackAction } from "@/controller/_actions/chat/submit-feedback";
import { useFeedbackContext } from "@/contexts/feedback.context";

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

  React.useEffect(() => {
    if (isReset) {
      setExplanation("");
      setOpen(false);
    }
  }, [isReset]);

  const send = async (type: 0 | 1, explanationText?: string) => {
    try {
      const res = await SubmitFeedbackAction({
        nlq_id: promptId,
        type,
        explanation: explanationText,
      });
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
        <IconButton onClick={() => send(1)} aria-label="thumb up">
          <ThumbUpAlt fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Something’s wrong">
        <IconButton onClick={() => setOpen(true)} aria-label="thumb down">
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
              await send(0, explanation);
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
