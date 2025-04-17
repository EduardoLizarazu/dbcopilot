import { IconButton, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import { useSchemaContext } from "@/contexts/schema.context";
import { SharedDrawer } from "@/components/shared/shared_drawer";
import { SchemaRelationForm } from "../schemaRelation/schemaRelationForm";

export function SchemaBtnAddRelationPk({
  column_id,
  is_already_foreign_key,
}: {
  column_id: number;
  is_already_foreign_key: boolean;
}) {
  const { foreignKey, setForeignKey } = useSchemaContext();

  function addPrimaryKeyRelation() {
    setForeignKey((prev) => ({
      ...prev,
      isAddingDesc: !prev.isAddingDesc,
      relation_parent_id: column_id,
    }));
    console.log("foreignKey", foreignKey);
  }

  const validDisplayForeignKey =
    foreignKey.isAddingPk &&
    !is_already_foreign_key &&
    foreignKey.relation_child_id !== column_id;

  return (
    <>
      {validDisplayForeignKey && (
        <>
          <Tooltip title="Add Foreign Key">
            <IconButton
              aria-label="add-foreign-key"
              size="small"
              onClick={addPrimaryKeyRelation}
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
          <SharedDrawer
            anchor={"right"}
            open={foreignKey.isAddingDesc}
            toggleDrawer={addPrimaryKeyRelation}
          >
            <SchemaRelationForm />
          </SharedDrawer>
        </>
      )}
    </>
  );
}
