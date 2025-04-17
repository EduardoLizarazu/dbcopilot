"use client";
import { IconButton, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import { useSchemaContext } from "@/contexts/schema.context";
import { SharedDrawer } from "@/components/shared/shared_drawer";
import { SchemaRelationForm } from "./schemaRelationForm";
import React from "react";

export function SchemaBtnForeignKeyAddAction({
  column_id,
  is_already_foreign_key,
}: {
  column_id: number;
  is_already_foreign_key: boolean;
}) {
  const { foreignKey, setForeignKey } = useSchemaContext();

  const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);

  function addPrimaryKeyRelation() {
    toggleDrawer();
    setForeignKey((prev) => ({
      ...prev,
      relation_parent_id: column_id,
    }));
    console.log("foreignKey", foreignKey);
  }

  function toggleDrawer() {
    setOpenDrawer((prev: boolean) => !prev);
  }

  const validDisplayForeignKey =
    foreignKey.isEditing &&
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
            open={openDrawer}
            toggleDrawer={toggleDrawer}
          >
            <SchemaRelationForm />
          </SharedDrawer>
        </>
      )}
    </>
  );
}
