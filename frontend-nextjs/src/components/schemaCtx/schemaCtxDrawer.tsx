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
        DB Connection ID: {dbConnId || "Not selected"}
      </Typography>
      <Button
        variant="outlined"
        sx={{ m: 2, width: "90%" }}
        onClick={toggleDrawer(false)}
      >
        Close
      </Button>
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"Inbox"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Starred"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"Send email"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Drafts"} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"All mail"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <MailIcon />
            </ListItemIcon>
            <ListItemText primary={"Trash"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <InboxIcon />
            </ListItemIcon>
            <ListItemText primary={"Spam"} />
          </ListItemButton>
        </ListItem>
      </List>
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
