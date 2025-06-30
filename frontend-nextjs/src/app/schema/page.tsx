"use client";
// pages/schema-management.tsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  ListItemButton,
} from "@mui/material";
import {
  CheckCircle,
  Warning,
  Help,
  Info,
  Edit,
  Delete,
  Add,
  TableChart,
  ViewColumn,
  Link,
  ArrowForward,
  Close,
} from "@mui/icons-material";

// Types
type Column = {
  name: string;
  type: string;
  status: "added" | "removed" | "modified" | "unchanged" | "unknown";
  context?: string;
};

type Table = {
  name: string;
  status: "added" | "removed" | "modified" | "unchanged" | "unknown";
  description?: string;
  columns: Column[];
};

type Relationship = {
  fromTable: string;
  toTable: string;
  type: string;
  status: "added" | "removed" | "modified" | "unchanged" | "unknown";
};

type SchemaState = {
  dbSchema: Table[];
  graphSchema: Table[];
  relationships: Relationship[];
  activeStep: number;
  pendingChanges: {
    tables: Table[];
    columns: Column[];
    relationships: Relationship[];
  };
  clarificationQueue: {
    elementType: "table" | "column" | "relationship";
    elementName: string;
    question: string;
    options: string[];
  }[];
};

const SchemaManagementPage = () => {
  const [schemaState, setSchemaState] = useState<SchemaState>({
    dbSchema: [],
    graphSchema: [],
    relationships: [],
    activeStep: 0,
    pendingChanges: { tables: [], columns: [], relationships: [] },
    clarificationQueue: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedElement, setSelectedElement] = useState<{
    type: "table" | "column" | "relationship";
    name: string;
    context: string;
  } | null>(null);
  const [clarificationResponse, setClarificationResponse] =
    useState<string>("");
  const [showContextDialog, setShowContextDialog] = useState(false);

  // Simulate fetching schemas from backend
  useEffect(() => {
    const fetchSchemas = async () => {
      setLoading(true);

      // Simulating API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock data representing the current state
      const mockData: SchemaState = {
        dbSchema: [
          {
            name: "employees",
            status: "unknown",
            description: "Employee information",
            columns: [
              { name: "id", type: "int", status: "unchanged" },
              { name: "name", type: "varchar(100)", status: "unchanged" },
              { name: "salary", type: "decimal(10,2)", status: "modified" },
              { name: "department_id", type: "int", status: "added" },
            ],
          },
          {
            name: "departments",
            status: "added",
            description: "Department information",
            columns: [
              { name: "id", type: "int", status: "added" },
              { name: "name", type: "varchar(50)", status: "added" },
            ],
          },
        ],
        graphSchema: [
          {
            name: "employees",
            status: "unknown",
            description: "Employee records",
            columns: [
              { name: "id", type: "int", status: "unchanged" },
              { name: "name", type: "varchar(100)", status: "unchanged" },
              { name: "salary", type: "int", status: "modified" },
            ],
          },
          {
            name: "contracts",
            status: "removed",
            description: "Employee contracts (deprecated)",
            columns: [
              { name: "id", type: "int", status: "removed" },
              { name: "employee_id", type: "int", status: "removed" },
              { name: "start_date", type: "date", status: "removed" },
            ],
          },
        ],
        relationships: [
          {
            fromTable: "employees",
            toTable: "departments",
            type: "BELONGS_TO",
            status: "added",
          },
        ],
        activeStep: 0,
        pendingChanges: { tables: [], columns: [], relationships: [] },
        clarificationQueue: [
          {
            elementType: "table",
            elementName: "departments",
            question: "Is this a new table or a renamed existing table?",
            options: [
              "New table",
              "Renamed from 'departments_old'",
              "Renamed from 'divisions'",
            ],
          },
          {
            elementType: "column",
            elementName: "department_id",
            question: "Is this a new column or a renamed existing column?",
            options: [
              "New column",
              "Renamed from 'dept_id'",
              "Renamed from 'division_id'",
            ],
          },
        ],
      };

      setSchemaState(mockData);
      setLoading(false);
    };

    fetchSchemas();
  }, []);

  // Handle user response to clarification question
  const handleClarificationResponse = (response: string) => {
    const updatedQueue = [...schemaState.clarificationQueue];
    const currentQuestion = updatedQueue.shift();

    if (currentQuestion) {
      // Process the response and update schema status
      const isNew = response.startsWith("New");
      const isRename = response.startsWith("Renamed");

      setSchemaState((prev) => {
        const newState = { ...prev, clarificationQueue: updatedQueue };

        if (currentQuestion.elementType === "table") {
          newState.dbSchema = prev.dbSchema.map((table) => {
            if (table.name === currentQuestion.elementName) {
              return {
                ...table,
                status: isNew ? "added" : "modified",
              };
            }
            return table;
          });
        }

        if (currentQuestion.elementType === "column") {
          newState.dbSchema = prev.dbSchema.map((table) => {
            return {
              ...table,
              columns: table.columns.map((col) => {
                if (col.name === currentQuestion.elementName) {
                  return { ...col, status: isNew ? "added" : "modified" };
                }
                return col;
              }),
            };
          });
        }

        return newState;
      });
    }

    setClarificationResponse("");
  };

  // Handle adding context to an element
  const handleAddContext = (
    elementType: "table" | "column" | "relationship",
    name: string
  ) => {
    // Find existing context if any
    let existingContext = "";

    if (elementType === "table") {
      const table = schemaState.dbSchema.find((t) => t.name === name);
      existingContext = table?.description || "";
    }

    if (elementType === "column") {
      // This would need more context in a real app
      existingContext = "";
    }

    setSelectedElement({ type: elementType, name, context: existingContext });
    setShowContextDialog(true);
  };

  // Save context to the schema
  const saveContext = () => {
    if (!selectedElement) return;

    setSchemaState((prev) => {
      const newState = { ...prev };

      if (selectedElement.type === "table") {
        newState.dbSchema = prev.dbSchema.map((table) => {
          if (table.name === selectedElement.name) {
            return { ...table, description: selectedElement.context };
          }
          return table;
        });
      }

      // Similar logic for columns and relationships

      return newState;
    });

    setShowContextDialog(false);
  };

  // Apply all changes to graph schema
  const applyChanges = () => {
    // In a real app, this would send the changes to the backend
    alert("Changes applied successfully! Graph schema updated.");
    setSchemaState((prev) => ({ ...prev, activeStep: 0 }));
  };

  // Steps in the process
  const steps = [
    "Schema Comparison",
    "User Clarification",
    "Add Context",
    "Review & Apply",
  ];

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="font-bold mb-6 text-gray-800">
        Schema Context Management
      </Typography>

      {/* Process Stepper */}
      <Stepper activeStep={schemaState.activeStep} className="mb-8">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {loading ? (
        <Box className="text-center py-12">
          <CircularProgress size={60} className="text-blue-600" />
          <Typography variant="h6" className="mt-4 text-gray-600">
            Analyzing schema differences...
          </Typography>
        </Box>
      ) : (
        <div className="space-y-8">
          {/* Clarification Queue */}
          {schemaState.clarificationQueue.length > 0 && (
            <Card elevation={3} className="border-l-4 border-yellow-500">
              <CardContent>
                <Box className="flex items-center mb-4">
                  <Warning className="text-yellow-600 mr-2" />
                  <Typography variant="h6" className="font-medium">
                    Schema Clarification Needed
                  </Typography>
                  <Chip
                    label={`${schemaState.clarificationQueue.length} pending`}
                    color="warning"
                    size="small"
                    className="ml-3"
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          className="font-medium mb-3"
                        >
                          {schemaState.clarificationQueue[0].elementType ===
                          "table" ? (
                            <TableChart className="mr-2 text-blue-600" />
                          ) : (
                            <ViewColumn className="mr-2 text-green-600" />
                          )}
                          {schemaState.clarificationQueue[0].elementName}
                        </Typography>

                        <Typography className="mb-4">
                          {schemaState.clarificationQueue[0].question}
                        </Typography>

                        <List className="space-y-2">
                          {schemaState.clarificationQueue[0].options.map(
                            (option, idx) => (
                              <ListItem
                                key={idx}
                                className="hover:bg-blue-50 rounded"
                                disablePadding
                              >
                                <ListItemButton
                                  onClick={() =>
                                    handleClarificationResponse(option)
                                  }
                                  className="hover:bg-blue-50 rounded"
                                >
                                  <ListItemIcon>
                                    {option.startsWith("New") ? (
                                      <Add className="text-green-600" />
                                    ) : (
                                      <Edit className="text-blue-600" />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText primary={option} />
                                </ListItemButton>
                              </ListItem>
                            )
                          )}
                        </List>

                        <Divider className="my-4" />

                        <TextField
                          fullWidth
                          label="Your response"
                          variant="outlined"
                          value={clarificationResponse}
                          onChange={(e) =>
                            setClarificationResponse(e.target.value)
                          }
                          className="mb-3"
                        />

                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            handleClarificationResponse(clarificationResponse)
                          }
                          disabled={!clarificationResponse}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Submit Response
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box className="bg-blue-50 p-4 rounded-lg">
                      <Typography
                        variant="subtitle1"
                        className="font-medium flex items-center mb-2"
                      >
                        <Info className="text-blue-600 mr-2" />
                        Why is this needed?
                      </Typography>
                      <Typography variant="body2" className="text-gray-700">
                        The system detected a schema element that doesn't match
                        your graph structure. Clarifying whether this is a new
                        element or a renamed existing element helps maintain
                        accurate relationships and context in your Graph RAG
                        system.
                      </Typography>

                      <Typography
                        variant="subtitle1"
                        className="font-medium flex items-center mt-4 mb-2"
                      >
                        <Help className="text-blue-600 mr-2" />
                        How does this affect Graph RAG?
                      </Typography>
                      <Typography variant="body2" className="text-gray-700">
                        Properly identifying schema elements ensures that:
                      </Typography>
                      <List dense className="pl-4 list-disc text-gray-700">
                        <li>Embeddings are generated accurately</li>
                        <li>Vector indexes remain consistent</li>
                        <li>SQL generation maintains high quality</li>
                        <li>Relationships in the graph stay valid</li>
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Schema Comparison */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" className="font-bold mb-4 text-gray-700">
                Schema Comparison
              </Typography>

              <Grid container spacing={4}>
                {/* Database Schema */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <Box className="bg-blue-600 text-white p-3">
                      <Typography variant="subtitle1" className="font-medium">
                        Current Database Schema
                      </Typography>
                    </Box>
                    <CardContent>
                      {schemaState.dbSchema.map((table) => (
                        <Box key={`db-${table.name}`} className="mb-6">
                          <Box className="flex justify-between items-start mb-2">
                            <Box>
                              <Typography
                                variant="subtitle1"
                                className="font-medium flex items-center"
                              >
                                <TableChart className="mr-2 text-blue-600" />
                                {table.name}
                                {table.status === "added" && (
                                  <Chip
                                    label="New"
                                    size="small"
                                    color="success"
                                    className="ml-2"
                                  />
                                )}
                                {table.status === "modified" && (
                                  <Chip
                                    label="Renamed"
                                    size="small"
                                    color="info"
                                    className="ml-2"
                                  />
                                )}
                              </Typography>
                              {table.description && (
                                <Typography
                                  variant="body2"
                                  className="text-gray-600 mt-1"
                                >
                                  {table.description}
                                </Typography>
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleAddContext("table", table.name)
                              }
                              className="text-blue-600"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Box>

                          <List dense className="pl-6">
                            {table.columns.map((column) => (
                              <ListItem
                                key={`db-col-${column.name}`}
                                className="pl-0"
                              >
                                <ListItemIcon className="min-w-0 mr-2">
                                  <ViewColumn
                                    fontSize="small"
                                    className="text-gray-500"
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <span>
                                      {column.name}
                                      <span className="text-gray-500 ml-2">
                                        ({column.type})
                                      </span>
                                      {column.status === "added" && (
                                        <Chip
                                          label="New"
                                          size="small"
                                          color="success"
                                          className="ml-2"
                                        />
                                      )}
                                      {column.status === "modified" && (
                                        <Chip
                                          label="Renamed"
                                          size="small"
                                          color="info"
                                          className="ml-2"
                                        />
                                      )}
                                    </span>
                                  }
                                />
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleAddContext("column", column.name)
                                  }
                                  className="text-blue-600"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Graph Schema */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <Box className="bg-indigo-600 text-white p-3">
                      <Typography variant="subtitle1" className="font-medium">
                        Graph Database Schema
                      </Typography>
                    </Box>
                    <CardContent>
                      {schemaState.graphSchema.map((table) => (
                        <Box key={`graph-${table.name}`} className="mb-6">
                          <Box className="flex justify-between items-start mb-2">
                            <Box>
                              <Typography
                                variant="subtitle1"
                                className="font-medium flex items-center"
                              >
                                <TableChart className="mr-2 text-indigo-600" />
                                {table.name}
                                {table.status === "removed" && (
                                  <Chip
                                    label="Removed"
                                    size="small"
                                    color="error"
                                    className="ml-2"
                                  />
                                )}
                              </Typography>
                              {table.description && (
                                <Typography
                                  variant="body2"
                                  className="text-gray-600 mt-1"
                                >
                                  {table.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <List dense className="pl-6">
                            {table.columns.map((column) => (
                              <ListItem
                                key={`graph-col-${column.name}`}
                                className="pl-0"
                              >
                                <ListItemIcon className="min-w-0 mr-2">
                                  <ViewColumn
                                    fontSize="small"
                                    className="text-gray-500"
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <span>
                                      {column.name}
                                      <span className="text-gray-500 ml-2">
                                        ({column.type})
                                      </span>
                                      {column.status === "removed" && (
                                        <Chip
                                          label="Removed"
                                          size="small"
                                          color="error"
                                          className="ml-2"
                                        />
                                      )}
                                    </span>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Relationships */}
              {schemaState.relationships.length > 0 && (
                <Box className="mt-8">
                  <Typography
                    variant="h6"
                    className="font-bold mb-4 text-gray-700"
                  >
                    Relationships
                  </Typography>

                  <Card variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        {schemaState.relationships.map((rel, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Card className="border-l-4 border-green-500">
                              <CardContent className="py-3">
                                <Box className="flex items-center justify-between">
                                  <Box className="flex items-center">
                                    <Chip
                                      label={rel.fromTable}
                                      variant="outlined"
                                      className="mr-2"
                                    />
                                    <ArrowForward className="text-gray-500 mx-1" />
                                    <Chip
                                      label={rel.toTable}
                                      variant="outlined"
                                      className="ml-2"
                                    />
                                  </Box>
                                  <Typography
                                    variant="body2"
                                    className="text-gray-600"
                                  >
                                    {rel.type}
                                  </Typography>
                                  {rel.status === "added" && (
                                    <Chip
                                      label="New"
                                      size="small"
                                      color="success"
                                      className="ml-2"
                                    />
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box className="flex justify-between mt-6">
            <Button
              variant="outlined"
              color="primary"
              className="border-blue-600 text-blue-600"
            >
              Export Changes
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={applyChanges}
              className="bg-blue-600 hover:bg-blue-700"
              startIcon={<CheckCircle />}
            >
              Apply Changes to Graph
            </Button>
          </Box>
        </div>
      )}

      {/* Context Dialog */}
      <Dialog
        open={showContextDialog}
        onClose={() => setShowContextDialog(false)}
      >
        <DialogTitle className="flex justify-between items-center">
          <span>
            Add Context for{" "}
            {selectedElement?.type === "table" ? "Table" : "Column"}
          </span>
          <IconButton onClick={() => setShowContextDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className="py-4">
          <Typography variant="h6" className="font-medium mb-2">
            {selectedElement?.name}
          </Typography>

          <Typography variant="body2" className="text-gray-600 mb-4">
            Provide descriptive context to enhance Graph RAG performance. This
            context will be embedded and used for SQL generation and query
            understanding.
          </Typography>

          <TextField
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            label="Context description"
            value={selectedElement?.context || ""}
            onChange={(e) =>
              selectedElement &&
              setSelectedElement({
                ...selectedElement,
                context: e.target.value,
              })
            }
            placeholder="Describe the purpose of this element, its relationships, and any important business rules..."
          />

          <Box className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Typography
              variant="body2"
              className="text-blue-800 flex items-center"
            >
              <Info className="mr-2 text-blue-600" />
              Good context helps the system understand relationships like:
            </Typography>
            <div className="mt-2 flex items-center">
              <Chip label="employees" size="small" className="mr-2" />
              <Link className="text-gray-500 mx-1" />
              <Chip label="departments" size="small" className="ml-2" />
              <Typography variant="body2" className="ml-3 text-gray-700">
                via department_id
              </Typography>
            </div>
          </Box>
        </DialogContent>
        <DialogActions className="px-4 py-3">
          <Button onClick={() => setShowContextDialog(false)}>Cancel</Button>
          <Button
            onClick={saveContext}
            variant="contained"
            color="primary"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Context
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SchemaManagementPage;
