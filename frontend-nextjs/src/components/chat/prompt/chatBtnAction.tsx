import { Button, Stack } from "@mui/material";

type ChatBtnActionProps = {
  handleSubmitPrompt: () => void;
  handleReset: () => void;
  handleError: () => void;
};

export function ChatBtnAction({
  handleSubmitPrompt,
  handleReset,
  handleError,
}: ChatBtnActionProps) {
  return (
    <>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitPrompt}
          >
            Submit
          </Button>
          <Button variant="contained" color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Stack>
        <Button color="error" onClick={handleError}>
          Error
        </Button>
      </Stack>
    </>
  );
}
