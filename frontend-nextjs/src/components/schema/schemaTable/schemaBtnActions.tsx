import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
// Cancel icon
import CancelIcon from "@mui/icons-material/Cancel";

export function SchemaAction({
  isEditable,
  handleEditBtn,
  handleSaveBtn,
  handleCancelBtn,
}: {
  isEditable: boolean;
  handleEditBtn: () => void;
  handleSaveBtn: () => void;
  handleCancelBtn: () => void;
}) {
  return (
    <>
      {!isEditable ? (
        <>
          <Tooltip title="Edit">
            <IconButton
              aria-label="edit"
              size="small"
              onClick={handleEditBtn}
              loading={false}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip title="Save">
            <IconButton
              aria-label="save"
              size="small"
              onClick={handleSaveBtn}
              loading={false}
            >
              <SaveIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cancel">
            <IconButton
              aria-label="cancel"
              size="small"
              onClick={handleCancelBtn}
              loading={false}
            >
              <CancelIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      )}
      {/* Add foreign key */}
      <Tooltip title="Add Foreign Key">
        <IconButton
          aria-label="add-foreign-key"
          size="small"
          onClick={() => { console.log("Add foreign key") }}
          loading={false}
        >
          <AddIcon fontSize="inherit" />
        </IconButton>


      {/* <Tooltip title="Delete">
        <IconButton
          aria-label="delete"
          size="small"
          onClick={handleDeleteBtn}
          loading={false}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip> */}
    </>
  );
}
