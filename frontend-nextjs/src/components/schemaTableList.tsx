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

interface RowData {
  tableId: number;
  tableName: string;
  tableDesc: string;
  columns: { columnId: number; columnName: string; columnDesc: string }[];
}

function Row(props: { row: RowData }) {
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
const rows: RowData[] = [
  {
    tableId: 1,
    tableName: "Users",
    tableDesc: "User information",
    columns: [
      { columnId: 1, columnName: "user_id", columnDesc: "User ID" },
      { columnId: 2, columnName: "username", columnDesc: "Username" },
      { columnId: 3, columnName: "email", columnDesc: "Email" },
    ],
  },
  {
    tableId: 2,
    tableName: "Products",
    tableDesc: "Product information",
    columns: [
      { columnId: 1, columnName: "product_id", columnDesc: "Product ID" },
      { columnId: 2, columnName: "product_name", columnDesc: "Product Name" },
      { columnId: 3, columnName: "price", columnDesc: "Price" },
    ],
  },
  {
    tableId: 3,
    tableName: "Orders",
    tableDesc: "Order information",
    columns: [
      { columnId: 1, columnName: "order_id", columnDesc: "Order ID" },
      { columnId: 2, columnName: "user_id", columnDesc: "User ID" },
      { columnId: 3, columnName: "product_id", columnDesc: "Product ID" },
    ],
  },
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
