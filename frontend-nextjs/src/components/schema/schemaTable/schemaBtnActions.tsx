import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
// Cancel icon
import CancelIcon from "@mui/icons-material/Cancel";

export function SchemaAction({
  actionStatus,
  setActionStatus,
  handleSaveBtn,
  handleDeleteBtn,
}: {
  actionStatus: { isEditable: boolean; isSaved: boolean };
  setActionStatus: React.Dispatch<
    React.SetStateAction<{ isEditable: boolean; isSaved: boolean }>
  >;
  handleSaveBtn: () => void;
  handleDeleteBtn: () => void;
}) {
  return (
    <>
      {!actionStatus.isEditable ? (
        <>
          <Tooltip title="Edit">
            <IconButton
              aria-label="edit"
              size="small"
              onClick={() =>
                setActionStatus((prev) => ({
                  ...prev,
                  isEditable: !prev.isEditable,
                }))
              }
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
              onClick={() => {
                setActionStatus((prev) => ({
                  isSaved: !prev.isSaved,
                  isEditable: !prev.isEditable,
                }));
                handleSaveBtn();
              }}
              loading={false}
            >
              <SaveIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Cancel">
            <IconButton
              aria-label="cancel"
              size="small"
              onClick={() =>
                setActionStatus((prev) => ({
                  ...prev,
                  isEditable: !prev.isEditable,
                }))
              }
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
          onClick={() =>
            setActionStatus((prev) => ({
              ...prev,
              isEditable: !prev.isEditable,
            }))
          }
          loading={false}
        >
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </>
  );
}
