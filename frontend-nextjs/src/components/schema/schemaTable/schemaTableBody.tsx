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
import {
  ISchemaTable,
  UpdateSchemaTable,
} from "@/controller/_actions/index.actions";
import { SchemaColumnHead } from "./schemaColumnHead";
import { SchemaAction } from "./schemaBtnActions";
import { SchemaField } from "./schemaField";
import { FeedbackSnackBar } from "@/components/shared/feedbackSnackBar";

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

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
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
      console.log("Action status is saved:", actionStatus.isSaved);

      const res = await UpdateSchemaTable(schemaTable);
      console.log("Response from save schema table:", res);

      setFeedback({
        isActive: true,
        message: "Schema table updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.log("Error saving schema table:", error);
      setFeedback({
        isActive: true,
        message: "Error updating schema table",
        severity: "error",
      });
    } finally {
      // time
      setTimeout(() => {
        setFeedback({ isActive: false, message: "", severity: null });
      }, 3000);
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
        <TableCell>
          <SchemaField
            actionStatus={actionStatus}
            setSchemaTable={setSchemaTable}
            value={schemaTable?.table_alias}
          />
        </TableCell>
        <TableCell>
          <SchemaField
            actionStatus={actionStatus}
            setSchemaTable={setSchemaTable}
            value={schemaTable?.table_description}
          />
        </TableCell>
        <TableCell>
          <SchemaAction
            actionStatus={actionStatus}
            setActionStatus={setActionStatus}
            handleSaveBtn={handleSaveBtn}
            handleDeleteBtn={handleDeleteBtn}
          />
          {feedback.isActive && (
            <FeedbackSnackBar
              message={feedback.message}
              severity={feedback.severity}
            />
          )}
        </TableCell>
      </TableRow>
      <TableRow key={schemaTable?.table_id + "columns"}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={openColumn} timeout="auto" unmountOnExit>
            {/* schema column */}
            <SchemaColumnHead tableId={schemaTable?.table_id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}
