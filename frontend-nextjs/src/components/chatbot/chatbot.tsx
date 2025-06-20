// components/ChatBot.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
  Container,
} from "@mui/material";
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import ChatHistoryDrawer from "./chatHistoryDrawer";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Sure, I can help you get started with creating a chatbot using GPT in Python. Here are the basic steps you'll need to follow:\n\n1. **Install the required libraries:** You'll need to install the transformers library from Hugging Face to use GPT. You can install it using pip.\n\n2. **Load the pre-trained model:** GPT comes in several sizes and versions, so you'll need to choose the one that fits your needs. You can load a pre-trained GPT model. This loads the 1.3B parameter version of GPT-Neo, which is a powerful and relatively recent model.\n\n3. **Create a chatbot loop:** You'll need to create a loop that takes user input, generates a response using the GPT model, and outputs it to the user. Here's an example loop that uses the input() function to get user input and the gpt() function to generate a response. This loop will keep running until the user exits the program or the loop is interrupted.\n\n4. **Add some personality to the chatbot:** While GPT can generate text, it doesn't have any inherent personality or style. You can make your chatbot more interesting by adding custom prompts or responses that reflect your desired personality. You can then modify the chatbot loop to use these prompts and responses when appropriate. This will make the chatbot seem more human-like and engaging.\n\nThese are just the basic steps to get started with a GPT chatbot in Python. Depending on your requirements, you may need to add more features or complexity to the chatbot. Good luck!",
      role: "assistant",
      timestamp: new Date(Date.now() - 300000),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState("6");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(input),
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const getBotResponse = (userInput: string): string => {
    // Simple response logic - in a real app, this would call your AI service
    const responses = [
      "Chatbots can be used for a wide range of purposes, including:\n\n**Customer service chatbots** can handle frequently asked questions, provide basic support, and help customers navigate services or products.\n\n**Educational chatbots** can assist with learning by providing explanations, quizzes, and personalized tutoring.\n\n**E-commerce chatbots** help customers find products, process orders, and provide shopping recommendations.\n\n**Healthcare chatbots** can provide basic health information, schedule appointments, and offer mental health support.\n\n**Entertainment chatbots** engage users with games, stories, and interactive experiences.",
      "That's a great question! Chatbots are becoming increasingly sophisticated and can handle complex conversations across many domains.",
      "I'd be happy to help you with that. Could you provide more specific details about what you're looking for?",
      "Based on your question, I can provide several approaches to solve this problem. Let me break it down step by step.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId("new");
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
    // In a real app, you would load the conversation history here
    // For now, we'll just simulate loading different conversations
    if (id === "6") {
      // Current conversation - keep existing messages
      return;
    } else {
      // Load different conversation
      setMessages([
        {
          id: "demo-" + id,
          content: `This is a demo conversation for "${id}". In a real application, you would load the actual conversation history from your database.`,
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line.startsWith("**") && line.endsWith("**") ? (
          <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
            {line.slice(2, -2)}
          </Typography>
        ) : line.match(/^\d+\./) ? (
          <Typography variant="body1" sx={{ mb: 1, pl: 1 }}>
            {line}
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ mb: line ? 1 : 0 }}>
            {line}
          </Typography>
        )}
      </React.Fragment>
    ));
  };

  return (
    <Container
      maxWidth="md"
      sx={{ height: "100vh", display: "flex", flexDirection: "column", py: 2 }}
    >
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <BotIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              CHAT A.I +
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI Assistant
            </Typography>
          </Box>
          <IconButton
            onClick={() => setHistoryDrawerOpen(true)}
            sx={{
              bgcolor: "action.hover",
              "&:hover": {
                bgcolor: "action.selected",
              },
            }}
          >
            <HistoryIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Messages Container */}
      <Paper
        elevation={1}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          {messages.map((message, index) => (
            <Box key={message.id} sx={{ mb: 3 }}>
              <Box display="flex" gap={2} alignItems="flex-start">
                <Avatar
                  sx={{
                    bgcolor:
                      message.role === "user"
                        ? "secondary.main"
                        : "primary.main",
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.role === "user" ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    {message.role === "user" ? "You" : "CHAT A.I +"}
                  </Typography>
                  <Box sx={{ color: "text.primary" }}>
                    {formatContent(message.content)}
                  </Box>

                  {message.role === "assistant" && (
                    <Box display="flex" gap={1} mt={2}>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(message.content)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                      <Chip
                        label="Regenerate"
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}
                </Box>
              </Box>
              {index < messages.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}

          {isLoading && (
            <Box display="flex" gap={2} alignItems="center" sx={{ mb: 3 }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
                <BotIcon />
              </Avatar>
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="What's in your mind?..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "grey.300",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {/* Chat History Drawer */}
      <ChatHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      />
    </Container>
  );
};

export default ChatBot;
