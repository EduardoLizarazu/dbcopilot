import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
// Cancel icon
import CancelIcon from "@mui/icons-material/Cancel";
import KeyIcon from "@mui/icons-material/Key";

export function SchemaBtnForeignKeyAction({
  is_foreign_key,
}: {
  is_foreign_key: boolean;
}) {
  return (
    <>
      {/* Add foreign key */}
      {!is_foreign_key && (
        <Tooltip title="Add Foreign Key">
          <IconButton
            aria-label="add-foreign-key"
            size="small"
            onClick={() => {
              console.log("Add foreign key");
            }}
            loading={false}
          >
            <KeyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
