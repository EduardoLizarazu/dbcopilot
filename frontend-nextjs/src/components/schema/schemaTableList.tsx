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
import { Button, Stack, TableHead } from "@mui/material";
import { GetSchemaData, IReadSchemaData, ReadSchemaData } from "@/controller/_actions/index.actions"; // Assuming you have a data file with rows
import CloseIcon from "@mui/icons-material/Close";

interface RowData {
  tabla_id: number;
  table_name: string;
  table_description: string;
  columns: { column_id: number; column_name: string; column_description: string }[];
}

function Row(props: {
  row: IReadSchemaData;
  setRow: React.Dispatch<React.SetStateAction<IReadSchemaData[]>>;
}) {
  const { row, setRow } = props;
  const [open, setOpen] = React.useState(false);
  const [isEditable, setIsEditable] = React.useState(false);
  const [tempTable, setTempTable] = React.useState<IReadSchemaData>({
    table_id: 0,
    table_name: "",
    table_description: "",
    table_alias: "",
    columns: [],
  });

  React.useEffect(() => {
    setTempTable(row);
    console.log("Use Effect ROWS");
  }, [row]);

  function handleSaveBtn() {
    setRow((prev) =>
      prev.map((r) => {
        if (r.table_id === tempTable.table_id) {
          return { ...tempTable };
        }
        return r;
      })
    );
    console.log("Updated rows: ", tempTable);
    setTempTable({
      table_id: 0,
      table_name: "",
      table_description: "",
      table_alias: "",
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
              defaultValue={row.table_name}
              onBlur={(e) => {
                setTempTable({ ...tempTable, table_name: e.target.value });
              }}
            />
          ) : (
            <span>{row.table_name}</span>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          {/* Table alias */}
          {isEditable ? (
            <TextField
              variant="outlined"
              size="small"
              defaultValue={row.table_alias}
              onBlur={(e) => {
                setTempTable({ ...tempTable, table_name: e.target.value });
              }}
            />
          ) : (
            <span>{row.table_alias}</span>
          )}
        </TableCell>
        <TableCell component="th" scope="row">
          {/* Table description */}
          {isEditable ? (
            <TextField
              variant="outlined"
              size="small"
              defaultValue={row.table_description}
              onBlur={(e) => {
                setTempTable({ ...tempTable, table_description: e.target.value });
              }}
            />
          ) : (
            <span>{row.table_description}</span>
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
                setRow((prev) => prev.filter((r) => r.table_id !== row.table_id))
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
                <TableHead>
                  <TableRow>
                    <TableCell>Column Name</TableCell>
                    <TableCell>Column Alias</TableCell>
                    <TableCell>Column Description</TableCell>
                    <TableCell>Column Data Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.columns.map((column) => (
                    <TableRow key={column.column_id}>
                      {/* column name */}
                      <TableCell component="th" scope="row">
                        {isEditable ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            defaultValue={column.column_name}
                            onBlur={(e) => {
                              // Update the column name with "e" in the tempTable state based on the column id
                              setTempTable((prev) => {
                                const updatedColumns = prev.columns.map((c) => {
                                  if (c.column_id === column.column_id) {
                                    return { ...c, column_name: e.target.value };
                                  }
                                  return c;
                                });
                                return { ...prev, columns: updatedColumns };
                              });
                            }}
                          />
                        ) : (
                          <span>{column.column_name}</span>
                        )}
                      </TableCell>

                      {/* column alias */}
                      <TableCell component="th" scope="row">
                        {isEditable ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            defaultValue={column.column_alias}
                            onBlur={(e) => {
                              // Update the column name with "e" in the tempTable state based on the column id
                              setTempTable((prev) => {
                                const updatedColumns = prev.columns.map((c) => {
                                  if (c.column_id === column.column_id) {
                                    return { ...c, column_alias: e.target.value };
                                  }
                                  return c;
                                });
                                return { ...prev, columns: updatedColumns };
                              });
                            }}
                          />
                        ) : (
                          <span>{column.column_alias}</span>
                        )}
                      </TableCell>

                      {/* column description */}
                      <TableCell component="th" scope="row">
                        {isEditable ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            defaultValue={column.column_description}
                            onBlur={(e) => {
                              // Update the column name with "e" in the tempTable state based on the column id
                              setTempTable((prev) => {
                                const updatedColumns = prev.columns.map((c) => {
                                  if (c.column_id === column.column_id) {
                                    return { ...c, column_description: e.target.value };
                                  }
                                  return c;
                                });
                                return { ...prev, columns: updatedColumns };
                              });
                            }}
                          />
                        ) : (
                          <span>{column.column_description}</span>
                        )}
                      </TableCell>

                      {/* column data type */}
                      <TableCell component="th" scope="row">
                        {isEditable ? (
                          <TextField
                            variant="outlined"
                            size="small"
                            defaultValue={column.column_data_type}
                            onBlur={(e) => {
                              // Update the column name with "e" in the tempTable state based on the column id
                              setTempTable((prev) => {
                                const updatedColumns = prev.columns.map((c) => {
                                  if (c.column_id === column.column_id) {
                                    return { ...c, column_data_type: e.target.value };
                                  }
                                  return c;
                                });
                                return { ...prev, columns: updatedColumns };
                              });
                            }}
                          />
                        ) : (
                          <span>{column.column_data_type}</span>
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
  const [rows, setRows] = React.useState<IReadSchemaData[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredRows = rows.filter((row) =>
    row.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Original rows: ", rows);

  React.useEffect(() => {
    (async () => {
      const data = await GetSchemaData();
      // const data = await ReadSchemaData(6);
      console.log("Fetched rows: ", data);
      setRows(data);
    })();
  }, []);

  React.useEffect(() => {}, [rows]);

  function handleNewRecord() {
    const newRow: IReadSchemaData = {
      table_id: rows.length + 1,
      table_name: `Table ${rows.length + 1}`,
      table_alias: "",
      table_description: "",
      columns: [
        {
          column_id: 1, column_name: "Column 1", column_description: "",
          column_alias: "",
          column_data_type: "",
          foreign_key: 0,
          primary_key: 0,
          relation_description: ""
        },
        {
          column_id: 2, column_name: "Column 2", column_description: "",
          column_alias: "",
          column_data_type: "",
          foreign_key: 0,
          primary_key: 0,
          relation_description: ""
        },
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
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Table Name</TableCell>
              <TableCell>Table Alias</TableCell>
              <TableCell>Table Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <Row key={row.table_id} row={row} setRow={setRows} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
