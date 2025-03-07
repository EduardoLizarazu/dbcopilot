import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import { TransferAuth } from "./transferAuth.userid";

interface listProps {
  id: number;
  name: string;
}

export function EditAuthDialog({
  belongingData,
  wasEdited,
  setWasEdited,
  getOriginalData,
  updateBelongingData,
  belongingDataId,
}: {
  belongingData: listProps[];
  wasEdited: boolean;
  setWasEdited: React.Dispatch<React.SetStateAction<boolean>>;
  getOriginalData: () => Promise<listProps[]>;
  updateBelongingData: (id: number, data: listProps[]) => Promise<void>;
  belongingDataId: number;
}) {
  const [open, setOpen] = React.useState<boolean>(false);
  // const [isApply, setIsApply] = React.useState<boolean>(false);

  const handleClickOpen = () => {
    setWasEdited(false);
    setOpen(true);
  };

  const handleClose = () => {
    setWasEdited(false);
    setOpen(false);
  };

  const handleApply = () => {
    setWasEdited(true);
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        endIcon={<EditIcon />}
        onClick={handleClickOpen}
      >
        Edit
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Add and remove"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Add and remove permissions and roles for this user
          </DialogContentText>
          <TransferAuth
            isApply={wasEdited}
            getOriginalData={getOriginalData}
            updateBelongingData={updateBelongingData}
            belongingData={belongingData}
            belongingDataId={belongingDataId}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleApply} autoFocus>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
