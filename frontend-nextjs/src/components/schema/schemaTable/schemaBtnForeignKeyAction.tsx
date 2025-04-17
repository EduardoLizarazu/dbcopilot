import { IconButton, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import { useSchemaContext } from "@/contexts/schema.context";

export function SchemaBtnForeignKeyAction({
  is_foreign_key,
  relation_foreign_key_id,
}: {
  is_foreign_key: boolean;
  relation_foreign_key_id: number;
}) {
  const { foreignKey, setForeignKey } = useSchemaContext();

  function toggleForeignKey() {
    setForeignKey((prev) => ({
      ...prev,
      relation_child_id: relation_foreign_key_id,
      isEditing: !prev.isEditing,
    }));
    console.log("foreignKey", foreignKey);
  }

  return (
    <>
      {/* Add foreign key */}
      {!is_foreign_key && (
        <Tooltip title="Add Foreign Key">
          <IconButton
            aria-label="add-foreign-key"
            size="small"
            onClick={toggleForeignKey}
            loading={false}
          >
            <KeyIcon
              fontSize="inherit"
              style={{
                color: foreignKey.isEditing ? "blue" : "red",
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
