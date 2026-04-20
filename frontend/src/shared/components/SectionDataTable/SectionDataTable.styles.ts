import type { SxProps, Theme } from "@mui/material";

export const sectionDataTableStyles = {
  root: {
    border: "1px solid var(--border)",
    borderRadius: 2,
    overflow: "hidden",
    bgcolor: "var(--header-bg)",
  } satisfies SxProps<Theme>,

  titleBar: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    px: 2,
    py: 1.25,
    bgcolor: "var(--navy)",
    color: "var(--header-bg)",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  } satisfies SxProps<Theme>,

  titleText: {
    fontWeight: 700,
    fontSize: "0.8125rem",
    letterSpacing: "0.06em",
    lineHeight: 1.2,
    textTransform: "uppercase",
  } satisfies SxProps<Theme>,

  tableContainer: {
    borderRadius: 0,
    maxWidth: "100%",
  } satisfies SxProps<Theme>,

  headCell: {
    bgcolor: "var(--table-head-bg)",
    color: "var(--sublabel)",
    fontWeight: 600,
    fontSize: "0.6875rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    borderBottom: "1px solid var(--border)",
    py: 1.25,
    whiteSpace: "nowrap",
  } satisfies SxProps<Theme>,

  bodyCell: {
    fontSize: "0.8125rem",
    borderBottom: "1px solid var(--border)",
    py: 1.5,
    verticalAlign: "middle",
  } satisfies SxProps<Theme>,

  emptyRow: {
    borderBottom: "none",
  } satisfies SxProps<Theme>,
} as const;
