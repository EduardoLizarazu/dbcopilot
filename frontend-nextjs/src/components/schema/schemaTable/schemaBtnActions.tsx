import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
// Cancel icon
import CancelIcon from "@mui/icons-material/Cancel";

export function SchemaAction({
  isEditable,
  setIsEditable,
}: {
  isEditable: boolean;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleIsEditable = () => setIsEditable((prev) => !prev);

  return (
    <>
      {!isEditable ? (
        <Tooltip title="Edit">
          <IconButton
            aria-label="edit"
            size="small"
            onClick={() => setIsEditable((prev) => !prev)}
            loading={false}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Save">
            <IconButton
              aria-label="save"
              size="small"
              onClick={() => setIsEditable((prev) => !prev)}
              loading={false}
            >
              <SaveIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cancel">
            <IconButton
              aria-label="cancel"
              size="small"
              onClick={() => setIsEditable((prev) => !prev)}
              loading={false}
            >
              <CancelIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Tooltip title="Delete">
        <IconButton
          aria-label="delete"
          size="small"
          onClick={() => setIsEditable((prev) => !prev)}
          loading={false}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );
}
