import { Container, IconButton, Stack } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
export function ChatFeedbackBtn() {
  return (
    <>
      <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Stack direction="row" spacing={0.5}>
          <IconButton onClick={() => {}}>
            <ThumbUpOffAltIcon />
          </IconButton>

          <IconButton onClick={() => {}}>
            <ThumbDownOffAltIcon />
          </IconButton>
        </Stack>
      </Container>
    </>
  );
}
