import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Chip,
} from "@mui/material";
import {
  Add,
  Remove,
  ChangeCircle,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";
import { DiffData } from "@/app/schema/page";

interface ApplyDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  diffData: DiffData;
}

const ApplyDialog: React.FC<ApplyDialogProps> = ({
  open,
  onClose,
  onApply,
  diffData,
}) => {
  const changes = diffData.tables.filter((t) => t.status !== "unchanged");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-blue-50 text-gray-800">
        <Box className="flex items-center">
          <Warning className="text-yellow-600 mr-2" />
          Apply Changes to Graph Database?
        </Box>
      </DialogTitle>

      <DialogContent className="pt-4">
        <Typography variant="body1" className="mb-4">
          This will synchronize your graph schema with the current database
          structure. Please review the changes below:
        </Typography>

        <Box className="p-4 bg-yellow-50 rounded-lg mb-4">
          <List dense className="space-y-2">
            {changes.map((table) => (
              <ListItem key={`change-${table.name}`} className="p-0">
                <ListItemIcon className="min-w-0 mr-2">
                  {table.status === "added" && (
                    <Add className="text-green-600" />
                  )}
                  {table.status === "removed" && (
                    <Remove className="text-red-600" />
                  )}
                  {table.status === "modified" && (
                    <ChangeCircle className="text-blue-600" />
                  )}
                </ListItemIcon>
                <Box>
                  <Typography variant="body2" className="font-medium">
                    {table.status === "added" && `Add table: ${table.name}`}
                    {table.status === "removed" &&
                      `Remove table: ${table.name}`}
                    {table.status === "modified" &&
                      `Update table: ${table.name}`}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {table.description || "No description available"}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box className="bg-blue-50 p-3 rounded-lg">
          <Typography
            variant="subtitle2"
            className="text-blue-800 flex items-center"
          >
            <Info className="mr-1" /> Important Considerations
          </Typography>
          <ul className="mt-2 text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>This operation cannot be undone</li>
            <li>Existing graph relationships may be affected</li>
            <li>Embeddings will be regenerated for modified elements</li>
            <li>Vector indexes will be updated automatically</li>
          </ul>
        </Box>
      </DialogContent>

      <DialogActions className="p-4">
        <Button onClick={onClose} variant="outlined" className="mr-2">
          Cancel
        </Button>
        <Button
          onClick={onApply}
          variant="contained"
          color="primary"
          className="bg-blue-600 hover:bg-blue-700"
          startIcon={<CheckCircle />}
        >
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApplyDialog;
