/**
 * Use in `sx` or string styles when you need the same colors as CSS variables
 * (e.g. alongside SCSS modules that use var(--accent)).
 */
export const cssVars = {
  navy: "var(--navy)",
  navyMuted: "var(--navy-muted)",
  accent: "var(--accent)",
  page: "var(--page)",
  border: "var(--border)",
  label: "var(--label)",
  headerBg: "var(--header-bg)",
  sublabel: "var(--sublabel)",
  slateMuted: "var(--slate-muted)",
  sidebarActiveBg: "var(--sidebar-active-bg)",
  sidebarDivider: "var(--sidebar-divider)",
  badge: "var(--badge)",
} as const;

/** Alias for older code; prefer `cssVars`. */
export const trip = cssVars;
