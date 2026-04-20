import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { SectionDataTableColumn, SectionDataTableProps } from "./SectionDataTable.types";
import { sectionDataTableStyles } from "./SectionDataTable.styles";

function resolveCellContent<Row extends object>(
  column: SectionDataTableColumn<Row>,
  row: Row,
  rowIndex: number,
) {
  if (column.renderCell) {
    return column.renderCell(row, rowIndex);
  }
  if (column.field !== undefined) {
    const value = row[column.field];
    return value == null ? "" : String(value);
  }
  return "";
}

function SectionDataTable<Row extends object>({
  title,
  titleIcon: TitleIcon,
  columns,
  rows,
  getRowId,
  emptyMessage = "No data",
}: SectionDataTableProps<Row>) {
  return (
  <Box sx={sectionDataTableStyles.root}>
    <Box sx={sectionDataTableStyles.titleBar} component="header">
      {TitleIcon ? (
        <TitleIcon
          style={{ width: 18, height: 18, flexShrink: 0 }}
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
      <Typography component="h3" sx={sectionDataTableStyles.titleText}>
        {title}
      </Typography>
    </Box>

    <TableContainer sx={sectionDataTableStyles.tableContainer}>
      <Table size="small" aria-label={title}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                scope="col"
                align={col.align ?? "left"}
                sx={{
                  ...sectionDataTableStyles.headCell,
                  minWidth: col.minWidth,
                  width: col.width,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{ ...sectionDataTableStyles.bodyCell, ...sectionDataTableStyles.emptyRow }}
              >
                <Typography variant="body2" sx={{ color: "var(--sublabel)", py: 2 }}>
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => {
              const key = getRowId?.(row, rowIndex) ?? rowIndex;
              return (
                <TableRow key={String(key)} hover>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align ?? "left"}
                      sx={sectionDataTableStyles.bodyCell}
                    >
                      {resolveCellContent(col, row, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
  );
}

export default SectionDataTable;
