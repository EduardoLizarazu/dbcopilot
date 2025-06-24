import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export function SharedTableAction({
  handleEditBtn,
  handleDeleteBtn,
}: {
  handleEditBtn: () => void;
  handleDeleteBtn: () => void;
}) {
  return (
    <>
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
