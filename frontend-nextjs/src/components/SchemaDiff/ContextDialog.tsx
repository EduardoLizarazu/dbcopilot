import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import { Table, Column } from "@/app/schema/page";

interface ContextDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (context: string) => void;
  table: Table | null;
  column?: Column | null;
}

const ContextDialog: React.FC<ContextDialogProps> = ({
  open,
  onClose,
  onSave,
  table,
  column,
}) => {
  const [context, setContext] = useState("");

  useEffect(() => {
    if (open && table) {
      setContext(column?.context || table.description || "");
    }
  }, [open, table, column]);

  const handleSave = () => {
    onSave(context);
    onClose();
  };

  if (!table) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-blue-50 text-gray-800">
        <Box className="flex items-center">
          <span>Add Context</span>
          <Chip
            label={column ? "Column" : "Table"}
            size="small"
            className="ml-2 bg-blue-100 text-blue-800"
          />
        </Box>
      </DialogTitle>

      <DialogContent className="pt-4 pb-2">
        <Box className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Typography variant="subtitle2" className="text-gray-600">
            {column ? "Column:" : "Table:"}
          </Typography>
          <Typography variant="body1" className="font-medium">
            {column ? column.name : table.name}
          </Typography>
          {column && (
            <Typography variant="body2" className="text-gray-600 mt-1">
              Type: <span className="font-mono">{column.type}</span>
            </Typography>
          )}
        </Box>

        <TextField
          autoFocus
          multiline
          minRows={4}
          maxRows={8}
          fullWidth
          variant="outlined"
          label="Description"
          placeholder="Enter a clear description of what this element represents..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />

        <Typography variant="body2" className="text-gray-600 mt-3">
          This context will be used to improve the accuracy of the Graph RAG
          system.
        </Typography>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose} variant="outlined" className="mr-2">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Context
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContextDialog;
