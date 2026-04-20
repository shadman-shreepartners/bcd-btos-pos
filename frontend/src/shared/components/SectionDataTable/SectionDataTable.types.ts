import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SectionDataTableColumn<Row extends object> = {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  minWidth?: number;
  width?: string | number;
  /** Simple accessor when no `renderCell` is provided */
  field?: keyof Row;
  renderCell?: (row: Row, rowIndex: number) => ReactNode;
};

export type SectionDataTableProps<Row extends object> = {
  title: string;
  titleIcon?: LucideIcon;
  columns: SectionDataTableColumn<Row>[];
  rows: Row[];
  getRowId?: (row: Row, index: number) => string | number;
  emptyMessage?: string;
};
