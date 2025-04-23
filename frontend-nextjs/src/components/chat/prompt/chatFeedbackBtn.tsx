"use client";
import { Container, IconButton, Stack, Tooltip } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { ChatFeedbackDislikeDialog } from "./chatFeedbackDislikeDialog";
import React from "react";
import { CreateFeedbackLikeCmd } from "@/controller/_actions/chat/command/create-feedback-like.command";
import { useFeedbackContext } from "@/contexts/feedback.context";

type TChatFeedbackBtnProps = {
  promptId: number;
};

export function ChatFeedbackBtn({ promptId }: TChatFeedbackBtnProps) {
  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // USE STATE
  const [disLikeData, setDisLikeData] = React.useState({
    open: false,
    feedback: "",
  });
  const [like, setLike] = React.useState(false);

  // USE HANDLER
  async function handleLike() {
    const res = await CreateFeedbackLikeCmd(promptId, like);

    if (res.status === 201 || res.status === 200) {
      setFeedback({
        isActive: true,
        message: "Feedback submitted successfully",
        severity: "success",
      });
    } else {
      setFeedback({
        isActive: true,
        message: "Error submitting feedback",
        severity: "error",
      });
      console.error("Error creating feedback like:", res.status);
    }

    setLike((prev) => !prev);

    resetFeedBack();
  }
  function handleDisLikeDialog() {
    setDisLikeData((prev) => ({ ...prev, open: !prev.open }));
  }

  return (
    <>
      <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Like" arrow placement="bottom">
            <IconButton onClick={handleLike}>
              <ThumbUpOffAltIcon color={like ? "primary" : "inherit"} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dislike" arrow placement="bottom">
            <IconButton onClick={handleDisLikeDialog}>
              <ThumbDownOffAltIcon
                color={
                  disLikeData.feedback.trim().length > 0 ? "primary" : "inherit"
                }
              />
            </IconButton>
          </Tooltip>
        </Stack>
        <ChatFeedbackDislikeDialog
          promptId={promptId}
          open={disLikeData.open}
          onClose={handleDisLikeDialog}
          feedbackText={disLikeData.feedback}
          setDisLikeData={setDisLikeData}
        />
      </Container>
    </>
  );
}
