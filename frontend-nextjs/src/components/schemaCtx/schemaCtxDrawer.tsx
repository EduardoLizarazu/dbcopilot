"use client";

import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { Typography } from "@mui/material";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { ReadSchemaCtxByConnIdAction } from "@/_actions/schemaCtx/by-conn-id.action";

type Anchor = "right";

export function SchemaCtxDrawerComponent({
  dbConnectionId,
}: {
  dbConnectionId: string;
}) {
  const [dbConnId, setDbConnId] = React.useState<string | null>(
    dbConnectionId || null
  );
  const [state, setState] = React.useState({
    right: false,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [schemaCtxBase, setSchemaCtxBase] =
    React.useState<TSchemaCtxBaseDto | null>(null);

  React.useEffect(() => {
    (async () => {
      if (dbConnectionId) {
        const schemaCtx = await ReadSchemaCtxByConnIdAction({
          connId: dbConnectionId,
        });
        if (schemaCtx?.ok) {
          setSchemaCtxBase(schemaCtx.data);
        }
        console.log(
          "SchemaCtxDrawerComponent - dbConnectionId changed:",
          schemaCtx
        );
      }
    })();
  }, [dbConnectionId]);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setState({ right: open });
    };

  const list = () => (
    <Box
      sx={{ width: 400 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      // onKeyDown={toggleDrawer(false)}
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        Schema Context: {schemaCtxBase?.name || "Not found or selected"}
      </Typography>
      <Button
        variant="outlined"
        sx={{ m: 2, width: "90%" }}
        onClick={toggleDrawer(false)}
      >
        Close
      </Button>
      {/* You can add more detailed schema context information here */}
      <Box></Box>
    </Box>
  );

  return (
    <div>
      <React.Fragment>
        <Button onClick={toggleDrawer(true)}>{"right"}</Button>
        <Drawer
          anchor="right"
          open={state.right}
          onClose={toggleDrawer(false)}
          variant="persistent"
          ModalProps={{
            keepMounted: true,
          }}
        >
          {list()}
        </Drawer>
      </React.Fragment>
    </div>
  );
}
