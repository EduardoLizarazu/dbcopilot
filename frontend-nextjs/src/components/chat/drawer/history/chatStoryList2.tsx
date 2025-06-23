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
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isActive?: boolean;
}

interface ChatHistoryDrawerProps {
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  currentConversationId?: string;
}

export function ChatStoryList({
  onNewChat,
  onSelectConversation,
  currentConversationId,
}: ChatHistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Mock conversation data
  const [conversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Create Html Game Environment...",
      lastMessage: "How to create a game environment in HTML",
      timestamp: "Today",
    },
    {
      id: "2",
      title: "Apply To Leave For Emergency",
      lastMessage: "Draft an emergency leave application",
      timestamp: "Today",
    },
    {
      id: "3",
      title: "What Is UI UX Design?",
      lastMessage: "Explain UI/UX design principles",
      timestamp: "Today",
    },
    {
      id: "4",
      title: "Create POS System",
      lastMessage: "Help with point of sale system development",
      timestamp: "Today",
    },
    {
      id: "5",
      title: "What Is UX Audit?",
      lastMessage: "Explain UX audit process",
      timestamp: "Today",
    },
    {
      id: "6",
      title: "Create Chatbot GPT...",
      lastMessage: "Building a chatbot with GPT",
      timestamp: "Today",
      isActive: true,
    },
    {
      id: "7",
      title: "How Chat GPT Work?",
      lastMessage: "Understanding ChatGPT functionality",
      timestamp: "Last 7 Days",
    },
    {
      id: "8",
      title: "Crypto Lending App Name",
      lastMessage: "Suggestions for crypto lending app names",
      timestamp: "Last 7 Days",
    },
    {
      id: "9",
      title: "Operator Grammar Types",
      lastMessage: "Different types of grammar operators",
      timestamp: "Last 7 Days",
    },
    {
      id: "10",
      title: "Ava Starter For Binary DFA",
      lastMessage: "Binary DFA implementation help",
      timestamp: "Last 7 Days",
    },
  ]);

  const filteredConversations = conversations.filter(
    (conv: Conversation) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    conversationId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNewChat = () => {
    onNewChat();
  };

  const handleConversationSelect = (id: string) => {
    onSelectConversation(id);
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            CHAT A.I +
          </Typography>
          <IconButton onClick={() => console.log("Close drawer")} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            mb: 2,
            backgroundColor: "#4285f4",
            "&:hover": {
              backgroundColor: "#3367d6",
            },
          }}
        >
          New chat
        </Button>

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
            {filteredConversations.map((conversation) => (
              <ListItem key={conversation.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleConversationSelect(conversation.id)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: conversation.isActive
                      ? "#e3f2fd"
                      : "transparent",
                    border: conversation.isActive
                      ? "1px solid #bbdefb"
                      : "1px solid transparent",
                    "&:hover": {
                      backgroundColor: conversation.isActive
                        ? "#e3f2fd"
                        : "#f5f5f5",
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
                          fontWeight: conversation.isActive ? 600 : 400,
                          color: conversation.isActive
                            ? "primary.main"
                            : "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {conversation.title}
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
            ))}
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
