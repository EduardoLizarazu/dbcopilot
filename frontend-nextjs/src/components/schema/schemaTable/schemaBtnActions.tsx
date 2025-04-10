import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export function SchemaAction({
  isEditable,
  setIsEditable,
}: {
  isEditable: boolean;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton
          aria-label="edit"
          size="small"
          loading={false}
          onClick={() => setIsEditable((prev) => !prev)}
        >
          {isEditable ? (
            <SaveIcon fontSize="inherit" />
          ) : (
            <EditIcon fontSize="inherit" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton aria-label="delete" size="small" loading={false}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );
}
