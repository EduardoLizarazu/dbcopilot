"use client";
import React from "react";
import { ISchemaColumn } from "@/controller/_actions/index.actions";
import { IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import { SchemaAction } from "./schemaBtnActions";
import { FeedbackSnackBar } from "@/components/shared/feedbackSnackBar";
import { SchemaField } from "./schemaField";
import { UpdateSchemaColumn } from "@/controller/_actions/schema/schema.action";
import { SchemaColumnQueryFormat } from "@/controller/_actions/schema/interface/readColumnByTableId.interface";
import KeyIcon from "@mui/icons-material/Key";
// export interface SchemaColumnQueryFormat {
//   column_id: number;
//   column_technical_name: string;
//   column_alias: string | null;
//   column_data_type: string;
//   is_primary_key: boolean | null;
//   is_foreign_key: boolean | null;
//   is_unique: boolean | null;
//   relation_foreign_key_id: number | null; // my own
//   relation_primary_key_id: number | null;
//   relation_is_static: boolean | null;
//   column_key_is_static: boolean[] | null;
//   column_key_type: string[] | null;
// }

export function SchemaColumnBody({
  columns,
}: {
  columns: SchemaColumnQueryFormat;
}) {
  const [schemaColumn, setSchemaColumn] =
    React.useState<SchemaColumnQueryFormat>({
      column_id: 0,
      column_technical_name: "",
      column_alias: null,
      column_description: "",
      column_data_type: "",
      is_primary_key: null,
      is_foreign_key: null,
      is_unique: null,
      relation_foreign_key_id: null,
      relation_primary_key_id: null,
      relation_is_static: null,
      column_key_is_static: [],
      column_key_type: [],
    });

  const [schemaColumnTemp, setSchemaColumnTemp] =
    React.useState<SchemaColumnQueryFormat>({
      column_id: 0,
      column_technical_name: "",
      column_alias: null,
      column_description: "",
      column_data_type: "",
      is_primary_key: null,
      is_foreign_key: null,
      is_unique: null,
      relation_foreign_key_id: null,
      relation_primary_key_id: null,
      relation_is_static: null,
      column_key_is_static: [],
      column_key_type: [],
    });

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
      setSchemaColumn({ ...schemaColumnTemp });
      // const res = await UpdateSchemaColumn(schemaColumnTemp);
      // if (res?.status === 200) {
      //   setFeedback({
      //     isActive: true,
      //     message: "Updated success",
      //     severity: "success",
      //   });
      // } else {
      //   errorFeedback();
      // }
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
    setSchemaColumnTemp({ ...schemaColumn });
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
            txtName="column_technical_name"
            isEditable={isEditable}
            setValue={setSchemaColumnTemp}
            value={schemaColumnTemp?.column_technical_name || "-"}
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
          {/* column_key_type */}
          <SchemaField
            txtName="column_key_type"
            isEditable={isEditable}
            setValue={setSchemaColumnTemp}
            value={schemaColumnTemp?.column_key_type?.join(",") || "-"}
          />
        </TableCell>
        <TableCell>
          {/* column_relation */}
          <Tooltip title="Relation">
            <IconButton
              aria-label="relation"
              size="small"
              onClick={() => console.log("relation")}
              loading={false}
            >
              <KeyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
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
