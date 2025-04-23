"use client";
import { Container, IconButton, Stack, Tooltip } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { ChatFeedbackDislikeDialog } from "./chatFeedbackDislikeDialog";
import React from "react";

export function ChatFeedbackBtn() {
  const [disLikeData, setDisLikeData] = React.useState({
    open: false,
    feedback: "",
  });

  function handleLike() {
    console.log("Like button clicked");
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
              <ThumbUpOffAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dislike" arrow placement="bottom">
            <IconButton onClick={handleDisLikeDialog}>
              <ThumbDownOffAltIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <ChatFeedbackDislikeDialog
          open={disLikeData.open}
          onClose={handleDisLikeDialog}
          feedbackText={disLikeData.feedback}
          setDisLikeData={setDisLikeData}
        />
      </Container>
    </>
  );
}
