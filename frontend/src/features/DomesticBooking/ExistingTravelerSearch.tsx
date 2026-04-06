import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./views/styles/ExistingTravelerSearch.module.scss";

// const SEARCH_BUTTON_BG = "#1d2636";
// const AVATAR_BG = "#4a90e2";
// const CARD_BORDER = "#e0e0e0";

export type ExistingTravelerRecord = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  initials: string;
};

function travelerSubtitle(t: ExistingTravelerRecord) {
  return `${t.employeeId} • ${t.department}`;
}

/** Dummy directory for search / select (replace with API later). */
export const DUMMY_EXISTING_TRAVELERS: ExistingTravelerRecord[] = [
  {
    id: "emp-0942",
    name: "DHIRAJ PATEL",
    employeeId: "EMP-0942",
    department: "APAC Sales",
    initials: "DP",
  },
  {
    id: "emp-1001",
    name: "YUKI TANAKA",
    employeeId: "EMP-1001",
    department: "Tokyo HQ",
    initials: "YT",
  },
  {
    id: "emp-2044",
    name: "HANAKO SUZUKI",
    employeeId: "EMP-2044",
    department: "APAC Sales",
    initials: "HS",
  },
  {
    id: "emp-3102",
    name: "KENJI WATANABE",
    employeeId: "EMP-3102",
    department: "Operations",
    initials: "KW",
  },
  {
    id: "emp-0881",
    name: "SARAH CHEN",
    employeeId: "EMP-0881",
    department: "APAC Sales",
    initials: "SC",
  },
  {
    id: "emp-4500",
    name: "MICHAEL O'BRIEN",
    employeeId: "EMP-4500",
    department: "Finance",
    initials: "MO",
  },
];

function filterTravelers(
  travelers: ExistingTravelerRecord[],
  query: string,
  excludeIds: Set<string>,
): ExistingTravelerRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return travelers.filter((t) => {
    if (excludeIds.has(t.id)) return false;
    const haystack = [
      t.name,
      t.employeeId,
      t.department,
      t.initials,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

function SelectedTravelerCard({
  traveler,
  onRemove,
}: {
  traveler: ExistingTravelerRecord;
  onRemove: () => void;
}) {
  return (
    <Box className={styles.selectedCard}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar className={styles.avatar} aria-hidden>
          {traveler.initials}
        </Avatar>
        <Box className={styles.selectedCardText}>
          <Typography className={styles.selectedCardName}>
            {traveler.name}
          </Typography>
          <Typography className={styles.selectedCardSubtitle}>
            {travelerSubtitle(traveler)}
          </Typography>
        </Box>
      </Stack>
      <IconButton
        type="button"
        size="small"
        onClick={onRemove}
        aria-label={`Remove ${traveler.name}`}
        className={styles.selectedCardRemoveBtn}
      >
        <X size={20} strokeWidth={2} />
      </IconButton>
    </Box>
  );
}

function ExistingTravelerSearch() {
  const [query, setQuery] = useState("");
  const [selectedTravelers, setSelectedTravelers] = useState<
    ExistingTravelerRecord[]
  >([]);

  const selectedIds = useMemo(
    () => new Set(selectedTravelers.map((t) => t.id)),
    [selectedTravelers],
  );

  const filtered = useMemo(
    () =>
      filterTravelers(DUMMY_EXISTING_TRAVELERS, query, selectedIds),
    [query, selectedIds],
  );

  const showResultList = query.trim().length > 0;

  const appendTraveler = (traveler: ExistingTravelerRecord) => {
    if (selectedIds.has(traveler.id)) return;
    setSelectedTravelers((prev) => [...prev, traveler]);
    setQuery("");
  };

  const handleSearch = () => {
    if (filtered.length === 1) {
      appendTraveler(filtered[0]!);
    }
  };

  return (
    <Box>
    <Stack spacing={1} className={styles.container}>
      <Typography variant="caption" component="p" className={styles.header}>
        Search existing traveler
      </Typography>

      <Box className={styles.searchBox}>
        <TextField
          fullWidth
          size="medium"
          placeholder="Type 'Dhiraj' to test..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (filtered.length === 1) {
                appendTraveler(filtered[0]!);
              } else {
                handleSearch();
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  size={18}
                  strokeWidth={2}
                  className={styles.searchInputIcon}
                  aria-hidden
                />
              </InputAdornment>
            ),
          }}
          className={styles.searchInput}
        />
        <Button
          type="button"
          variant="contained"
          onClick={() => {
            if (filtered.length === 1) {
              appendTraveler(filtered[0]!);
            }
          }}
          className={styles.searchButton}
        >
          Search
        </Button>
      </Box>

      {showResultList ? (
        <Paper elevation={0} className={styles.resultsList}>
          {filtered.length === 0 ? (
            <Typography className={styles.noResults}>
              No matching travelers. Try another name or employee ID.
            </Typography>
          ) : (
            <List disablePadding aria-label="Traveler search results">
              {filtered.map((traveler) => (
                <ListItemButton
                  key={traveler.id}
                  alignItems="flex-start"
                  onClick={() => appendTraveler(traveler)}
                  className={styles.listItem}
                >
                  <ListItemAvatar className={styles.listItemAvatar}>
                    <Avatar className={styles.smallAvatar}>
                      {traveler.initials}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography className={styles.travelerName}>
                        {traveler.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        component="span"
                        className={styles.travelerSubtitle}
                      >
                        {travelerSubtitle(traveler)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      ) : null}

      {selectedTravelers.length > 0 ? (
        <Stack spacing={1.5} className={styles.selectedTravelersContainer}>
          {selectedTravelers.map((traveler) => (
            <SelectedTravelerCard
              key={traveler.id}
              traveler={traveler}
              onRemove={() =>
                setSelectedTravelers((prev) =>
                  prev.filter((t) => t.id !== traveler.id),
                )
              }
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
    </Box>
  );
}

export default ExistingTravelerSearch;
