"use client";
import { Collapse, IconButton, TableCell, TableRow } from "@mui/material";
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

  const [btnState, setBtnState] = React.useState({
    save: false,
    delete: false,
  });

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
        <TableCell>{schemaTable?.table_name}</TableCell>
        <TableCell>{schemaTable?.table_alias}</TableCell>
        <TableCell>{schemaTable?.table_description}</TableCell>
        <TableCell>
          <SchemaAction />
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
