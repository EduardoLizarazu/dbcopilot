"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Add,
  Remove,
  ChangeCircle,
  Info,
  Edit,
  CheckCircle,
  Cancel,
  ArrowRightAlt,
} from "@mui/icons-material";
import StatusBadge from "./StatusBadge";
import ContextDialog from "./ContextDialog";
import ApplyDialog from "./ApplyDialog";
import { DiffData, Table, Column } from "@/app/schema/page";

interface SchemaDiffViewProps {
  diffData: DiffData;
  onApplyChanges: () => void;
}

const SchemaDiffView: React.FC<SchemaDiffViewProps> = ({
  diffData,
  onApplyChanges,
}) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const handleAddContext = (table: Table, column?: Column) => {
    setSelectedTable(table);
    setSelectedColumn(column || null);
    setContextDialogOpen(true);
  };

  const handleSaveContext = (context: string) => {
    console.log(
      `Saving context for ${selectedColumn ? "column" : "table"}:`,
      context
    );
    // In a real app, this would update your state or make an API call
    setContextDialogOpen(false);
  };

  const handleApply = () => {
    setApplyDialogOpen(false);
    onApplyChanges();
  };

  return (
    <div className="space-y-8">
      {/* Legend */}
      <Paper elevation={0} className="p-4 bg-blue-50 rounded-lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item className="flex items-center">
            <Add className="text-green-600 mr-1" />
            <Typography variant="body2">Added</Typography>
          </Grid>
          <Grid item className="flex items-center">
            <Remove className="text-red-600 mr-1" />
            <Typography variant="body2">Removed</Typography>
          </Grid>
          <Grid item className="flex items-center">
            <ChangeCircle className="text-blue-600 mr-1" />
            <Typography variant="body2">Modified</Typography>
          </Grid>
          <Grid item className="flex items-center">
            <CheckCircle className="text-gray-600 mr-1" />
            <Typography variant="body2">Unchanged</Typography>
          </Grid>
          <Grid item xs />
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setApplyDialogOpen(true)}
              startIcon={<CheckCircle />}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            >
              Apply Changes to Graph
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Schema Comparison */}
      <Grid container spacing={4}>
        {/* Current Database Schema */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="rounded-xl overflow-hidden">
            <Box className="bg-blue-600 text-white p-4">
              <Typography variant="h6" className="font-bold">
                Current Database Schema
              </Typography>
              <Typography variant="body2" className="opacity-80">
                The latest structure of your relational database
              </Typography>
            </Box>

            <Box className="p-4">
              {diffData.tables
                .filter((table) => table.status !== "removed")
                .map((table) => (
                  <Box
                    key={`current-${table.name}`}
                    className={`mb-6 p-4 rounded-lg border-l-4 ${
                      table.status === "added"
                        ? "border-green-500 bg-green-50"
                        : table.status === "modified"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <Box className="flex justify-between items-start">
                      <Box>
                        <Box className="flex items-center">
                          <StatusBadge status={table.status} />
                          <Typography variant="h6" className="font-medium ml-2">
                            {table.name}
                          </Typography>
                        </Box>
                        {table.description && (
                          <Typography
                            variant="body2"
                            className="mt-2 text-gray-700"
                          >
                            {table.description}
                          </Typography>
                        )}
                      </Box>
                      <Tooltip title="Add context">
                        <IconButton
                          size="small"
                          onClick={() => handleAddContext(table)}
                          className="text-blue-600 hover:bg-blue-100"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Divider className="my-3" />

                    <Typography
                      variant="subtitle2"
                      className="font-medium text-gray-600 mb-2"
                    >
                      Columns:
                    </Typography>

                    <div className="space-y-2">
                      {table.columns
                        .filter((col) => col.status !== "removed")
                        .map((column) => (
                          <Box
                            key={`current-col-${column.name}`}
                            className={`flex justify-between items-center p-2 rounded ${
                              column.status === "added"
                                ? "bg-green-100"
                                : column.status === "modified"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                            }`}
                          >
                            <Box className="flex items-center">
                              <StatusBadge status={column.status} small />
                              <Box className="ml-2">
                                <Typography
                                  variant="body2"
                                  className="font-medium"
                                >
                                  {column.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className="text-gray-600"
                                >
                                  {column.type}
                                </Typography>
                              </Box>
                            </Box>
                            <Tooltip title="Add context">
                              <IconButton
                                size="small"
                                onClick={() => handleAddContext(table, column)}
                                className="text-blue-600 hover:bg-blue-200"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                    </div>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>

        {/* Graph Database Schema */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} className="rounded-xl overflow-hidden">
            <Box className="bg-indigo-600 text-white p-4">
              <Typography variant="h6" className="font-bold">
                Graph Database Schema
              </Typography>
              <Typography variant="body2" className="opacity-80">
                Current structure in Neo4j Graph RAG
              </Typography>
            </Box>

            <Box className="p-4">
              {diffData.tables
                .filter((table) => table.status !== "added")
                .map((table) => (
                  <Box
                    key={`graph-${table.name}`}
                    className={`mb-6 p-4 rounded-lg border-l-4 ${
                      table.status === "removed"
                        ? "border-red-500 bg-red-50"
                        : table.status === "modified"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-gray-50"
                    }`}
                  >
                    <Box className="flex justify-between items-start">
                      <Box>
                        <Box className="flex items-center">
                          <StatusBadge status={table.status} />
                          <Typography
                            variant="h6"
                            className={`font-medium ml-2 ${
                              table.status === "removed" ? "text-red-700" : ""
                            }`}
                          >
                            {table.name}
                            {table.status === "modified" && (
                              <span className="text-gray-500 text-sm ml-2">
                                (renamed from {table.name.replace("ee", "")})
                              </span>
                            )}
                          </Typography>
                        </Box>
                        {table.description && (
                          <Typography
                            variant="body2"
                            className="mt-2 text-gray-700"
                          >
                            {table.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Divider className="my-3" />

                    <Typography
                      variant="subtitle2"
                      className="font-medium text-gray-600 mb-2"
                    >
                      Columns:
                    </Typography>

                    <div className="space-y-2">
                      {table.columns
                        .filter((col) => col.status !== "added")
                        .map((column) => (
                          <Box
                            key={`graph-col-${column.name}`}
                            className={`flex items-center p-2 rounded ${
                              column.status === "removed"
                                ? "bg-red-100"
                                : column.status === "modified"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                            }`}
                          >
                            <StatusBadge status={column.status} small />
                            <Box className="ml-2">
                              <Typography
                                variant="body2"
                                className={`font-medium ${
                                  column.status === "removed"
                                    ? "text-red-700"
                                    : ""
                                }`}
                              >
                                {column.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-gray-600"
                              >
                                {column.type}
                                {column.status === "modified" && (
                                  <span className="ml-1 text-xs text-blue-600">
                                    (was:{" "}
                                    {column.type.replace("decimal", "int")})
                                  </span>
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                    </div>
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <ContextDialog
        open={contextDialogOpen}
        onClose={() => setContextDialogOpen(false)}
        onSave={handleSaveContext}
        table={selectedTable}
        column={selectedColumn}
      />

      <ApplyDialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        onApply={handleApply}
        diffData={diffData}
      />
    </div>
  );
};

export default SchemaDiffView;
