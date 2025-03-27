import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function createData(
  tableName: string,
  tableDesc: string,
  columns: { columnName: string; columnDesc: string }[]
) {
  return {
    tableName: tableName,
    tableDesc: tableDesc,
    columns: columns,
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

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
          {row.tableName}
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
                        {column.columnName}
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
  createData("User", "user description", [
    {
      columnName: "id",
      columnDesc: "id of the user",
    },
    {
      columnName: "name",
      columnDesc: "name of the user",
    },
    {
      columnName: "email",
      columnDesc: "email of the user",
    },
    {
      columnName: "password",
      columnDesc: "password of the user",
    },
    {
      columnName: "created_at",
      columnDesc: "created at",
    },
    {
      columnName: "updated_at",
      columnDesc: "updated at",
    },
  ]),
  createData("Chat", "chat description", [
    { columnName: "id", columnDesc: "id of the chat" },
    { columnName: "message", columnDesc: "message of the chat" },
    { columnName: "user_id", columnDesc: "user id of the chat" },
    { columnName: "created_at", columnDesc: "created at" },
    { columnName: "updated_at", columnDesc: "updated at" },
  ]),
  createData("UserChat", "user chat description", [
    { columnName: "id", columnDesc: "id of the user chat" },
    { columnName: "user_id", columnDesc: "user id of the user chat" },
  ]),
];
export function SchemaTableList() {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Tables and Columns</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.tableName} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
