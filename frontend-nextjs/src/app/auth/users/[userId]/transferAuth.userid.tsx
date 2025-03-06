import * as React from "react";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { getRoles, updateUserRoles } from "./_actions/userId.action";

interface TransferAuthListProps {
  id: number;
  name: string;
}

function not(a: TransferAuthListProps[], b: TransferAuthListProps[]) {
  // return a.filter((value) => !b.includes(value)); value: number
  return a.filter((value) => !b.some((bValue) => bValue.id === value.id));
}

function intersection(a: TransferAuthListProps[], b: TransferAuthListProps[]) {
  // return a.filter((value) => b.includes(value));
  return a.filter((value) => b.some((bValue) => bValue.id === value.id));
}

export function TransferAuth({
  userRoles,
  isApply,
  userId,
}: {
  userRoles: TransferAuthListProps[];
  isApply: boolean;
  userId: number;
}) {
  const [checked, setChecked] = React.useState<TransferAuthListProps[]>([]);
  const [left, setLeft] = React.useState<TransferAuthListProps[]>([]);
  const [right, setRight] = React.useState<TransferAuthListProps[]>([]);

  React.useEffect(() => {
    // Get the user by id roles and roles
    // User's roles go to the left
    // Roles go to the right
    // Remove the roles that are already on the left
    (async () => {
      if (!isApply) {
        const roles = await getRoles(); // all roles
        setLeft(userRoles);
        setRight(not(roles, userRoles));
      }
    })();
    (async () => {
      if (isApply) {
        const userRolesId = left.map((role) => role.id);
        await updateUserRoles(userId, userRolesId);
      }
    })();
  }, [isApply]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: TransferAuthListProps) => () => {
    // const currentIndex = checked.indexOf(value);
    // const newChecked = [...checked];

    // if (currentIndex === -1) {
    //   newChecked.push(value);
    // } else {
    //   newChecked.splice(currentIndex, 1);
    // }

    // setChecked(newChecked);
    setChecked((prevChecked) => {
      const currentIndex = prevChecked.findIndex(
        (checkedValue) => checkedValue.id === value.id
      );
      const newChecked = [...prevChecked];

      if (currentIndex === -1) {
        newChecked.push(value);
      } else {
        newChecked.splice(currentIndex, 1);
      }

      return newChecked;
    });
  };

  const handleAllRight = () => {
    setRight(right.concat(left));
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleAllLeft = () => {
    setLeft(left.concat(right));
    setRight([]);
  };

  const customList = (items: TransferAuthListProps[]) => (
    <Paper sx={{ width: 200, height: 230, overflow: "auto" }}>
      <List dense component="div" role="list">
        {items.map((value) => {
          const labelId = `transfer-list-item-${value.id}-label`;

          return (
            <ListItemButton
              key={value.id}
              role="listitem"
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.includes(value)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    "aria-labelledby": labelId,
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${value.name}`} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  return (
    <Grid
      container
      spacing={2}
      sx={{ justifyContent: "center", alignItems: "center" }}
    >
      <Grid item>{customList(left)}</Grid>
      <Grid item>
        <Grid container direction="column" sx={{ alignItems: "center" }}>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={right.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList(right)}</Grid>
    </Grid>
  );
}
