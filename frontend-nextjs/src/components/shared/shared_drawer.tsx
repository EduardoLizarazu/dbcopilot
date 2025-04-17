import { Box, Button, Drawer } from "@mui/material";
import React from "react";

type anchor = "left" | "right" | "top" | "bottom";

export function SharedDrawer({
  anchor,
  children,
  open,
  toggleDrawer,
}: {
  anchor: anchor;
  children: React.ReactNode;
  open: boolean;
  toggleDrawer: () => void;
}) {
  return (
    <>
      <Drawer open={open} anchor={anchor} onClose={toggleDrawer}>
        <Box sx={{ width: 400, marginTop: 10 }} role="presentation">
          {children}
        </Box>
      </Drawer>
    </>
  );
}
