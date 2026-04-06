import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { appTheme } from "./createAppTheme";

type AppThemeProviderProps = {
  children: ReactNode;
};

/**
 * Single place to mount MUI theme + CssBaseline.
 * Import global SCSS (`src/styles/global.scss`) once in `main.tsx` before this provider.
 */
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
