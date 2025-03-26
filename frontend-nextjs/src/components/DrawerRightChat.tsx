import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { SchemaList } from "./schemaList";
import { ChatStoryList } from "./chatStoryList";
import { IconButton, Tab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabList, TabPanel } from "@mui/lab";

export function DrawerRightChat() {
  const [open, setOpen] = React.useState(false);

  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 400, marginTop: 10 }} role="presentation">
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList
            onChange={handleChange}
            aria-label="lab API tabs example"
            centered
            variant="fullWidth"
          >
            <Tab label="Schema" value="1" />
            <Tab label="Chat" value="2" />
          </TabList>
        </Box>

        <TabPanel value="1">
          <SchemaList />
        </TabPanel>
        <TabPanel value="2">
          <ChatStoryList />
        </TabPanel>
      </TabContext>
    </Box>
  );

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer
        open={open}
        anchor="right"
        variant="temporary"
        onClose={toggleDrawer(false)}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}
