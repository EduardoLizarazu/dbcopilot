"use client";
import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/VpnKey";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import React, { Suspense } from "react";
import { ReadColumnByIdWithTable } from "@/controller/_actions/schema/schema.action";
import { SchemaColumnReadById } from "@/controller/_actions/schema/interface/schema_read_column_by_id";
import SearchIcon from "@mui/icons-material/Search";
// export interface SchemaColumnReadById {
//   id: number;
//   technicalName: string;
//   alias: string | null;
//   description: string | null;
//   dataType: string;
//   schemaTable: {
//     id: number;
//     technicalName: string;
//     alias: string | null;
//     description: string | null;
//   };
// }

type SchemaColumnReadByIdState = {
  data: SchemaColumnReadById | null;
  status: number;
};

export function SchemaColumnKeyType({
  pk,
  fk,
}: {
  pk: { is_primary_key: boolean; is_static: boolean };
  fk: {
    relation_foreign_key_id: number;
    is_foreign_key: boolean;
    is_static: boolean;
  };
}) {
  const [open, setOpen] = React.useState(false);

  const [foreignRelation, setForeignRelation] =
    React.useState<SchemaColumnReadById | null>({
      id: 0,
      technicalName: "",
      alias: null,
      description: null,
      dataType: "",
      schemaTable: {
        id: 0,
        technicalName: "",
        alias: null,
        description: null,
      },
    });

  async function handleForeignKeyData() {
    try {
      const foreignKeyData: SchemaColumnReadByIdState =
        await ReadColumnByIdWithTable(fk.relation_foreign_key_id);
      setForeignRelation(foreignKeyData.data);
      console.log("foreignKeyData", foreignKeyData);
    } catch (error) {
      console.error("Error fetching foreign key data: ", error);
    }
  }

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = async () => {
    setOpen(true);
    await handleForeignKeyData();
  };
  return (
    <Stack direction="column" alignItems="center">
      {pk.is_primary_key && (
        <Tooltip title="primary key" placement="left">
          <IconButton
            aria-label="primary key"
            size="small"
            onClick={() => console.log("primary key")}
            loading={false}
          >
            <KeyIcon
              fontSize="inherit"
              style={{
                color: "gold",
                opacity: pk.is_static ? 1 : 0.4,
              }}
            />
          </IconButton>
        </Tooltip>
      )}
      {fk.is_foreign_key && (
        <ClickAwayListener onClickAway={handleTooltipClose}>
          <div>
            <Tooltip
              onClose={handleTooltipClose}
              open={open}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title={
                <Suspense
                  fallback={<div>Loading...</div>} // Fallback content while loading
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <IconButton
                      aria-label="search foreign key data"
                      size="small"
                      onClick={() => console.log("search foreign key data")}
                      loading={false}
                    >
                      <SearchIcon
                        fontSize="small"
                        style={{
                          color: "white",
                        }}
                      />
                    </IconButton>
                    <span style={{ fontWeight: "bold" }}>
                      {foreignRelation?.schemaTable?.technicalName}
                    </span>
                    <span>{foreignRelation?.technicalName}</span>
                  </Stack>
                </Suspense>
              }
              slotProps={{
                popper: {
                  disablePortal: true,
                },
              }}
            >
              {/* <Button onClick={handleTooltipOpen}>Click</Button> */}
              <IconButton
                aria-label="foreign key"
                size="small"
                onClick={handleTooltipOpen}
                loading={false}
              >
                <KeyIcon
                  fontSize="inherit"
                  style={{
                    color: "purple",
                    opacity: fk.is_static ? 1 : 0.4,
                  }}
                />
              </IconButton>
            </Tooltip>
          </div>
        </ClickAwayListener>
      )}
    </Stack>
  );
}
