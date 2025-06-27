"use client";
import React, { useState } from "react";
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
} from "@mui/material";

// Define types based on your structure
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

type SchemaTableProps = {
  data: TSchemaGraph[];
  roleId: string;
};

export const SchemaGraphTable: React.FC<SchemaTableProps> = ({
  data,
  roleId,
}) => {
  const [selectedTables, setSelectedTables] = useState<Set<number>>(new Set());
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(
    new Set()
  );
  const [expandedTables, setExpandedTables] = useState<Set<number>>(new Set());

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

    // Ensure parent table is selected if any column is selected
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
    return table.columns.every((col) =>
      selectedColumns.has(col.column_neo4j_id)
    );
  };

  return (
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
            const isTableSelected = selectedTables.has(table.table_neo4j_id);
            const isTableExpanded = expandedTables.has(table.table_neo4j_id);
            const allColsSelected = allColumnsSelected(table);

            return (
              <React.Fragment key={table.table_neo4j_id}>
                <TableRow hover className={isTableSelected ? "bg-blue-50" : ""}>
                  <TableCell padding="checkbox">
                    <div className="flex items-center">
                      <Checkbox
                        checked={isTableSelected}
                        indeterminate={isTableSelected && !allColsSelected}
                        onChange={() => handleTableSelect(table)}
                        color="primary"
                      />
                      <button
                        onClick={() =>
                          toggleTableExpansion(table.table_neo4j_id)
                        }
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
                    <Collapse in={isTableExpanded} timeout="auto" unmountOnExit>
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
                              const isColSelected = selectedColumns.has(
                                column.column_neo4j_id
                              );

                              return (
                                <TableRow
                                  key={column.column_neo4j_id}
                                  hover
                                  className={isColSelected ? "bg-blue-50" : ""}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={isColSelected}
                                      onChange={() =>
                                        handleColumnSelect(
                                          column.column_neo4j_id,
                                          table.table_neo4j_id
                                        )
                                      }
                                      color="primary"
                                    />
                                  </TableCell>
                                  <TableCell>{column.column_name}</TableCell>
                                  <TableCell>{column.column_alias}</TableCell>
                                  <TableCell>{column.column_type}</TableCell>
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
  );
};
