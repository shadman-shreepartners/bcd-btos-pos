import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CustomInputLabel from "../../shared/components/CustomInputLabel";

type SearchFilters = {
  requestNo: string;
  fromDate: string;
  toDate: string;
  traveler: string;
};

type TripRequest = {
  requestNo: string;
  requestDate: string;
  intDom: "Dom" | "Int";
  travelDates: string;
  traveler: string;
  amount: number;
  requestType: string;
  offlineStatus: string;
  onlineStatus: string;
  approvalStatus: string;
  settlementDate: string;
  travelType: string;
};

const INITIAL_FILTERS: SearchFilters = {
  requestNo: "",
  fromDate: "",
  toDate: "",
  traveler: "",
};

const MOCK_ROWS: TripRequest[] = [
  {
    requestNo: "B71070",
    requestDate: "2026/02/16",
    intDom: "Dom",
    travelDates: "2026/06/02-2026/06/02",
    traveler: "Jon Deo",
    amount: 0,
    requestType: "—",
    offlineStatus: "—",
    onlineStatus: "—",
    approvalStatus: "—",
    settlementDate: "—",
    travelType: "Domestic",
  },
  {
    requestNo: "3177647",
    requestDate: "2025/07/31",
    intDom: "Dom",
    travelDates: "2025/09/03-2025/09/04",
    traveler: "Jon Deo",
    amount: 0,
    requestType: "New",
    offlineStatus: "Canceled",
    onlineStatus: "Arranging",
    approvalStatus: "—",
    settlementDate: "—",
    travelType: "Domestic",
  },
  {
    requestNo: "3177646",
    requestDate: "2025/07/30",
    intDom: "Dom",
    travelDates: "2025/08/17-2025/08/17",
    traveler: "Chetan Salunke",
    amount: 0,
    requestType: "—",
    offlineStatus: "—",
    onlineStatus: "—",
    approvalStatus: "—",
    settlementDate: "—",
    travelType: "Domestic",
  },
];

const normalizeDate = (value: string) => value.replaceAll("/", "-");

function MyTripTibraryPage() {
  const [showSearch, setShowSearch] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);

  const handleFilterChange = (key: keyof SearchFilters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleClear = () => setFilters(INITIAL_FILTERS);

  const filteredRows = useMemo(() => {
    return MOCK_ROWS.filter((row) => {
      const requestNoMatch =
        !filters.requestNo ||
        row.requestNo.toLowerCase().includes(filters.requestNo.toLowerCase());
      const travelerMatch =
        !filters.traveler ||
        row.traveler.toLowerCase().includes(filters.traveler.toLowerCase());
      const fromMatch =
        !filters.fromDate || normalizeDate(row.requestDate) >= filters.fromDate;
      const toMatch =
        !filters.toDate || normalizeDate(row.requestDate) <= filters.toDate;
      return requestNoMatch && travelerMatch && fromMatch && toMatch;
    });
  }, [filters]);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 0.5, color: "text.primary" }}>
        My Trip Library
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, color: "text.secondary" }}>
        View and manage your travel requests.
      </Typography>

      <Link
        component="button"
        variant="body2"
        onClick={() => setShowSearch((prev) => !prev)}
        sx={{ mb: 1.5 }}
      >
        {showSearch ? "Hide search condition" : "Show search condition"}
      </Link>

      <Collapse in={showSearch}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            SEARCH CONDITION
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <CustomInputLabel
                label="REQUEST NO."
                sx={{ mb: 0.5, fontSize: 12, fontWeight: 600 }}
              />
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. B71070"
                value={filters.requestNo}
                onChange={(e) =>
                  handleFilterChange("requestNo", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomInputLabel
                label="REQUEST DATE (FROM)"
                sx={{ mb: 0.5, fontSize: 12, fontWeight: 600 }}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomInputLabel
                label="REQUEST DATE (TO)"
                sx={{ mb: 0.5, fontSize: 12, fontWeight: 600 }}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <CustomInputLabel
                label="TRAVELER"
                sx={{ mb: 0.5, fontSize: 12, fontWeight: 600 }}
              />
              <TextField
                fullWidth
                size="small"
                placeholder=""
                value={filters.traveler}
                onChange={(e) => handleFilterChange("traveler", e.target.value)}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained">Search</Button>
            <Button variant="outlined" onClick={handleClear}>
              Clear
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      <Paper
        variant="outlined"
        sx={{
          overflowX: "auto",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "var(--navy)" }}>
              {[
                "REQUEST NO.",
                "REQUEST DATE",
                "INT'L / DOM",
                "TRAVEL DATES",
                "TRAVELER",
                "AMOUNT",
                "REQUEST TYPE",
                "OFFLINE STATUS",
                "ONLINE STATUS",
                "APPROVAL STATUS",
                "SETTLEMENT DATE",
                "TRAVEL TYPE",
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    borderBottom: 0,
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.requestNo} hover>
                <TableCell>
                  <Link component="button" variant="body2">
                    {row.requestNo}
                  </Link>
                </TableCell>
                <TableCell>{row.requestDate}</TableCell>
                <TableCell>{row.intDom}</TableCell>
                <TableCell>{row.travelDates}</TableCell>
                <TableCell>{row.traveler}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.requestType}</TableCell>
                <TableCell>{row.offlineStatus}</TableCell>
                <TableCell>{row.onlineStatus}</TableCell>
                <TableCell>{row.approvalStatus}</TableCell>
                <TableCell>{row.settlementDate}</TableCell>
                <TableCell>{row.travelType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default MyTripTibraryPage;
