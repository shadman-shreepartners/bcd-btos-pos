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
    primary: colorTokens.primary,
    secondary: colorTokens.secondary,
  },
  divider: colorTokens.border,
};
