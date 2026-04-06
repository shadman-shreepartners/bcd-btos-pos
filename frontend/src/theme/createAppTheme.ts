import { createTheme } from "@mui/material/styles";
import { palette } from "./palette";
import { typography } from "./typography";
import { components } from "./overrides";

/**
 * Extend the theme in this order: `tokens.ts` + `styles/tokens.scss` → `palette.ts` / `typography.ts` → `overrides.ts`.
 */
export const appTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette,
  typography,
  shape: {
    borderRadius: 8,
  },
  components,
});

export type AppTheme = typeof appTheme;
