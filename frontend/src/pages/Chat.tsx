import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      // Simulate a response from the system
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `Response to: ${input}`, sender: "system" },
        ]);
      }, 1000);
      setInput("");
    }
  };

  return (
    <Box className="flex flex-col h-screen p-4">
      <Paper className="flex-1 mb-4 p-2 overflow-auto">
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              className={msg.sender === "user" ? "text-right" : "text-left"}
            >
              <ListItemText primary={msg.text} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box className="flex">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Chat;
