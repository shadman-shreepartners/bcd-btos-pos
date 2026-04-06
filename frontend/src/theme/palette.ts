import type { PaletteOptions } from "@mui/material/styles";
import { colorTokens } from "./tokens";

export const palette: PaletteOptions = {
  primary: {
    main: colorTokens.accent,
    dark: colorTokens.accentHover,
  },
  secondary: {
    main: colorTokens.navyMuted,
  },
  background: {
    default: colorTokens.page,
    paper: colorTokens.headerBg,
  },
  text: {
    primary: "#0f172a",
    secondary: "#64748b",
  },
  divider: colorTokens.border,
};
