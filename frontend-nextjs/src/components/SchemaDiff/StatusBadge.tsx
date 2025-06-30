import React from "react";
import { Add, Remove, ChangeCircle, CheckCircle } from "@mui/icons-material";

interface StatusBadgeProps {
  status: "added" | "removed" | "modified" | "unchanged";
  small?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, small = false }) => {
  const size = small ? 16 : 20;

  const getIcon = () => {
    switch (status) {
      case "added":
        return <Add style={{ color: "#16a34a", fontSize: size }} />;
      case "removed":
        return <Remove style={{ color: "#dc2626", fontSize: size }} />;
      case "modified":
        return <ChangeCircle style={{ color: "#2563eb", fontSize: size }} />;
      default:
        return <CheckCircle style={{ color: "#4b5563", fontSize: size }} />;
    }
  };

  return <div className="flex items-center justify-center">{getIcon()}</div>;
};

export default StatusBadge;
