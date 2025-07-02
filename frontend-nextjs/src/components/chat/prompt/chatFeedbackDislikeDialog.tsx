"use client";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { CreateHumanFeedbackAction } from "@/controller/_actions/chat/command/create-feedback.action";
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
      isLike: boolean | null;
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
    try {
      console.log("Submitting dislike human-feedback:", feedbackText);

      await CreateHumanFeedbackAction({
        promptId: promptId,
        isLike: false,
        feedbackTxt: feedbackText,
      });
      setFeedback({
        isActive: true,
        message: "Feedback submitted successfully",
        severity: "success",
      });
      setDisLikeData((prev) => ({
        ...prev,
        openDislike: false,
        isLike: false,
      }));
    } catch (error) {
      console.error(`Error on handling dislike human-feedback: ${error}`);
      setFeedback({
        isActive: true,
        message: "Error submitting feedback",
        severity: "error",
      });
    } finally {
      resetFeedBack();
    }
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
