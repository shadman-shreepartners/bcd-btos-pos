import { Box, Typography } from "@mui/material";
import type { LucideIcon } from "lucide-react";

type SectionCardHeaderProps = { icon: LucideIcon; title: string };

const SectionCardHeader = ({ icon: Icon, title }: SectionCardHeaderProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      py: 1,
      pl: 2.5,
      borderBottom: "1px solid var(--border)",
      bgcolor: "var(--page)",
    }}
  >
    <Icon
      style={{ width: 16, height: 16, color: "var(--accent)" }}
      strokeWidth={2}
      aria-hidden
    />
    <Typography variant="body1" component="h6" sx={{ fontWeight: "bold" }}>
      {title}
    </Typography>
  </Box>
);

export default SectionCardHeader;
