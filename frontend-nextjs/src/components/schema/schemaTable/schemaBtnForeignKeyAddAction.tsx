import { IconButton, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import { useSchemaContext } from "@/contexts/schema.context";

export function SchemaBtnForeignKeyAddAction({
  column_id,
  is_already_foreign_key,
}: {
  column_id: number;
  is_already_foreign_key: boolean;
}) {
  const { foreignKey, setForeignKey } = useSchemaContext();

  function saveRelation() {
    setForeignKey((prev) => ({
      ...prev,
      relation_parent_id: column_id,
      isEditing: !prev.isEditing,
    }));
    console.log("foreignKey", foreignKey);
  }

  const validDisplayForeignKey =
    foreignKey.isEditing &&
    !is_already_foreign_key &&
    foreignKey.relation_child_id !== column_id;

  return (
    <>
      {validDisplayForeignKey && (
        <Tooltip title="Add Foreign Key">
          <IconButton
            aria-label="add-foreign-key"
            size="small"
            onClick={saveRelation}
            loading={false}
          >
            <KeyIcon
              fontSize="inherit"
              style={{
                color: "gold",
                opacity: 0.5,
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
