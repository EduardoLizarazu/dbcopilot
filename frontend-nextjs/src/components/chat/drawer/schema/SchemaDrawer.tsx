"use client";
import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  TextField,
  Divider,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

interface Column {
  column_alias: string;
  column_description: string;
}

interface Table {
  table_neo4j_id: number;
  table_alias: string;
  table_description: string;
  columns: Column[];
}

interface SchemaDrawerProps {
  tables: Table[];
}

export function SchemaDrawer({ tables }: SchemaDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTable, setExpandedTable] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleExpand = (tableId: number) => {
    setExpandedTable(expandedTable === tableId ? null : tableId);
  };

  // Filter tables and columns based on search term
  const filteredTables = tables
    .map((table) => {
      const filteredColumns = table.columns.filter(
        (column) =>
          column.column_alias.toLowerCase().includes(searchTerm) ||
          column.column_description.toLowerCase().includes(searchTerm)
      );

      const tableMatches =
        table.table_alias.toLowerCase().includes(searchTerm) ||
        table.table_description.toLowerCase().includes(searchTerm);

      if (tableMatches || filteredColumns.length > 0) {
        return { ...table, columns: filteredColumns };
      }
      return null;
    })
    .filter(Boolean) as Table[];

  return (
    <Box
      sx={{
        overflow: "auto",
        bgcolor: "background.paper",
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search tables and columns..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{
          p: 2,
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          zIndex: 1,
        }}
      />

      <Divider />

      <List>
        {filteredTables.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: "center" }}>
            No matching tables or columns found
          </Typography>
        ) : (
          filteredTables.map((table) => (
            <React.Fragment key={table.table_neo4j_id}>
              <ListItemButton
                onClick={() => toggleExpand(table.table_neo4j_id)}
              >
                <ListItemText
                  primary={table.table_alias}
                  secondary={table.table_description}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
                {expandedTable === table.table_neo4j_id ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )}
              </ListItemButton>

              <Collapse
                in={expandedTable === table.table_neo4j_id}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {table.columns.map((column, index) => (
                    <ListItem
                      key={`${table.table_neo4j_id}-${index}`}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText
                        primary={column.column_alias}
                        secondary={column.column_description}
                        secondaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
}
