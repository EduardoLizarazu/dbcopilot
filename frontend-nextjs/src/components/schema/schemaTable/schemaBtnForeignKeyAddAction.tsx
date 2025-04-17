import { IconButton, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import { useSchemaContext } from "@/contexts/schema.context";

export function SchemaBtnForeignKeyAddAction({
  column_id,
}: {
  column_id: number;
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

  return (
    <>
      {foreignKey.isEditing && (
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
                color: "yellow",
                opacity: 0.5,
              }}
            />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
