"use client";
import React, { Suspense } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { CreateChatAction } from "@/controller/_actions/index.actions";
import { DrawerRightChat } from "@/components/chat/drawer/DrawerRightChat";
import {
  ReadConnectionOnlyIfIsConnectedQry,
  TReadConnectionQry,
} from "@/controller/_actions/connection/query/read-connection.query";
import { ConnTestResultTxt } from "@/components/connection/connTestResultTxt";
import { ChatBtnAction } from "@/components/chat/prompt/chatBtnAction";
import { ChatResultTable } from "@/components/chat/result/chatResultTable";
import { ChatSqlEditor } from "@/components/chat/result/chatSqlEditor";
import { ChatFeedbackBtn } from "@/components/chat/prompt/chatFeedbackBtn";

enum TabResultValueEnum {
  Result = "1",
  SqlEditor = "2",
  Insight = "3",
}

export default function ChatPage() {
  // USE STATE TAB
  const [tabResultValue, setTabResultValue] =
    React.useState<TabResultValueEnum>(TabResultValueEnum.Result);

  // USE STATES
  // select database connection
  const [database, setDatabase] = React.useState<TReadConnectionQry[]>([
    {
      id: 0,
      name: "",
      description: "",
      dbName: "",
      dbHost: "",
      dbPort: 0,
      dbUsername: "",
      dbPassword: "",
      dbTypeId: 0,
      dbType: "",
      is_connected: false,
    },
  ]);
  const [selectedDatabaseId, setSelectedDatabaseId] = React.useState<number>(0);

  // prompt, result and insight
  const [prompt, setPrompt] = React.useState<string>("");
  const [result, setResult] = React.useState<string>("");
  const [insight, setInsight] = React.useState<string>("");

  // EFFECTS
  React.useEffect(() => {
    (async () => {
      // Fetch data
      const connDbs: TReadConnectionQry[] =
        await ReadConnectionOnlyIfIsConnectedQry();
      setDatabase(connDbs);
    })();
  }, []);

  // HANDLERS

  async function handleSubmitPrompt() {
    // Fetch data
    console.log("Submit prompt", prompt);

    const res = await CreateChatAction({
      userId: { id: 1 },
      connectionId: { id: 1 },
      prompt: {
        text: prompt,
        userId: 1,
      },
    });

    setResult(res.response.result.text);
    setInsight(res.response.insight.originalInsight);
  }

  const handleChangeTapResultBar = (
    event: React.SyntheticEvent,
    newValue: TabResultValueEnum
  ) => {
    setTabResultValue(newValue);
  };

  const handleChangeSltDatabase = (
    event: React.SyntheticEvent,
    newValue: TReadConnectionQry | null
  ) => {
    setSelectedDatabaseId(newValue?.id || 0);
    console.log("Selected database id", newValue);
  };

  function handleReset() {
    throw new Error("Function not implemented.");
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
              connId={selectedDatabaseId !== 0 ? selectedDatabaseId : null}
            />
          </Stack>

          {/* Select database */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
              disablePortal
              options={database}
              getOptionLabel={(option) => option.name || ""}
              sx={{ width: 300 }}
              aria-label="Select database connection"
              renderInput={(params) => (
                <TextField {...params} label="Select database connection..." />
              )}
              onChange={handleChangeSltDatabase}
            />
            {selectedDatabaseId !== 0 && (
              <ConnTestResultTxt connId={selectedDatabaseId} />
            )}
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
            <ChatFeedbackBtn />
          </Box>

          <Typography variant="body1">Suggestions: ...</Typography>

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
                  <Tab label="SQL EDITOR" value="2" />
                  <Tab label="INSIGHT" value="3" />
                </TabList>
              </Box>
              <TabPanel value="1">
                {/* Chat result table */}
                <ChatResultTable data={[]} />
              </TabPanel>
              <TabPanel value="2">
                <ChatSqlEditor />
              </TabPanel>
              <TabPanel value="3">
                {/* Chat insight */}
                <TextField
                  label=""
                  placeholder=""
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  multiline
                  variant="outlined"
                  minRows={10}
                  maxRows={50}
                  fullWidth
                />
              </TabPanel>
            </TabContext>
          </Box>
        </Stack>
      </Suspense>
    </Container>
  );
}
