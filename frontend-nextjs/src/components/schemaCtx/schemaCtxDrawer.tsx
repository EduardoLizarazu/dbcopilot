"use client";

import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { ReadSchemaCtxByConnIdAction } from "@/_actions/schemaCtx/by-conn-id.action";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [openCollTable, setOpenCollTable] = React.useState(false);

  const [schemaCtxBase, setSchemaCtxBase] =
    React.useState<TSchemaCtxBaseDto | null>(null);

  React.useEffect(() => {
    (async () => {
      if (dbConnectionId) {
        try {
          setIsLoading(true);
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
        } finally {
          setIsLoading(false);
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
      // don't close on any click inside the drawer content
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
      <Box>
        <TableContainer component={Paper}>
          <Table aria-label="schema context table" size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 700 }}>Schema</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Column</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {schemaCtxBase?.schemaCtx?.map((schema) =>
                    schema.tables.map((table) =>
                      table.columns.map((column, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <IconButton
                              onClick={() => setOpenCollTable((prev) => !prev)}
                            >
                              {openCollTable ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>{schema.name}</TableCell>
                          <TableCell>{table.name}</TableCell>
                          <TableCell>{column.name}</TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );

  return (
    <div>
      <React.Fragment>
        <IconButton onClick={toggleDrawer(true)} color="inherit">
          <MenuOpenIcon />
        </IconButton>
        <Drawer
          anchor="right"
          open={state.right}
          onClose={toggleDrawer(false)}
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
