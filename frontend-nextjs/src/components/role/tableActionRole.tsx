import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SchemaIcon from "@mui/icons-material/Schema";

export function TableActionRole({
  handleEditBtn,
  handleDeleteBtn,
  handleSchemaBtn,
}: {
  handleEditBtn: () => void;
  handleDeleteBtn: () => void;
  handleSchemaBtn: () => void;
}) {
  return (
    <>
      <Tooltip title="Schema">
        <IconButton
          aria-label="schema"
          size="small"
          onClick={handleSchemaBtn}
          loading={false}
        >
          <SchemaIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit">
        <IconButton
          aria-label="save"
          size="small"
          onClick={handleEditBtn}
          loading={false}
        >
          <EditIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          aria-label="cancel"
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
