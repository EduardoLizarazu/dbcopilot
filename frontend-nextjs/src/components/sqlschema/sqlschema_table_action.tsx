"use client";
import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import SchemaIcon from "@mui/icons-material/Schema";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";

export function SqlSchemaTableAction({
  handleEditBtn,
  handleDeleteBtn,
}: {
  handleEditBtn: () => void;
  handleDeleteBtn: () => void;
}) {
  return (
    <>
      <Tooltip title="edit" placement="bottom">
        <IconButton
          aria-label="edit"
          size="small"
          onClick={handleEditBtn}
          loading={false}
        >
          <EditIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="delete" placement="bottom">
        <IconButton
          aria-label="delete"
          size="small"
          onClick={handleDeleteBtn}
          loading={false}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );
}
