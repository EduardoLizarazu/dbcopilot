import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { ChatStoryList } from "./history/chatStoryList2";
import { IconButton, Tab } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { TabContext, TabList, TabPanel } from "@mui/lab";

type TDrawerRightChatProps = {
  setSelectConversation: React.Dispatch<React.SetStateAction<string>>;
  setIsResetHf: React.Dispatch<React.SetStateAction<boolean>>;
  handleResetBySelectedHistoryPrompt: () => void;
};

export function DrawerRightChat({
  setSelectConversation,
  setIsResetHf,
  handleResetBySelectedHistoryPrompt,
}: TDrawerRightChatProps) {
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

        {/* <ChatSchemaTableHead connId={connId} /> */}
        {/* <SchemaList /> */}
        {/* <ChatSchemaTableList connId={connId} /> */}
        <TabPanel value="1">{/* Schema List */}</TabPanel>
        <TabPanel value="2">
          {/* Chat history */}
          <ChatStoryList
            setSelectConversation={setSelectConversation}
            setIsResetHf={setIsResetHf}
            handleResetBySelectedHistoryPrompt={
              handleResetBySelectedHistoryPrompt
            }
          />
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
