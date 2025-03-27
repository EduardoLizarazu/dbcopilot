import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

import { Stack } from "@mui/material";
function createData(
  tableId: number,
  tableName: string,
  tableDesc: string,
  columns: { columnId: number; columnName: string; columnDesc: string }[]
) {
  return {
    tableId: tableId,
    tableName: tableName,
    tableDesc: tableDesc,
    columns: columns,
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [isEditable, setIsEditable] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {/* Table name */}
          {isEditable ? (
            <TextField
              variant="outlined"
              size="small"
              defaultValue={row.tableName}
              onBlur={() => setIsEditable(false)}
            />
          ) : (
            <span>{row.tableName}</span>
          )}
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={() => setIsEditable(!isEditable)}>
              {isEditable ? <SaveIcon /> : <EditIcon />}
            </IconButton>
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  {row.columns.map((column) => (
                    <TableRow key={column.columnName}>
                      <TableCell component="th" scope="row">
                        {isEditable ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            defaultValue={column.columnName}
                            onBlur={() => setIsEditable(false)}
                          />
                        ) : (
                          <span>{column.columnName}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}
const rows = [
  createData(1, "User", "user description", [
    {
      columnName: "id",
      columnDesc: "id of the user",
      columnId: 1,
    },
    {
      columnName: "name",
      columnDesc: "name of the user",
      columnId: 2,
    },
    {
      columnName: "email",
      columnDesc: "email of the user",
      columnId: 3,
    },
    {
      columnName: "password",
      columnDesc: "password of the user",
      columnId: 4,
    },
    {
      columnName: "created_at",
      columnDesc: "created at",
      columnId: 5,
    },
    {
      columnName: "updated_at",
      columnDesc: "updated at",
      columnId: 6,
    },
  ]),
  createData(2, "Chat", "chat description", [
    {
      columnName: "id",
      columnDesc: "id of the chat",
      columnId: 7,
    },
    {
      columnName: "message",
      columnDesc: "message of the chat",
      columnId: 8,
    },
    {
      columnName: "user_id",
      columnDesc: "user id of the chat",
      columnId: 9,
    },
    {
      columnName: "created_at",
      columnDesc: "created at",
      columnId: 10,
    },
    {
      columnName: "updated_at",
      columnDesc: "updated at",
      columnId: 13,
    },
  ]),
  createData(3, "UserChat", "user chat description", [
    {
      columnName: "id",
      columnDesc: "id of the user chat",
      columnId: 11,
    },
    {
      columnName: "user_id",
      columnDesc: "user id of the user chat",
      columnId: 12,
    },
  ]),
];
export function SchemaTableList() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredRows = rows.filter((row) =>
    row.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <TextField
        label="Search Tables"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableBody>
            {filteredRows.map((row) => (
              <Row key={row.tableName} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
