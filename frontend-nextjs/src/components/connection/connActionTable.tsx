"use client";
import { IconButton, Tooltip } from "@mui/material";
import SchemaIcon from "@mui/icons-material/Schema";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";

export function ConnActionTable({
  handleEditBtn,
  handleDeleteBtn,
  handleSchemaBtn,
  handleTestBtn,
}: {
  handleEditBtn: () => void;
  handleDeleteBtn: () => void;
  handleSchemaBtn: () => void;
  handleTestBtn: () => void;
}) {
  return (
    <>
      <Tooltip title="test connection" placement="bottom">
        <IconButton
          aria-label="test-connection"
          size="small"
          onClick={handleTestBtn}
          loading={false}
        >
          <LinkIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Tooltip title="schema" placement="bottom">
        <IconButton
          aria-label="schema"
          size="small"
          onClick={handleSchemaBtn}
          loading={false}
        >
          <SchemaIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
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
