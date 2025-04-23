"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { CreateFeedbackDisLikeCmd } from "@/controller/_actions/chat/command/create-feedback-dislike.command";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type TChatFeedbackDislikeDialogProps = {
  promptId: number;
  open: boolean;
  onClose: () => void;
  feedbackText: string;
  setDisLikeData: React.Dispatch<
    React.SetStateAction<{
      openDislike: boolean;
      feedback: string;
      isLike: boolean;
    }>
  >;
};

export function ChatFeedbackDislikeDialog({
  promptId,
  open,
  onClose,
  feedbackText,
  setDisLikeData,
}: TChatFeedbackDislikeDialogProps) {
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  function handleFeedbackText(e: React.ChangeEvent<HTMLInputElement>) {
    setDisLikeData((prev) => ({
      ...prev,
      feedback: e.target.value,
    }));
  }
  async function handleSubmitFeedback() {
    console.log("Feedback submitted:", feedbackText);

    const res = await CreateFeedbackDisLikeCmd(promptId, feedbackText);
    if (res.status === 201 || res.status === 200) {
      setFeedback({
        isActive: true,
        message: "Feedback submitted successfully",
        severity: "success",
      });
    } else {
      console.error("Error creating feedback dislike:", res.status);
      setFeedback({
        isActive: true,
        message: "Error submitting feedback",
        severity: "error",
      });
    }

    resetFeedBack();
    setDisLikeData((prev) => ({ ...prev, openDislike: false, isLike: false }));
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Feedback</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            We appreciate your feedback. Please let us know how we can improve
            your experience with our service.
          </Typography>
          <TextField
            value={feedbackText}
            onChange={handleFeedbackText}
            variant="outlined"
            autoFocus
            margin="dense"
            id="name"
            name="feedback"
            label="Feedback"
            type="text"
            fullWidth
            multiline
            rows={6}
            placeholder="Please provide your feedback here..."
          />
        </DialogContent>
        <DialogActions>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"flex-end"}
            alignItems={"center"}
            sx={{ marginRight: 2, paddingBottom: 2 }}
          >
            <Button onClick={onClose} color="error" variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFeedback}
              color="primary"
              autoFocus
              variant="contained"
            >
              Submit
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}
