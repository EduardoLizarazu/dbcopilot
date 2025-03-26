import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { Divider, TextField } from "@mui/material";

export function ChatStoryList() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  return (
    <>
      <TextField
        type="text"
        label="Search"
        value={searchQuery}
        onChange={handleSearchChange}
        variant="outlined"
        fullWidth
        size="small"
        sx={{ marginBottom: 1 }}
      />
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {[1, 2, 3].map((value) => (
          <div key={value}>
            <ListItem
              disableGutters
              secondaryAction={
                <IconButton aria-label="comment">
                  <ArrowRightAltIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`Line item ${value}`}
                sx={{ marginLeft: "10px" }}
              />
            </ListItem>
            <Divider component="li" />
          </div>
        ))}
      </List>
    </>
  );
}
