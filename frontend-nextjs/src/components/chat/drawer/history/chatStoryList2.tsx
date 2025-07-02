import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import { useEffect, useState } from "react";
import { ReadChatHistory } from "@/controller/_actions/chat/query/read-chat-history.chat.query";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  prompt: string;
}

interface ChatHistoryDrawerProps {
  setSelectConversation: React.Dispatch<React.SetStateAction<string>>;
  currentConversationId?: string;
  setIsResetHf: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChatStoryList({
  setSelectConversation,
  currentConversationId,
  setIsResetHf,
}: ChatHistoryDrawerProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // Mock conversation data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "",
      prompt: "",
    },
  ]);

  useEffect(() => {
    (async () => {
      const chats = await ReadChatHistory();
      setConversations(
        chats.map((chat) => ({
          id: String(chat.id || "") || "",
          prompt: chat.prompt || "",
        }))
      );
      console.log("Conversations loaded:", chats);
    })();
    return () => {};
  }, []);

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    conversationId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleConversationSelect = (id: string) => {
    // setSelectConversation(id);
    // change the url to the selected conversation
    setSelectConversation(
      conversations.filter((item) => item.id === id)[0].prompt
    );
    setIsResetHf(true);
    setAnchorEl(null); // Close the menu after selection
  };

  const drawerWidth = 320;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "white",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#f5f5f5",
            },
          }}
        />
      </Box>

      {/* Conversations List - Flat List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Your conversations
            </Typography>
            <Button
              size="small"
              sx={{
                textTransform: "none",
                color: "primary.main",
                fontSize: "0.75rem",
              }}
            >
              Clear All
            </Button>
          </Box>

          <List sx={{ p: 0 }}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <ListItem key={conversation.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleConversationSelect(conversation.id)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                      px: 2,
                      py: 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ChatIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 400,
                            color: "text.primary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conversation.prompt}
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, conversation.id)}
                      sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <TextField
                fullWidth
                disabled
                value="No conversations found"
                sx={{
                  mt: 2,
                  textAlign: "center",
                  "& .MuiInputBase-input": {
                    textAlign: "center",
                    color: "text.secondary",
                  },
                }}
              />
            )}
          </List>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "white",
        }}
      >
        <ListItemButton
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32 }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight={500}>
                Settings
              </Typography>
            }
          />
        </ListItemButton>

        <ListItemButton
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            mt: 1,
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          <Avatar
            sx={{
              width: 24,
              height: 24,
              mr: 1,
              fontSize: "0.75rem",
              bgcolor: "primary.main",
            }}
          >
            AN
          </Avatar>
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight={500}>
                Andrew Neilson
              </Typography>
            }
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}
