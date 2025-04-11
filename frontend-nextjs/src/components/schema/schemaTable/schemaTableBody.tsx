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

  const [schemaTableTemp, setSchemaTableTemp] = React.useState<ISchemaTable>({
    table_id: 0,
    table_name: "",
    table_alias: "",
    table_description: "",
  });

  const [isEditable, setIsEditable] = React.useState(false);

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

  React.useEffect(() => {
    (async () => {
      const data = await schemaTableData;
      setSchemaTable(data);
      setSchemaTableTemp(data);
    })();
  }, []);

  async function handleSaveBtn() {
    try {
      // Pass temp to schemaTable
      setSchemaTable({ ...schemaTableTemp });
      const res = await UpdateSchemaTable(schemaTableTemp);

      if (res?.status === 200) {
        setFeedback({
          isActive: true,
          message: "Schema table updated successfully",
          severity: "success",
        });
      } else {
        setFeedback({
          isActive: true,
          message: "Error updating schema table",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error saving schema table:", error);
      setFeedback({
        isActive: true,
        message: "Error updating schema table",
        severity: "error",
      });
      handleCancelBtn(); // Reset to original data
    } finally {
      // time - feedback
      setTimeout(() => {
        setFeedback({ isActive: false, message: "", severity: null });
      }, 3000);
      // reset editable state
      setIsEditable(false);
    }
  }

  function handleCancelBtn() {
    setSchemaTableTemp(schemaTable); // Reset to original data
    setIsEditable(false); // Reset editable state
  }

  function handleEditBtn() {
    setIsEditable(true);
  }

  async function handleDeleteBtn() {
    try {
      console.log("Delete schema table:", schemaTable?.table_id);
    } catch (error) {
      console.log("Error deleting schema table:", error);
    } finally {
      // time - feedback
      setTimeout(() => {
        setFeedback({ isActive: false, message: "", severity: null });
      }, 3000);
      // reset editable status
      setIsEditable(false);
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
            txtName="table_name"
            isEditable={isEditable}
            setValue={setSchemaTableTemp}
            value={schemaTableTemp?.table_name}
          />
        </TableCell>
        <TableCell>
          <SchemaField
            txtName="table_alias"
            isEditable={isEditable}
            setValue={setSchemaTableTemp}
            value={schemaTableTemp?.table_alias}
          />
        </TableCell>
        <TableCell>
          <SchemaField
            txtName="table_description"
            isEditable={isEditable}
            setValue={setSchemaTableTemp}
            value={schemaTableTemp?.table_description}
          />
        </TableCell>
        <TableCell>
          <SchemaAction
            isEditable={isEditable}
            handleEditBtn={handleEditBtn}
            handleSaveBtn={handleSaveBtn}
            handleCancelBtn={handleCancelBtn}
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
