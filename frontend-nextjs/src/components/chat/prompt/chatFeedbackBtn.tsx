import { Container, IconButton, Stack, Tooltip } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
export function ChatFeedbackBtn() {
  return (
    <>
      <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Like" arrow placement="bottom">
            <IconButton onClick={() => {}}>
              <ThumbUpOffAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dislike" arrow placement="bottom">
            <IconButton onClick={() => {}}>
              <ThumbDownOffAltIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Container>
    </>
  );
}
