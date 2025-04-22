"use client";
import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Container,
  Menu,
  MenuItem,
  Stack,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { CreateChatAction } from "@/controller/_actions/index.actions";
import { ReadConnectionUseCaseOutput } from "@useCases/index.usecase";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DrawerRightChat } from "@/components/chat/DrawerRightChat";
import { ChatStoryList } from "@/components/chat/chatStoryList";
import {
  ReadConnectionOnlyIfIsConnectedQry,
  TReadConnectionQry,
} from "@/controller/_actions/connection/query/read-connection.query";

enum TabResultValueEnum {
  Result = "1",
  SqlEditor = "2",
  Insight = "3",
}

export default function ChatPage() {
  // USE STATES
  const [loading, setLoading] = React.useState<boolean>(false);
  // Fetch data
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
  const [prompt, setPrompt] = React.useState<string>("");
  const [result, setResult] = React.useState<string>("");
  const [sqlQuery, setSqlQuery] = React.useState<string>("");
  const [isEditableSqlQuery, setIsEditableSqlQuery] =
    React.useState<boolean>(false);
  const [insight, setInsight] = React.useState<string>("");
  const [schema, setSchema] = React.useState<string>("");

  const [exportType, setExportType] = React.useState<string>("");

  const [tabResultValue, setTabResultValue] =
    React.useState<TabResultValueEnum>(TabResultValueEnum.Result);

  // Menu for export
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // EFFECTS
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      // Fetch data
      const connDbs: TReadConnectionQry[] =
        await ReadConnectionOnlyIfIsConnectedQry();
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

  const handleChangeSltDatabase = (
    event: React.SyntheticEvent,
    newValue: TReadConnectionQry | null
  ) => {
    setSelectedDatabaseId(newValue?.id || 0);
    console.log("Selected database id", newValue);
  };

  const handleClickEditSqlQuery = () => {
    setIsEditableSqlQuery(!isEditableSqlQuery);
  };

  function handleExecuteSQLQuery(): void {
    console.log("Execute SQL Query", sqlQuery);
  }

  // RENDERS
  if (loading) {
    return <CircularProgress />;
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "firstName",
      headerName: "First name",
      width: 150,
      editable: true,
    },
    {
      field: "lastName",
      headerName: "Last name",
      width: 150,
      editable: true,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      width: 110,
      editable: true,
    },
    {
      field: "fullName",
      headerName: "Full name",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 160,
      valueGetter: (value, row) =>
        `${row.firstName || ""} ${row.lastName || ""}`,
    },
  ];

  const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
    { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
    { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
    { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
    { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
    { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
    { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
    { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
  ];

  function handleExport(
    event: MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    console.log("Export", exportType);
  }

  function handlerReset(
    event: MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    throw new Error("Function not implemented.");
  }

  function handlerError(
    event: MouseEvent<HTMLButtonElement, MouseEvent>
  ): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Container>
      <Stack spacing={3} direction="column">
        {/* DRAWER */}

        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h4">Chat with your database </Typography>
          <DrawerRightChat />
        </Stack>

        {/* Select database */}
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

        <Typography variant="body1">Suggestions: ...</Typography>

        {/* Submit prompt button */}
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
              onClick={handlerSubmitPrompt}
            >
              Submit
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handlerReset}
            >
              Reset
            </Button>
          </Stack>
          <Button color="error" onClick={handlerError}>
            Error
          </Button>
        </Stack>

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
              <Container sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  variant="text"
                >
                  Export
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem onClick={handleClose}>Excel</MenuItem>
                  <MenuItem onClick={handleClose}>CSV</MenuItem>
                  <MenuItem onClick={handleClose}>PDF</MenuItem>
                </Menu>
              </Container>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                />
              </Box>
            </TabPanel>
            <TabPanel value="2">
              <TextField
                label=""
                placeholder=""
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                multiline
                variant="outlined"
                minRows={10}
                maxRows={50}
                fullWidth
                aria-readonly={!isEditableSqlQuery}
                disabled={!isEditableSqlQuery}
              />
              <Stack direction="row" spacing={2} style={{ marginTop: 10 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClickEditSqlQuery}
                  endIcon={
                    isEditableSqlQuery ? (
                      <EditIcon style={{ opacity: 0.3 }} />
                    ) : (
                      <EditIcon style={{ opacity: 1 }} />
                    )
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleExecuteSQLQuery}
                >
                  Execute
                </Button>
              </Stack>
            </TabPanel>
            <TabPanel value="3">
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
    </Container>
  );
}
