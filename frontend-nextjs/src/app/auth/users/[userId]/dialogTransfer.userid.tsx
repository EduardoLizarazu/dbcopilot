import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import { TransferAuth } from "./transferAuth.userid";
import { UserWithRoles, UserWithRolesAndPermssions } from "../_types/user.type";

export function EditAuthDialog({ user } : { user: UserWithRolesAndPermssions }) {

  const userWithRoles: UserWithRoles = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    accountStatus: user.accountStatus,
    roles: user.roles.map((role) => {
      return {
        id: role.id,
        name: role.name,
      };
    }),
  }
  
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
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
            user={userWithRoles}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} autoFocus>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
