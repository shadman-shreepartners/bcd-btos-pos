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
import { getIn, useFormikContext } from "formik";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { DomesticBookingFormValues } from "../domesticBookingTypes";
import type { ExistingTravelerRecord } from "../types/existingTraveler";
import {
  filterTravelers,
  loadExistingTravelerDirectory,
  travelerSubtitle,
} from "../utils/existingTravelerSearch";
import styles from "./styles/ExistingTravelerSearch.module.scss";

function SelectedTravelerCard({
  traveler,
  onRemove,
}: {
  traveler: ExistingTravelerRecord;
  onRemove: () => void;
}) {
  return (
    <Box className={styles.selectedCard}>
      <Box className={styles.selectedCardContent}>
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
      </Box>
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
  const {
    values,
    errors,
    touched,
    submitCount,
    setFieldValue,
    setFieldTouched,
  } = useFormikContext<DomesticBookingFormValues>();
  const [query, setQuery] = useState("");
  const travelerDirectory = useMemo(() => loadExistingTravelerDirectory(), []);
  const selectedTravelers = values.existingTravelers;
  const selectedIds = useMemo(
    () => new Set(selectedTravelers.map((t) => t.id)),
    [selectedTravelers],
  );
  const filtered = useMemo(
    () => filterTravelers(travelerDirectory, query, selectedIds),
    [travelerDirectory, query, selectedIds],
  );
  const showResultList = query.trim().length > 0;
  const existingTravelersTouched = getIn(touched, "existingTravelers");
  const hasExistingTravelersTouch =
    existingTravelersTouched === true ||
    (Array.isArray(existingTravelersTouched) &&
      existingTravelersTouched.some(Boolean));
  const showSearchFieldError = Boolean(
    errors.existingTravelers && (hasExistingTravelersTouch || submitCount > 0),
  );
  const selectTraveler = (traveler: ExistingTravelerRecord) => {
    void setFieldValue("existingTravelers", [traveler], true);
    setQuery("");
  };
  const handleSearch = () => {
    if (filtered.length === 1) selectTraveler(filtered[0]!);
  };
  const handleRemove = () => {
    void setFieldValue("existingTravelers", [], true);
  };
  const handleSearchBlur = () => {
    void setFieldTouched("existingTravelers", true, true);
  };

  const multiMatchHint =
    query.trim().length > 0 &&
    filtered.length > 1 &&
    !showSearchFieldError
      ? "Multiple matches — choose one below"
      : " ";

  const helperText = showSearchFieldError
    ? (errors.existingTravelers as string)
    : multiMatchHint;

  const selected = selectedTravelers[0];

  return (
    <Box>
      <Stack spacing={1} className={styles.container}>
        <Typography variant="caption" component="p" className={styles.header}>
          Search existing traveler
        </Typography>
        <Box className={styles.searchBox}>
          <TextField
            id="existingTravelerSearch"
            fullWidth
            size="medium"
            placeholder="Search by name or employee ID"
            value={query}
            error={showSearchFieldError}
            helperText={helperText}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={handleSearchBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (filtered.length === 1) selectTraveler(filtered[0]!);
                else handleSearch();
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
              if (filtered.length === 1) selectTraveler(filtered[0]!);
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
                    onClick={() => selectTraveler(traveler)}
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
        {selected ? (
          <Stack spacing={1.5} className={styles.selectedTravelersContainer}>
            <SelectedTravelerCard
              traveler={selected}
              onRemove={handleRemove}
            />
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
}

export default ExistingTravelerSearch;
export type { ExistingTravelerRecord } from "../types/existingTraveler";
export {
  loadExistingTravelerDirectory,
  OFFLINE_EXISTING_TRAVELER_FIXTURES,
} from "../utils/existingTravelerSearch";
