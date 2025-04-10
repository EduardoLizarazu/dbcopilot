"use client";
import {
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import React from "react";
import { ISchemaTable } from "@/controller/_actions/index.actions";
import { SchemaColumnHead } from "./schemaColumnHead";
import { SchemaAction } from "./schemaBtnActions";

export function SchemaTableBody({
  schemaTableData,
}: {
  schemaTableData: ISchemaTable;
}) {
  const [openColumn, setOpenColumn] = React.useState(false);

  const [schemaTable, setSchemaTable] = React.useState<ISchemaTable>({
    table_id: 0,
    table_name: "",
    table_alias: "",
    table_description: "",
  });

  const [isEditable, setIsEditable] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const data = await schemaTableData;
      setSchemaTable(data);
    })();
  }, []);

  function handleSaveBtn() {
    try {
      console.log("Save schema table:", schemaTable?.table_id);
    } catch (error) {
      console.log("Error saving schema table:", error);
    }
  }

  function handleDelete() {
    try {
      console.log("Delete schema table:", schemaTable?.table_id);
    } catch (error) {
      console.log("Error deleting schema table:", error);
    }
  }

  return (
    <>
      <TableRow key={schemaTable?.table_id + "tables"}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpenColumn(!openColumn)}
          >
            {openColumn ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {isEditable ? (
            <TextField
              defaultValue={schemaTable?.table_name}
              size="small"
              onBlur={(e) =>
                setSchemaTable((prev) => ({
                  ...prev,
                  table_name: e.target.value,
                }))
              }
              variant="outlined"
            />
          ) : (
            <span>{schemaTable?.table_name}</span>
          )}
        </TableCell>
        <TableCell>{schemaTable?.table_alias}</TableCell>
        <TableCell>{schemaTable?.table_description}</TableCell>
        <TableCell>
          <SchemaAction isEditable={isEditable} setIsEditable={setIsEditable} />
        </TableCell>
      </TableRow>
      <TableRow key={schemaTable?.table_id + "columns"}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={openColumn} timeout="auto" unmountOnExit>
            <SchemaColumnHead tableId={schemaTable?.table_id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
