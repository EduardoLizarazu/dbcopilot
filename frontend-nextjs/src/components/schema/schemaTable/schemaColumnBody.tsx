"use client";
import React from "react";
import { ISchemaColumn } from "@/controller/_actions/index.actions";
import { TableCell, TableRow } from "@mui/material";
import { SchemaAction } from "./schemaBtnActions";
import { FeedbackSnackBar } from "@/components/shared/feedbackSnackBar";
import { SchemaField } from "./schemaField";
import { UpdateSchemaColumn } from "@/controller/_actions/schema/schema.action";

export function SchemaColumnBody({ columns }: { columns: ISchemaColumn }) {
  const [schemaColumn, setSchemaColumn] = React.useState<ISchemaColumn>({
    column_id: 0,
    column_name: "",
    column_alias: "",
    column_description: "",
    column_data_type: "",
    foreign_key: 0,
    primary_key: 0,
    relation_description: "",
  });

  const [schemaColumnTemp, setSchemaColumnTemp] = React.useState<ISchemaColumn>(
    {
      column_id: 0,
      column_name: "",
      column_alias: "",
      column_description: "",
      column_data_type: "",
      foreign_key: 0,
      primary_key: 0,
      relation_description: "",
    }
  );

  const [feedback, setFeedback] = React.useState({
    isActive: false,
    message: "",
    severity: null as "success" | "error" | "warning" | "info" | null,
  });

  const [isEditable, setIsEditable] = React.useState(false);

  React.useEffect(() => {
    setSchemaColumn(columns);
    setSchemaColumnTemp(columns);
  }, []);

  const errorFeedback = () => {
    setFeedback({
      isActive: true,
      message: "Error saving the schema column",
      severity: "error",
    });
  };

  const resetFeedback = () => {
    setTimeout(
      () => (
        setFeedback({
          isActive: false,
          message: "",
          severity: null,
        }),
        3000
      )
    );
  };

  async function handleSaveBtn() {
    try {
      setSchemaColumn({...schemaColumnTemp});
      const res = await UpdateSchemaColumn(schemaColumnTemp);
      if (res?.status === 200) {
        setFeedback({
          isActive: true,
          message: "Updated success",
          severity: "success",
        });
      } else {
        errorFeedback();
      }
    } catch (error) {
      console.error("Error saving the schema column: ", error);
      errorFeedback();
    } finally {
      resetFeedback();
      setIsEditable(false);
    }
  }

  async function handleDeleteBtn() {
    try {
      console.log("Delete schema id: ", schemaColumn.column_id);
    } catch (error) {
    } finally {
      resetFeedback();
      setIsEditable(false);
    }
  }

  function handleCancelBtn() {
    setSchemaColumnTemp({...schemaColumn});
    setIsEditable(false);
  }

  function handleEditBtn() {
    setIsEditable(true);
  }

  return (
    <>
      <TableRow key={schemaColumn.column_id + "columns"}>
        <TableCell>
          <SchemaField
            txtName="column_name"
            isEditable={isEditable}
            setValue={setSchemaColumnTemp}
            value={schemaColumnTemp?.column_name || "-"}
          />
        </TableCell>
        <TableCell>
          {/* column_alias */}
          <SchemaField
            txtName="column_alias"
            isEditable={isEditable}
            setValue={setSchemaColumnTemp}
            value={schemaColumnTemp?.column_alias || "-"}
          />
        </TableCell>
        <TableCell>
          {/* column_description */}
          <SchemaField
            txtName="column_description"
            isEditable={isEditable}
            setValue={setSchemaColumnTemp}
            value={schemaColumnTemp?.column_description || "-"}
          />
        </TableCell>
        <TableCell>
          {/* column_data_type */}
          <SchemaField
            txtName="column_data_type"
            isEditable={isEditable}
            setValue={setSchemaColumnTemp}
            value={schemaColumnTemp?.column_data_type || "-"}
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
    </>
  );
}
