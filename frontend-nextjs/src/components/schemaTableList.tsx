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
import { Button, Stack } from "@mui/material";
import { GetSchemaData } from "@/controller/_actions/index.actions"; // Assuming you have a data file with rows
import CloseIcon from "@mui/icons-material/Close";

interface RowData {
  tableId: number;
  tableName: string;
  tableDesc: string;
  columns: { columnId: number; columnName: string; columnDesc: string }[];
}

function Row(props: {
  row: RowData;
  setRow: React.Dispatch<React.SetStateAction<RowData[]>>;
}) {
  const { row, setRow } = props;
  const [open, setOpen] = React.useState(false);
  const [isEditable, setIsEditable] = React.useState(false);
  const [tempTable, setTempTable] = React.useState<RowData>({
    tableId: 0,
    tableName: "",
    tableDesc: "",
    columns: [],
  });

  React.useEffect(() => {
    setTempTable(row);
    console.log("Use Effect ROWS");
  }, [row]);

  function handleSaveBtn() {
    setRow((prev) =>
      prev.map((r) => {
        if (r.tableId === tempTable.tableId) {
          return { ...tempTable };
        }
        return r;
      })
    );
    console.log("Updated rows: ", tempTable);
    setTempTable({
      tableId: 0,
      tableName: "",
      tableDesc: "",
      columns: [],
    });
    setIsEditable(false);
  }

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
              onBlur={(e) => {
                setTempTable({ ...tempTable, tableName: e.target.value });
              }}
            />
          ) : (
            <span>{row.tableName}</span>
          )}
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={2}>
            {isEditable ? (
              <>
                <IconButton onClick={() => setIsEditable(false)}>
                  <CloseIcon />
                </IconButton>
                <IconButton onClick={handleSaveBtn}>
                  <SaveIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => setIsEditable(true)}>
                <EditIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() =>
                setRow((prev) => prev.filter((r) => r.tableId !== row.tableId))
              }
            >
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
                    <TableRow key={column.columnId}>
                      <TableCell component="th" scope="row">
                        {isEditable ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            defaultValue={column.columnName}
                            onBlur={(e) => {
                              // Update the column name with "e" in the tempTable state based on the column id
                              setTempTable((prev) => {
                                const updatedColumns = prev.columns.map((c) => {
                                  if (c.columnId === column.columnId) {
                                    return { ...c, columnName: e.target.value };
                                  }
                                  return c;
                                });
                                return { ...prev, columns: updatedColumns };
                              });
                            }}
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

export function SchemaTableList() {
  const [rows, setRows] = React.useState<RowData[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredRows = rows.filter((row) =>
    row.tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Original rows: ", rows);

  React.useEffect(() => {
    (async () => {
      const data = await GetSchemaData();
      console.log("Fetched rows: ", data);
      setRows(data);
    })();
  }, []);

  React.useEffect(() => {}, [rows]);

  function handleNewRecord() {
    const newRow: RowData = {
      tableId: rows.length + 1,
      tableName: `Table ${rows.length + 1}`,
      tableDesc: "",
      columns: [
        { columnId: 1, columnName: "Column 1", columnDesc: "" },
        { columnId: 2, columnName: "Column 2", columnDesc: "" },
      ],
    };
    setRows((prev) => [...prev, newRow]);
    console.log("New row added: ", newRow);
  }

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
      <Button onClick={handleNewRecord}>Add record</Button>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableBody>
            {filteredRows.map((row) => (
              <Row key={row.tableId} row={row} setRow={setRows} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
