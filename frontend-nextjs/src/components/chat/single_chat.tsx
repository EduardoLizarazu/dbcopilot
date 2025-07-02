"use client";
import React, { Suspense } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { DrawerRightChat } from "@/components/chat/drawer/DrawerRightChat";
import { ChatBtnAction } from "@/components/chat/prompt/chatBtnAction";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { ChatFeedbackBtn } from "@/components/chat/prompt/chatFeedbackBtn";
import { CreatePrompt } from "@/controller/_actions/chat/command/create-prompt";
import { useFeedbackContext } from "@/contexts/feedback.context";
import { useRouter } from "next/navigation";

enum TabResultValueEnum {
  Result = "1",
  SqlEditor = "2",
  Insight = "3",
}

interface Props {
  previousConversation?: {
    chatId: string;
    prompt: string;
    results: any;
    row_count: number;
  } | null;
}

export function SingleChat(
  { previousConversation = null }: Props = { previousConversation: null }
) {
  const router = useRouter();

  // USE CONTEXT
  const { feedback, setFeedback, resetFeedBack } = useFeedbackContext();

  // USE STATE TAB
  const [tabResultValue, setTabResultValue] =
    React.useState<TabResultValueEnum>(TabResultValueEnum.Result);

  // prompt, result and insight
  const [promptId, setPromptId] = React.useState<number | null>(null);
  const [prompt, setPrompt] = React.useState<string>("");
  const [result, setResult] = React.useState<{
    error?: string | null;
    data: Record<string, unknown>[];
  }>();

  const [isResetHf, setIsResetHf] = React.useState<boolean>(false);

  // EFFECTS
  React.useEffect(() => {}, []);

  // HANDLERS

  async function handleSubmitPrompt() {
    setIsResetHf(true);
    // Fetch data
    console.log("Submit prompt", prompt);
    try {
      const response = await CreatePrompt({
        prompt: prompt,
      });

      console.log("response create prompt: ", response.id_prompt);

      // Handle all possible error cases
      const hasError = Boolean(
        response?.error &&
          typeof response.error === "string" &&
          response.error.trim().length > 0
      );

      if (hasError) {
        console.log("Error in response:", response.error);
        setResult({
          data: [],
          error: response.error,
        });
        setFeedback({
          isActive: true,
          message: response.error ?? "Unknown error",
          severity: "error",
        });
        return;
      }

      setResult({
        data: response.results || [],
        error: null,
      });

      setPromptId(response.id_prompt ?? null);

      setFeedback({
        isActive: true,
        message: "Prompt submitted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error submitting prompt:", error);
      // Network errors or other exceptions
      setResult({
        data: [],
        error: "Failed to connect to the API",
      });
      setFeedback({
        isActive: true,
        message: "Network error occurred",
        severity: "error",
      });
    } finally {
      setIsResetHf(false);
    }
  }

  const handleChangeTapResultBar = (
    event: React.SyntheticEvent,
    newValue: TabResultValueEnum
  ) => {
    setTabResultValue(newValue);
  };

  function handleReset() {
    setPrompt("");
    setPromptId(null);
    setResult({
      data: [],
      error: null,
    });
    setIsResetHf(true);
  }

  function handleResetBySelectedHistoryPrompt() {
    setPromptId(null);
    setResult({
      data: [],
      error: null,
    });
    setIsResetHf(true);
    console.log(`handleResetBySelectedHistoryPrompt`);
  }

  function handleError() {
    throw new Error("Function not implemented.");
  }

  return (
    <Container>
      <Suspense fallback={<CircularProgress />}>
        <Stack spacing={3} direction="column">
          {/* DRAWER */}

          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h4">Chat with your database </Typography>
            {/* Drawer right chat */}
            <DrawerRightChat
              setSelectConversation={setPrompt}
              setIsResetHf={setIsResetHf}
              handleResetBySelectedHistoryPrompt={
                handleResetBySelectedHistoryPrompt
              }
            />
          </Stack>

          {/* Prompt */}
          <Box
            component="form"
            sx={{ "& .MuiTextField-root": { minWidth: 100 } }}
            autoComplete="off"
          >
            <TextField
              id="prompt-standard-textarea"
              label="prompt"
              placeholder="Write your prompt here"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              variant="filled"
              rows={4}
              fullWidth
            />
            {promptId !== null && (
              <ChatFeedbackBtn promptId={promptId} isReset={isResetHf} />
            )}
          </Box>

          <Typography variant="body1">{result?.error}</Typography>

          {/* Submit prompt button */}
          <ChatBtnAction
            handleSubmitPrompt={handleSubmitPrompt}
            handleReset={handleReset}
          />

          {/* Result bar: Result, SQL Editor, Insight */}
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={tabResultValue}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChangeTapResultBar}
                  aria-label="lab API tabs example"
                >
                  <Tab label="RESULTS" value="1" />
                  {/* <Tab label="SQL EDITOR" value="2" />
                  <Tab label="INSIGHT" value="3" /> */}
                </TabList>
              </Box>
              <TabPanel value="1">
                {/* Chat result table */}
                <ChatResultTable data={result?.data || []} />
              </TabPanel>
              <TabPanel value="3"></TabPanel>
            </TabContext>
          </Box>
        </Stack>
      </Suspense>
    </Container>
  );
}
