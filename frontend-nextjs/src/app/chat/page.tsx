"use client";
import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  CreateChatAction,
  GetConnectionAction,
} from "@/controller/_actions/index.actions";
import { ReadConnectionUseCaseOutput } from "@useCases/index.usecase";
import EditIcon from "@mui/icons-material/Edit";
enum TabResultValueEnum {
  Result = "1",
  SqlEditor = "2",
  Insight = "3",
}

export default function ChatPage() {
  // USE STATES
  const [loading, setLoading] = React.useState<boolean>(false);
  const [database, setDatabase] = React.useState<ReadConnectionUseCaseOutput[]>(
    []
  );
  const [selectedDatabase, setSelectedDatabase] = React.useState<string>("");
  const [prompt, setPrompt] = React.useState<string>("");
  const [result, setResult] = React.useState<string>("");
  const [sqlQuery, setSqlQuery] = React.useState<string>("");
  const [isEditableSqlQuery, setIsEditableSqlQuery] =
    React.useState<boolean>(false);
  const [insight, setInsight] = React.useState<string>("");
  const [schema, setSchema] = React.useState<string>("");

  const [tabResultValue, setTabResultValue] =
    React.useState<TabResultValueEnum>(TabResultValueEnum.Result);

  // EFFECTS
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      // Fetch data
      const connDbs = await GetConnectionAction();
      setDatabase(connDbs);
      setLoading(false);
    })();
  }, []);

  // HANDLERS
  const handlerSubmitPrompt = async () => {
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
    setSqlQuery(res.response.query.originalQuery);
    setInsight(res.response.insight.originalInsight);
  };

  const handleChangeTapResultBar = (event, newValue) => {
    setTabResultValue(newValue);
  };

  const handleChangeSltDatabase = (event) => {
    setSelectedDatabase(event.target.value);
  };

  const handleClickEditSqlQuery = () => {
    setIsEditableSqlQuery(!isEditableSqlQuery);
  };

  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Stack spacing={3} direction="column">
        <Typography variant="h4">Chat with your database </Typography>

        {/* Select database */}
        <FormControl required sx={{ minWidth: 100 }}>
          <InputLabel id="demo-simple-select-required-label">
            Select Database
          </InputLabel>
          <Select
            labelId="demo-simple-select-required-label"
            id="demo-simple-select-required"
            value={selectedDatabase}
            label="Select database *"
            onChange={handleChangeSltDatabase}
            fullWidth
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {database.map((db) => (
              <MenuItem key={db.id} value={db.id}>
                {db.connectionName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Required</FormHelperText>
        </FormControl>

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
        </Box>
        {/* Submit prompt button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handlerSubmitPrompt}
        >
          Submit
        </Button>

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
              <TextField
                label=""
                placeholder=""
                value={result}
                multiline
                variant="outlined"
                rows={4}
                fullWidth
              />
            </TabPanel>
            <TabPanel value="2">
              <TextField
                label=""
                placeholder=""
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                multiline
                variant="outlined"
                rows={4}
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleClickEditSqlQuery}
                endIcon={<EditIcon />}
              >
                {isEditableSqlQuery ? "Save" : "Edit"}
              </Button>
            </TabPanel>
            <TabPanel value="3">
              <TextField
                label=""
                placeholder=""
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                multiline
                variant="outlined"
                rows={4}
                fullWidth
              />
            </TabPanel>
          </TabContext>
        </Box>

        {/* right sidebar bar: schema */}
        <Box sx={{ width: "100%", typography: "body1" }}>
          <Typography variant="h6">Schema Left Side Bar</Typography>
          <Typography variant="h6">History Left Side Bar</Typography>
        </Box>
      </Stack>
    </Container>
  );
}
