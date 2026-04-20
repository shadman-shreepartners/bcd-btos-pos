import type { ReactNode } from "react";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { TripBooking } from "../types";

export type TripTableColumn = {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  minWidth?: number;
  render: (row: TripBooking) => ReactNode;
};

export type TripTableProps = {
  columns: TripTableColumn[];
  rows: TripBooking[];
  loading?: boolean;
  emptyLabel?: string;
};

export default function TripTable({ columns, rows, loading, emptyLabel = "No rows." }: TripTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align ?? "left"} sx={{ minWidth: col.minWidth }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <CircularProgress size={32} />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Typography align="center">{emptyLabel}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={String(row.id)}>
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align ?? "left"}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
