import { alpha } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

export const components = {
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        height: "100%",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      body: {
        height: "100%",
        margin: 0,
        fontSize: "0.875rem",
        backgroundColor: "var(--page)",
      },
      "#root": {
        height: "100%",
        minHeight: 0,
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 8,
      },
      containedPrimary: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow:
          "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        },
      }),
      containedSecondary: {
        backgroundColor: "var(--navy-muted)",
        color: "#fff",
        "&:hover": {
          backgroundColor: "var(--slate-muted)",
        },
      },
      outlined: ({ theme }) => ({
        borderColor: "var(--border)",
        color: "var(--label)",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      }),
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
      variant: "outlined",
    },
    styleOverrides: {
      root: {
        borderColor: "var(--border)",
        borderRadius: "1rem",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
          "&:hover fieldset": {
            borderColor: "var(--accent)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "var(--accent)",
          },
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      input: {
        padding: "10px 12px",
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        "&.Mui-selected": {
          backgroundColor: "var(--sidebar-active-bg)",
          borderLeft: " 3px solid var(--navy)",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "var(--sidebar-active-bg)",
          },
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: "var(--header-bg)",
        color: "var(--label)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        color: "var(--header-bg)",
        minWidth: 0,
        marginRight: "0.5rem",
      },
    },
  },
} satisfies NonNullable<ThemeOptions["components"]>;
