import { Paper, Box, Typography } from "@mui/material";

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
};

function ServiceCard({ title, subtitle, icon, selected, onClick }: Props) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: "16px",
        border: selected
          ? "2px solid var(--accent)"
          : "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        gap: 1,
        height: "100%",
        minHeight: 60,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "var(--accent)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Icon Box */}
      <Box
        sx={{
          width: 44,
          height: 44,
          // borderRadius: "50%",
          borderRadius: 1,
          backgroundColor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      {/* Text */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          lineHeight: 1.2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            color: "#111827",
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: "12px",
            color: "#94a3b8",
            fontWeight: 500,
            mt: 0.3,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
}

export default ServiceCard;
