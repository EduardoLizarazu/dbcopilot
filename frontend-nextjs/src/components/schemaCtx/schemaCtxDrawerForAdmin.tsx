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
  Collapse,
  TextField,
  Divider,
  Stack,
} from "@mui/material";
import { TSchemaCtxBaseDto } from "@/core/application/dtos/schemaCtx.dto";
import { ReadSchemaCtxByConnIdAction } from "@/_actions/schemaCtx/by-conn-id.action";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

type Anchor = "right";

export function SchemaCtxDrawerForAdminComponent({
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

  // Track which rows are open keyed by a unique row id
  const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});

  const toggleRow = (rowKey: string) => {
    setOpenRows((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
  };

  const [schemaCtxBase, setSchemaCtxBase] =
    React.useState<TSchemaCtxBaseDto | null>(null);

  // Search query for client-side filtering
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const normalize = (s?: any) => (s ?? "").toString().toLowerCase();

  const matchesSearch = (
    schema: any,
    table: any,
    column: any,
    tokens: string[]
  ) => {
    if (!tokens.length) return true;

    const combined = [
      schema?.name,
      schema?.description,
      ...(schema?.aliases ?? []),
      table?.name,
      table?.description,
      ...(table?.aliases ?? []),
      column?.name,
      column?.description,
      ...(column?.aliases ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return tokens.every((t) => combined.includes(t));
  };

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
      sx={{ width: 500 }}
      role="presentation"
      // don't close on any click inside the drawer content
      // onKeyDown={toggleDrawer(false)}
    >
      <Typography variant="h6" sx={{ p: 2 }}>
        Schema Context: {schemaCtxBase?.name || "Not found or selected"}
      </Typography>
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      <Button
        variant="outlined"
        sx={{ m: 3, width: "100%", maxWidth: 450 }}
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
                  {(() => {
                    const tokens = searchQuery
                      .toLowerCase()
                      .split(/\s+/)
                      .filter(Boolean);

                    return (
                      schemaCtxBase?.schemaCtx?.map((schema) =>
                        schema?.tables?.map((table) =>
                          table?.columns?.map((column, index) => {
                            if (!matchesSearch(schema, table, column, tokens))
                              return null;

                            const rowKey =
                              column?.id ??
                              `${schema?.id ?? schema?.name}-${table?.id ?? table?.name}-${column?.name}-${index}`;

                            return (
                              <React.Fragment key={rowKey}>
                                <TableRow hover>
                                  <TableCell>
                                    <IconButton
                                      onClick={() => toggleRow(rowKey)}
                                    >
                                      {openRows[rowKey] ? (
                                        <KeyboardArrowUpIcon />
                                      ) : (
                                        <KeyboardArrowDownIcon />
                                      )}
                                    </IconButton>
                                  </TableCell>
                                  <TableCell>{schema?.name}</TableCell>
                                  <TableCell>{table?.name}</TableCell>
                                  <TableCell>{column?.name}</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    style={{ paddingBottom: 0, paddingTop: 0 }}
                                    colSpan={4}
                                  >
                                    <Collapse
                                      in={!!openRows[rowKey]}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <Box sx={{ margin: 2 }}>
                                        <Stack spacing={2} direction="column">
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                          >
                                            Schema: {schema?.name}{" "}
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Description:{" "}
                                              {schema?.description || "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Aliases:{" "}
                                              {schema?.aliases?.join(", ") ||
                                                "..."}
                                            </i>
                                          </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2, mt: 2 }} />
                                        <Stack spacing={2} direction="column">
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                          >
                                            Table: {table?.name}{" "}
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Description:{" "}
                                              {table?.description || "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Aliases:{" "}
                                              {table?.aliases?.join(", ") ||
                                                "..."}
                                            </i>
                                          </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2, mt: 2 }} />
                                        <Stack spacing={2} direction="column">
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                          >
                                            Column: {column?.name || "..."}{" "}
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Description:{" "}
                                              {column?.description || "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              {" "}
                                              Aliases:{" "}
                                              {column?.aliases?.join(", ") ||
                                                "..."}
                                            </i>
                                          </Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 2, mt: 2 }} />
                                        <Stack spacing={2} direction="column">
                                          <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                          >
                                            Profile Data:
                                          </Typography>

                                          <Typography variant="body2">
                                            <i>
                                              Max Value:{" "}
                                              {column?.profile
                                                ? column?.profile?.maxValue
                                                : "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Max Value:{" "}
                                              {column?.profile
                                                ? column?.profile?.minValue
                                                : "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Records Count:{" "}
                                              {column?.profile
                                                ? column?.profile?.countUnique
                                                : "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Nulls Count:{" "}
                                              {column?.profile
                                                ? column?.profile?.countNulls
                                                : "..."}
                                            </i>
                                          </Typography>
                                          <Typography variant="body2">
                                            <i>
                                              Distinct Values Count:{" "}
                                              {column?.profile
                                                ? column?.profile?.sampleUnique?.join(
                                                    ", "
                                                  )
                                                : "..."}
                                            </i>
                                          </Typography>
                                          <Divider sx={{ mb: 2, mt: 2 }} />
                                        </Stack>
                                      </Box>
                                    </Collapse>
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            );
                          })
                        )
                      ) ?? null
                    );
                  })()}
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
