"use client";
import { Container, IconButton, Stack, Tooltip } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { ChatFeedbackDislikeDialog } from "./chatFeedbackDislikeDialog";
import React from "react";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { CreateHumanFeedbackAction } from "@/controller/_actions/chat/command/create-feedback.action";

type TChatFeedbackBtnProps = {
  promptId: number;
  isReset: boolean;
};

export function ChatFeedbackBtn({ promptId, isReset }: TChatFeedbackBtnProps) {
  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // USE STATE
  const [feedbackLikeData, setFeedbackLikeData] = React.useState<{
    openDislike: boolean;
    feedback: string;
    isLike: boolean | null;
  }>({
    openDislike: false,
    feedback: "",
    isLike: null,
  });

  React.useEffect(() => {
    if (isReset) {
      setFeedbackLikeData({
        ...feedbackLikeData,
        feedback: "",
        isLike: null,
      });
    }
  }, []);

  // USE HANDLER
  async function handleLike() {
    try {
      const res = await CreateHumanFeedbackAction({
        promptId: promptId,
        isLike: true,
        feedbackTxt: "",
      });

      setFeedback({
        isActive: true,
        message: "Feedback submitted successfully",
        severity: "success",
      });

      setFeedbackLikeData((prev) => ({
        ...prev,
        isLike: !prev.isLike,
      }));
    } catch (error) {
      console.error("Error creating feedback like: ", error);
      setFeedback({
        isActive: true,
        message: "Error submitting feedback",
        severity: "error",
      });
    } finally {
      resetFeedBack();
    }
  }
  function handleDisLikeDialog() {
    setFeedbackLikeData((prev) => ({
      ...prev,
      openDislike: !prev.openDislike,
    }));
  }

  return (
    <>
      <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Like" arrow placement="bottom">
            <IconButton onClick={handleLike}>
              <ThumbUpOffAltIcon
                color={feedbackLikeData.isLike === true ? "primary" : "inherit"}
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dislike" arrow placement="bottom">
            <IconButton onClick={handleDisLikeDialog}>
              <ThumbDownOffAltIcon
                color={
                  feedbackLikeData.isLike === false &&
                  feedbackLikeData.feedback.trim().length > 0
                    ? "primary"
                    : "inherit"
                }
              />
            </IconButton>
          </Tooltip>
        </Stack>
        <ChatFeedbackDislikeDialog
          promptId={promptId}
          open={feedbackLikeData.openDislike}
          onClose={handleDisLikeDialog}
          feedbackText={feedbackLikeData.feedback}
          setDisLikeData={setFeedbackLikeData}
        />
      </Container>
    </>
  );
}
