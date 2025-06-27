"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Collapse,
  Box,
  Typography,
  Stack,
  Button,
  Link,
} from "@mui/material";

// Define types
type TSchemaGraphColumn = {
  column_type: string;
  column_alias: string;
  column_key_type: string;
  column_name: string;
  column_description: string;
  column_neo4j_id: number;
};

type TSchemaGraph = {
  table_neo4j_id: number;
  table_name: string;
  table_alias: string;
  table_description: string;
  columns: TSchemaGraphColumn[];
};

type TSchemaGraphDb = {
  role_id: number;
  column_id: number;
  table_id: number;
};

type SchemaTableProps = {
  data: TSchemaGraph[];
  dataRole: TSchemaGraphDb[];
};

export const SchemaGraphTable: React.FC<SchemaTableProps> = ({
  data,
  dataRole,
}) => {
  const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(
    new Set()
  );
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());

  // Initialize selections based on dataRole
  useEffect(() => {
    const initialSelectedTables = new Set<number>();
    const initialSelectedColumns = new Set<number>();

    // Process dataRole to select matching tables and columns
    dataRole.forEach((role) => {
      // Find table that matches this role's table_id
      const matchingTable = data.find(
        (table) => table.table_neo4j_id === role.table_id
      );

      if (matchingTable) {
        initialSelectedTables.add(role.table_id);

        // Find matching column within the table
        const matchingColumn = matchingTable.columns.find(
          (col) => col.column_neo4j_id === role.column_id
        );

        if (matchingColumn) {
          initialSelectedColumns.add(role.column_id);
        }
      }
    });

    setSelectedTables(initialSelectedTables);
    setSelectedColumns(initialSelectedColumns);
  }, [data, dataRole]);

  // Toggle table expansion
  const toggleTableExpansion = (tableId: number) => {
    setExpandedTables((prev) => {
      const newSet = new Set(prev);
      newSet.has(tableId) ? newSet.delete(tableId) : newSet.add(tableId);
      return newSet;
    });
  };

  // Handle table selection
  const handleTableSelect = (table: TSchemaGraph) => {
    const isSelected = selectedTables.has(table.table_neo4j_id);

    setSelectedTables((prev) => {
      const newSet = new Set(prev);
      isSelected
        ? newSet.delete(table.table_neo4j_id)
        : newSet.add(table.table_neo4j_id);
      return newSet;
    });

    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      if (!isSelected) {
        // Add all columns
        table.columns.forEach((col) => newSet.add(col.column_neo4j_id));
      } else {
        // Remove all columns
        table.columns.forEach((col) => newSet.delete(col.column_neo4j_id));
      }
      return newSet;
    });
  };

  // Handle column selection
  const handleColumnSelect = (columnId: number, tableId: number) => {
    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      newSet.has(columnId) ? newSet.delete(columnId) : newSet.add(columnId);
      return newSet;
    });

    // Ensure parent table is selected
    setSelectedTables((prev) => {
      const newSet = new Set(prev);
      if (!newSet.has(tableId)) {
        newSet.add(tableId);
      }
      return newSet;
    });
  };

  // Check if all columns in a table are selected
  const allColumnsSelected = (table: TSchemaGraph) => {
    return (
      table.columns.length > 0 &&
      table.columns.every((col) => selectedColumns.has(col.column_neo4j_id))
    );
  };

  // Check if any columns in a table are selected (for indeterminate state)
  const someColumnsSelected = (table: TSchemaGraph) => {
    return (
      !allColumnsSelected(table) &&
      table.columns.some((col) => selectedColumns.has(col.column_neo4j_id))
    );
  };

  async function handleAccept() {
    try {
    } catch (error) {}
  }

  return (
    <>
      <Stack spacing={2} sx={{ marginTop: 4 }}>
        <Stack direction="row" spacing={2}>
          <Button color="primary" variant="contained" onClick={handleAccept}>
            Accept
          </Button>
          <Link href="/auth/roles">
            <Button color="error" variant="contained">
              Cancel
            </Button>
          </Link>
        </Stack>
        <TableContainer className="border rounded-lg shadow-sm">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell className="font-semibold">Table Name</TableCell>
                <TableCell className="font-semibold">Alias</TableCell>
                <TableCell className="font-semibold">Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((table) => {
                const tableId = table.table_neo4j_id;
                const isTableSelected = selectedTables.has(tableId);
                const isTableExpanded = expandedTables.has(tableId);
                const allColsSelected = allColumnsSelected(table);
                const someColsSelected = someColumnsSelected(table);

                return (
                  <React.Fragment key={tableId}>
                    <TableRow
                      hover
                      className={isTableSelected ? "bg-blue-50" : ""}
                    >
                      <TableCell padding="checkbox">
                        <div className="flex items-center">
                          <Checkbox
                            checked={isTableSelected}
                            indeterminate={!allColsSelected && someColsSelected}
                            onChange={() => handleTableSelect(table)}
                            color="primary"
                          />
                          <button
                            onClick={() => toggleTableExpansion(tableId)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            {isTableExpanded ? "▼" : "►"}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>{table.table_name}</TableCell>
                      <TableCell>{table.table_alias}</TableCell>
                      <TableCell>{table.table_description}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="p-0 border-b border-gray-200"
                      >
                        <Collapse
                          in={isTableExpanded}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={1}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              className="font-medium"
                            >
                              Columns
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell padding="checkbox" />
                                  <TableCell className="font-medium">
                                    Column Name
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    Alias
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    Type
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    Key Type
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    Description
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {table.columns.map((column) => {
                                  const columnId = column.column_neo4j_id;
                                  const isColSelected =
                                    selectedColumns.has(columnId);

                                  return (
                                    <TableRow
                                      key={columnId}
                                      hover
                                      className={
                                        isColSelected ? "bg-blue-50" : ""
                                      }
                                    >
                                      <TableCell padding="checkbox">
                                        <Checkbox
                                          checked={isColSelected}
                                          onChange={() =>
                                            handleColumnSelect(
                                              columnId,
                                              tableId
                                            )
                                          }
                                          color="primary"
                                        />
                                      </TableCell>
                                      <TableCell>
                                        {column.column_name}
                                      </TableCell>
                                      <TableCell>
                                        {column.column_alias}
                                      </TableCell>
                                      <TableCell>
                                        {column.column_type}
                                      </TableCell>
                                      <TableCell>
                                        {column.column_key_type}
                                      </TableCell>
                                      <TableCell>
                                        {column.column_description}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  );
};
