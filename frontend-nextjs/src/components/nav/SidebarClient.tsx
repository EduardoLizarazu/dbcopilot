// components/SidebarClient.tsx (Client Component)
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import ChatIcon from "@mui/icons-material/Chat";
import GroupIcon from "@mui/icons-material/Group";
import SecurityIcon from "@mui/icons-material/Security";
import LogoutButton from "@/components/nav/LogoutButton";
import HistoryIcon from "@mui/icons-material/History";
import RuleIcon from "@mui/icons-material/Rule";
import PolylineIcon from "@mui/icons-material/Polyline";
import CableIcon from "@mui/icons-material/Cable";
import ListIcon from "@mui/icons-material/List";

const DRAWER_WIDTH = 280;

export default function SidebarClient({
  email,
  isAdmin,
}: {
  email: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavItem = ({
    href,
    icon,
    label,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
  }) => {
    const selected = pathname === href || pathname.startsWith(href + "/");
    return (
      <ListItemButton
        component={Link}
        href={href}
        selected={selected}
        onClick={() => setOpen(false)}
        sx={{ borderRadius: 2, mx: 1, my: 0.25 }}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    );
  };

  const content = (
    <Box
      role="navigation"
      sx={{
        width: DRAWER_WIDTH,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={800}>
          MyApp
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap title={email}>
          {email}
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 0.5 }}>
        <NavItem href="/dashboard" icon={<DashboardIcon />} label="Dashboard" />
        <NavItem href="/chat" icon={<ChatIcon />} label="Chat" />
        {/* {isAdmin && (
        )} */}
        <>
          <NavItem href="/auth/users" icon={<GroupIcon />} label="Users" />
          <NavItem href="/auth/roles" icon={<SecurityIcon />} label="Roles" />
          <NavItem
            href="/history"
            icon={<HistoryIcon />}
            label="Chat History"
          />
          <NavItem
            href="/nlq-correction"
            icon={<RuleIcon />}
            label="NLQ Correction"
          />
          <NavItem href="/nlq-good" icon={<PolylineIcon />} label="NLQ Good" />
          <NavItem
            href="/dbconnection"
            icon={<CableIcon />}
            label="DB Connection"
          />
          <NavItem
            href="/vbd-splitter"
            icon={<ListIcon />}
            label="VBD Splitter"
          />
        </>
      </List>
      <Box sx={{ mt: "auto", p: 2 }}>
        <LogoutButton />
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile header with burger */}
      <Box className="md:hidden sticky top-0 z-50">
        <Box className="flex items-center justify-between px-3 py-2 bg-white/70 backdrop-blur border-b">
          <IconButton onClick={() => setOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" fontWeight={700}>
            MyApp
          </Typography>
          <Box width={40} />
        </Box>
      </Box>

      {/* Mobile: temporary drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {content}
      </Drawer>

      {/* Desktop: permanent drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
