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
import { SchemaField } from "./schemaField";

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

  const [actionStatus, setActionStatus] = React.useState({
    isEditable: false,
    isSaved: false,
  });

  React.useEffect(() => {
    (async () => {
      const data = await schemaTableData;
      setSchemaTable(data);
    })();
  }, []);

  async function handleSaveBtn() {
    try {
      console.log("Save schema table:", schemaTable);
    } catch (error) {
      console.log("Error saving schema table:", error);
    }
  }

  async function handleDeleteBtn() {
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
          <SchemaField
            actionStatus={actionStatus}
            setSchemaTable={setSchemaTable}
            value={schemaTable?.table_name}
          />
        </TableCell>
        <TableCell>{schemaTable?.table_alias}</TableCell>
        <TableCell>{schemaTable?.table_description}</TableCell>
        <TableCell>
          <SchemaAction
            actionStatus={actionStatus}
            setActionStatus={setActionStatus}
            handleSaveBtn={handleSaveBtn}
            handleDeleteBtn={handleDeleteBtn}
          />
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
