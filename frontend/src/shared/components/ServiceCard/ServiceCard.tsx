import { Box, Paper, Typography } from "@mui/material";
import type { KeyboardEvent, ReactNode } from "react";

type ServiceCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

const ServiceCard = ({
  title,
  subtitle,
  icon,
  selected,
  onClick,
}: ServiceCardProps) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2,
        border: selected
          ? "2px solid var(--accent)"
          : "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        height: "100%",
        minHeight: 72,
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": onClick
          ? {
              borderColor: "var(--accent)",
              boxShadow: "var(--card-shadow-hover)",
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          bgcolor: "var(--icon-well-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          lineHeight: 1.2,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--label)" }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "var(--sublabel)",
            fontWeight: 500,
            mt: 0.25,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ServiceCard;
