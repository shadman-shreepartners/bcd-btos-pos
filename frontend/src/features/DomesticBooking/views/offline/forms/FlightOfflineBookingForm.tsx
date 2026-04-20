import { useEffect, useState } from "react";
import type { FormikProps } from "formik";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeftRight, ArrowRight, Search } from "lucide-react";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import { getTodayLocalDateString } from "@/features/DomesticBooking/utils/todayDateString";
import type { OfflineItineraryFormState } from "../../../offlineItinerary/types";
import {
  usePlaceLookup,
  type PlaceLookupItem,
} from "../../../hooks/usePlaceLookup";
import styles from "../../styles/DomesticOfflineBookingForms.module.scss";

export type FlightOfflineBookingFormProps = Pick<
  FormikProps<OfflineItineraryFormState>,
  "values" | "errors" | "touched" | "setFieldValue"
>;

type TripType = "return" | "oneway";
type DetailTab = "origin" | "return";
type TimeKind = "departure" | "arrival";

const AIRPORT_LOOKUP = "airports" as const;

const placeOptionEq = (
  a: string | PlaceLookupItem,
  b: string | PlaceLookupItem,
) => {
  if (typeof a === "string" || typeof b === "string") {
    return a === b;
  }
  return a.id === b.id;
};

const placeOptionLabel = (option: string | PlaceLookupItem) => {
  if (typeof option === "string") return option;
  return option?.name ?? "";
};

const searchFlightIcon = <Search size={18} strokeWidth={2.25} color="#ffffff" aria-hidden />;

const remarksHelperCopy =
  "If you have any request for arrangement, please fill in the remarks column. (within 1000 characters)";

const labelSx = { fontSize: "12px", fontWeight: "bold" } as const;

function fieldError(
  errors: FlightOfflineBookingFormProps["errors"],
  touched: FlightOfflineBookingFormProps["touched"],
  key: keyof OfflineItineraryFormState,
): string | undefined {
  const t = touched[key];
  const e = errors[key];
  if (!t || e == null) return undefined;
  return typeof e === "string" ? e : undefined;
}

const FlightOfflineBookingForm = ({
  values,
  errors,
  touched,
  setFieldValue,
}: FlightOfflineBookingFormProps) => {
  const tripType = (values.flight_tripType ?? "return") as TripType;
  const [detailTab, setDetailTab] = useState<DetailTab>("origin");
  const [originTimeKind, setOriginTimeKind] = useState<TimeKind>("departure");
  const [returnTimeKind, setReturnTimeKind] = useState<TimeKind>("departure");

  const [originLookupInput, setOriginLookupInput] = useState("");
  const [destinationLookupInput, setDestinationLookupInput] = useState("");
  const [returnFromLookupInput, setReturnFromLookupInput] = useState("");
  const [returnToLookupInput, setReturnToLookupInput] = useState("");

  const {
    places: originPlaces,
    loading: originPlacesLoading,
    error: originPlacesError,
  } = usePlaceLookup(originLookupInput, AIRPORT_LOOKUP);
  const {
    places: destinationPlaces,
    loading: destinationPlacesLoading,
    error: destinationPlacesError,
  } = usePlaceLookup(destinationLookupInput, AIRPORT_LOOKUP);
  const {
    places: returnFromPlaces,
    loading: returnFromPlacesLoading,
    error: returnFromPlacesError,
  } = usePlaceLookup(returnFromLookupInput, AIRPORT_LOOKUP);
  const {
    places: returnToPlaces,
    loading: returnToPlacesLoading,
    error: returnToPlacesError,
  } = usePlaceLookup(returnToLookupInput, AIRPORT_LOOKUP);

  const outboundOrigin = values.flight_outbound_origin ?? "";
  const outboundDest = values.flight_outbound_destination ?? "";
  const returnFrom = values.flight_return_origin ?? "";
  const returnTo = values.flight_return_destination ?? "";

  useEffect(() => {
    setOriginLookupInput(outboundOrigin);
  }, [outboundOrigin]);
  useEffect(() => {
    setDestinationLookupInput(outboundDest);
  }, [outboundDest]);
  useEffect(() => {
    setReturnFromLookupInput(returnFrom);
  }, [returnFrom]);
  useEffect(() => {
    setReturnToLookupInput(returnTo);
  }, [returnTo]);

  useEffect(() => {
    const hasDep = Boolean(
      values.flight_outbound_departureDate?.trim() &&
        values.flight_outbound_departureTime?.trim(),
    );
    const hasArr = Boolean(
      values.flight_outbound_arrivalDate?.trim() &&
        values.flight_outbound_arrivalTime?.trim(),
    );
    if (hasArr && !hasDep) setOriginTimeKind("arrival");
    else setOriginTimeKind("departure");
  }, [
    values.flight_outbound_departureDate,
    values.flight_outbound_departureTime,
    values.flight_outbound_arrivalDate,
    values.flight_outbound_arrivalTime,
  ]);

  useEffect(() => {
    const hasDep = Boolean(
      values.flight_return_departureDate?.trim() &&
        values.flight_return_departureTime?.trim(),
    );
    const hasArr = Boolean(
      values.flight_return_arrivalDate?.trim() &&
        values.flight_return_arrivalTime?.trim(),
    );
    if (hasArr && !hasDep) setReturnTimeKind("arrival");
    else setReturnTimeKind("departure");
  }, [
    values.flight_return_departureDate,
    values.flight_return_departureTime,
    values.flight_return_arrivalDate,
    values.flight_return_arrivalTime,
  ]);

  const isOrigin = detailTab === "origin";

  const swapOriginDestination = () => {
    const a = values.flight_outbound_origin ?? "";
    const b = values.flight_outbound_destination ?? "";
    void setFieldValue("flight_outbound_origin", b, true);
    void setFieldValue("flight_outbound_destination", a, true);
  };

  const setTripType = (v: TripType) => {
    void setFieldValue("flight_tripType", v, true);
    if (v === "oneway") setDetailTab("origin");
  };

  return (
    <Paper elevation={0} className={styles.carPaper}>
      <Grid container spacing={2} sx={{ p: 3 }}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <CustomInputLabel label="TRIP TYPE" required sx={labelSx} />
            <RadioGroup
              row
              className={styles.radioGroupRow}
              value={tripType}
              onChange={(e) => {
                setTripType(e.target.value as TripType);
              }}
            >
              <FormControlLabel value="return" control={<Radio size="small" />} label="Return Trip" />
              <FormControlLabel value="oneway" control={<Radio size="small" />} label="Oneway Trip" />
            </RadioGroup>
          </Stack>
        </Grid>

        {tripType === "return" ? (
          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={1}>
              <Box className={styles.flightDetailTabs}>
                <Tabs
                  value={detailTab}
                  onChange={(_, newValue) => setDetailTab(newValue as DetailTab)}
                  variant="fullWidth"
                  aria-label="Outbound or return flight details"
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{
                    minHeight: 0,
                    "& .MuiTabs-flexContainer": { gap: 1 },
                    "& .MuiTab-root": {
                      minHeight: 36,
                      textTransform: "none",
                    },
                  }}
                >
                  <Tab label="Origin Details" value="origin" className={styles.flightTab} />
                  <Tab label="Return Details" value="return" className={styles.flightTab} />
                </Tabs>
              </Box>
            </Stack>
          </Grid>
        ) : null}

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {isOrigin ? (
          <>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <CustomInputLabel
                  label="ORIGIN / DESTINATION DATE"
                  required
                  sx={labelSx}
                />
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <TextField
                    variant="outlined"
                    type="date"
                    value={
                      originTimeKind === "departure"
                        ? (values.flight_outbound_departureDate ?? "")
                        : (values.flight_outbound_arrivalDate ?? "")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (originTimeKind === "departure") {
                        void setFieldValue("flight_outbound_departureDate", v, true);
                        void setFieldValue("flight_outbound_arrivalDate", "", true);
                        void setFieldValue("flight_outbound_arrivalTime", "", true);
                      } else {
                        void setFieldValue("flight_outbound_arrivalDate", v, true);
                        void setFieldValue("flight_outbound_departureDate", "", true);
                        void setFieldValue("flight_outbound_departureTime", "", true);
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getTodayLocalDateString() }}
                    sx={{ minWidth: { xs: "100%", md: 168 } }}
                    error={Boolean(
                      fieldError(errors, touched, "flight_outbound_departureDate") ||
                        fieldError(errors, touched, "flight_outbound_arrivalDate"),
                    )}
                  />
                  <TextField
                    variant="outlined"
                    type="time"
                    value={
                      originTimeKind === "departure"
                        ? (values.flight_outbound_departureTime ?? "")
                        : (values.flight_outbound_arrivalTime ?? "")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (originTimeKind === "departure") {
                        void setFieldValue("flight_outbound_departureTime", v, true);
                        void setFieldValue("flight_outbound_arrivalDate", "", true);
                        void setFieldValue("flight_outbound_arrivalTime", "", true);
                      } else {
                        void setFieldValue("flight_outbound_arrivalTime", v, true);
                        void setFieldValue("flight_outbound_departureDate", "", true);
                        void setFieldValue("flight_outbound_departureTime", "", true);
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: "100%", md: 140 } }}
                  />
                  <RadioGroup
                    row
                    className={styles.radioGroupRow}
                    value={originTimeKind}
                    onChange={(e) => {
                      const next = e.target.value as TimeKind;
                      const date =
                        originTimeKind === "departure"
                          ? values.flight_outbound_departureDate
                          : values.flight_outbound_arrivalDate;
                      const time =
                        originTimeKind === "departure"
                          ? values.flight_outbound_departureTime
                          : values.flight_outbound_arrivalTime;
                      setOriginTimeKind(next);
                      if (next === "arrival") {
                        void setFieldValue("flight_outbound_arrivalDate", date ?? "", true);
                        void setFieldValue("flight_outbound_arrivalTime", time ?? "", true);
                        void setFieldValue("flight_outbound_departureDate", "", true);
                        void setFieldValue("flight_outbound_departureTime", "", true);
                      } else {
                        void setFieldValue("flight_outbound_departureDate", date ?? "", true);
                        void setFieldValue("flight_outbound_departureTime", time ?? "", true);
                        void setFieldValue("flight_outbound_arrivalDate", "", true);
                        void setFieldValue("flight_outbound_arrivalTime", "", true);
                      }
                    }}
                  >
                    <FormControlLabel value="departure" control={<Radio size="small" />} label="Departure" />
                    <FormControlLabel value="arrival" control={<Radio size="small" />} label="Arrival" />
                  </RadioGroup>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <CustomInputLabel label="ORIGIN / DESTINATION" required sx={labelSx} />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Autocomplete<PlaceLookupItem, false, false, true>
                      freeSolo
                      value={outboundOrigin}
                      inputValue={originLookupInput}
                      options={originPlaces}
                      loading={originPlacesLoading}
                      filterOptions={(opts) => opts}
                      getOptionLabel={placeOptionLabel}
                      isOptionEqualToValue={placeOptionEq}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === "input" || reason === "clear") {
                          setOriginLookupInput(newInputValue);
                          void setFieldValue("flight_outbound_origin", newInputValue, true);
                        }
                      }}
                      onChange={(_, newValue) => {
                        const str =
                          typeof newValue === "string"
                            ? newValue
                            : newValue
                              ? newValue.name
                              : "";
                        void setFieldValue("flight_outbound_origin", str, true);
                        setOriginLookupInput(str);
                      }}
                      noOptionsText="Not found"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="From (Origin)"
                          fullWidth
                          error={Boolean(
                            originPlacesError ||
                              fieldError(errors, touched, "flight_outbound_origin"),
                          )}
                          helperText={
                            originPlacesError ??
                            fieldError(errors, touched, "flight_outbound_origin") ??
                            " "
                          }
                        />
                      )}
                    />
                  </Box>
                  <Box
                    className={styles.gridArrowCell}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      py: { xs: 0.5, sm: 0 },
                    }}
                  >
                    <ArrowLeftRight
                      size={22}
                      className={styles.flightSwapIcon}
                      aria-label="Swap origin and destination"
                      role="button"
                      tabIndex={0}
                      onClick={swapOriginDestination}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          swapOriginDestination();
                        }
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Autocomplete<PlaceLookupItem, false, false, true>
                      freeSolo
                      value={outboundDest}
                      inputValue={destinationLookupInput}
                      options={destinationPlaces}
                      loading={destinationPlacesLoading}
                      filterOptions={(opts) => opts}
                      getOptionLabel={placeOptionLabel}
                      isOptionEqualToValue={placeOptionEq}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === "input" || reason === "clear") {
                          setDestinationLookupInput(newInputValue);
                          void setFieldValue("flight_outbound_destination", newInputValue, true);
                        }
                      }}
                      onChange={(_, newValue) => {
                        const str =
                          typeof newValue === "string"
                            ? newValue
                            : newValue
                              ? newValue.name
                              : "";
                        void setFieldValue("flight_outbound_destination", str, true);
                        setDestinationLookupInput(str);
                      }}
                      noOptionsText="Not found"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="To (Destination)"
                          fullWidth
                          error={Boolean(
                            destinationPlacesError ||
                              fieldError(errors, touched, "flight_outbound_destination"),
                          )}
                          helperText={
                            destinationPlacesError ??
                            fieldError(errors, touched, "flight_outbound_destination") ??
                            " "
                          }
                        />
                      )}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="button"
                  variant="contained"
                  className={styles.flightSearchButton}
                  startIcon={searchFlightIcon}
                  sx={{ minWidth: 180 }}
                >
                  Search Flights
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="CARRIER" required sx={labelSx} />
                <TextField
                  select
                  variant="outlined"
                  fullWidth
                  value={values.flight_outbound_airline ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_outbound_airline", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_outbound_airline"))}
                  helperText={fieldError(errors, touched, "flight_outbound_airline") ?? " "}
                >
                  <MenuItem value="">Select One</MenuItem>
                  <MenuItem value="jal">JAL</MenuItem>
                  <MenuItem value="ana">ANA</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="FLIGHT NO." required sx={labelSx} />
                <TextField
                  variant="outlined"
                  fullWidth
                  value={values.flight_outbound_flightNo ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_outbound_flightNo", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_outbound_flightNo"))}
                  helperText={fieldError(errors, touched, "flight_outbound_flightNo") ?? " "}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="CLASS" required sx={labelSx} />
                <TextField
                  select
                  variant="outlined"
                  fullWidth
                  value={values.flight_outbound_cabinClass ?? "economy"}
                  onChange={(e) =>
                    void setFieldValue("flight_outbound_cabinClass", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_outbound_cabinClass"))}
                  helperText={fieldError(errors, touched, "flight_outbound_cabinClass") ?? " "}
                >
                  <MenuItem value="economy">Economy</MenuItem>
                  <MenuItem value="premium">Premium Economy</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="SEAT PREFERENCE" sx={labelSx} />
                <TextField
                  select
                  variant="outlined"
                  fullWidth
                  value={values.flight_seatPreference ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_seatPreference", e.target.value, true)
                  }
                  helperText=" "
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="aisle">Aisle</MenuItem>
                  <MenuItem value="window">Window</MenuItem>
                  <MenuItem value="no_preference">No Preference</MenuItem>
                </TextField>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <CustomInputLabel label="REMARKS" sx={labelSx} />
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Enter additional requests..."
                  value={values.flight_remarks ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_remarks", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_remarks"))}
                  helperText={fieldError(errors, touched, "flight_remarks") ?? " "}
                />
                <Typography className={styles.remarksHelper}>{remarksHelperCopy}</Typography>
              </Stack>
            </Grid>

            {tripType === "return" ? (
              <Grid item xs={12}>
                <Box className={styles.flightContinueRow}>
                  <Button
                    type="button"
                    variant="text"
                    className={styles.flightContinueButton}
                    endIcon={<span aria-hidden>→</span>}
                    onClick={() => setDetailTab("return")}
                  >
                    Continue to return flight
                  </Button>
                </Box>
              </Grid>
            ) : null}
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <CustomInputLabel label="RETURN DATE / TIME" required sx={labelSx} />
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <TextField
                    variant="outlined"
                    type="date"
                    value={
                      returnTimeKind === "departure"
                        ? (values.flight_return_departureDate ?? "")
                        : (values.flight_return_arrivalDate ?? "")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (returnTimeKind === "departure") {
                        void setFieldValue("flight_return_departureDate", v, true);
                        void setFieldValue("flight_return_arrivalDate", "", true);
                        void setFieldValue("flight_return_arrivalTime", "", true);
                      } else {
                        void setFieldValue("flight_return_arrivalDate", v, true);
                        void setFieldValue("flight_return_departureDate", "", true);
                        void setFieldValue("flight_return_departureTime", "", true);
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getTodayLocalDateString() }}
                    sx={{ minWidth: { xs: "100%", md: 168 } }}
                    error={Boolean(
                      fieldError(errors, touched, "flight_return_departureDate") ||
                        fieldError(errors, touched, "flight_return_arrivalDate"),
                    )}
                  />
                  <TextField
                    variant="outlined"
                    type="time"
                    value={
                      returnTimeKind === "departure"
                        ? (values.flight_return_departureTime ?? "")
                        : (values.flight_return_arrivalTime ?? "")
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (returnTimeKind === "departure") {
                        void setFieldValue("flight_return_departureTime", v, true);
                        void setFieldValue("flight_return_arrivalDate", "", true);
                        void setFieldValue("flight_return_arrivalTime", "", true);
                      } else {
                        void setFieldValue("flight_return_arrivalTime", v, true);
                        void setFieldValue("flight_return_departureDate", "", true);
                        void setFieldValue("flight_return_departureTime", "", true);
                      }
                    }}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: { xs: "100%", md: 140 } }}
                  />
                  <RadioGroup
                    row
                    className={styles.radioGroupRow}
                    value={returnTimeKind}
                    onChange={(e) => {
                      const next = e.target.value as TimeKind;
                      const date =
                        returnTimeKind === "departure"
                          ? values.flight_return_departureDate
                          : values.flight_return_arrivalDate;
                      const time =
                        returnTimeKind === "departure"
                          ? values.flight_return_departureTime
                          : values.flight_return_arrivalTime;
                      setReturnTimeKind(next);
                      if (next === "arrival") {
                        void setFieldValue("flight_return_arrivalDate", date ?? "", true);
                        void setFieldValue("flight_return_arrivalTime", time ?? "", true);
                        void setFieldValue("flight_return_departureDate", "", true);
                        void setFieldValue("flight_return_departureTime", "", true);
                      } else {
                        void setFieldValue("flight_return_departureDate", date ?? "", true);
                        void setFieldValue("flight_return_departureTime", time ?? "", true);
                        void setFieldValue("flight_return_arrivalDate", "", true);
                        void setFieldValue("flight_return_arrivalTime", "", true);
                      }
                    }}
                  >
                    <FormControlLabel value="departure" control={<Radio size="small" />} label="Departure" />
                    <FormControlLabel value="arrival" control={<Radio size="small" />} label="Arrival" />
                  </RadioGroup>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <CustomInputLabel label="ORIGIN / DESTINATION" required sx={labelSx} />
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Autocomplete<PlaceLookupItem, false, false, true>
                      freeSolo
                      value={returnFrom}
                      inputValue={returnFromLookupInput}
                      options={returnFromPlaces}
                      loading={returnFromPlacesLoading}
                      filterOptions={(opts) => opts}
                      getOptionLabel={placeOptionLabel}
                      isOptionEqualToValue={placeOptionEq}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === "input" || reason === "clear") {
                          setReturnFromLookupInput(newInputValue);
                          void setFieldValue("flight_return_origin", newInputValue, true);
                        }
                      }}
                      onChange={(_, newValue) => {
                        const str =
                          typeof newValue === "string"
                            ? newValue
                            : newValue
                              ? newValue.name
                              : "";
                        void setFieldValue("flight_return_origin", str, true);
                        setReturnFromLookupInput(str);
                      }}
                      noOptionsText="Not found"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="From (Origin)"
                          fullWidth
                          error={Boolean(
                            returnFromPlacesError ||
                              fieldError(errors, touched, "flight_return_origin"),
                          )}
                          helperText={
                            returnFromPlacesError ??
                            fieldError(errors, touched, "flight_return_origin") ??
                            " "
                          }
                        />
                      )}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ArrowRight size={20} strokeWidth={2} className={styles.flightReturnArrowIcon} aria-hidden />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Autocomplete<PlaceLookupItem, false, false, true>
                      freeSolo
                      value={returnTo}
                      inputValue={returnToLookupInput}
                      options={returnToPlaces}
                      loading={returnToPlacesLoading}
                      filterOptions={(opts) => opts}
                      getOptionLabel={placeOptionLabel}
                      isOptionEqualToValue={placeOptionEq}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === "input" || reason === "clear") {
                          setReturnToLookupInput(newInputValue);
                          void setFieldValue("flight_return_destination", newInputValue, true);
                        }
                      }}
                      onChange={(_, newValue) => {
                        const str =
                          typeof newValue === "string"
                            ? newValue
                            : newValue
                              ? newValue.name
                              : "";
                        void setFieldValue("flight_return_destination", str, true);
                        setReturnToLookupInput(str);
                      }}
                      noOptionsText="Not found"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="To (Destination)"
                          fullWidth
                          error={Boolean(
                            returnToPlacesError ||
                              fieldError(errors, touched, "flight_return_destination"),
                          )}
                          helperText={
                            returnToPlacesError ??
                            fieldError(errors, touched, "flight_return_destination") ??
                            " "
                          }
                        />
                      )}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="button"
                  variant="contained"
                  className={styles.flightSearchButton}
                  startIcon={searchFlightIcon}
                  sx={{ minWidth: 200 }}
                >
                  Search Return Flights
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="CARRIER" required sx={labelSx} />
                <TextField
                  select
                  variant="outlined"
                  fullWidth
                  value={values.flight_return_airline ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_return_airline", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_return_airline"))}
                  helperText={fieldError(errors, touched, "flight_return_airline") ?? " "}
                >
                  <MenuItem value="">Select One</MenuItem>
                  <MenuItem value="jal">JAL</MenuItem>
                  <MenuItem value="ana">ANA</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="FLIGHT NO." required sx={labelSx} />
                <TextField
                  variant="outlined"
                  fullWidth
                  value={values.flight_return_flightNo ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_return_flightNo", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_return_flightNo"))}
                  helperText={fieldError(errors, touched, "flight_return_flightNo") ?? " "}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="CLASS" required sx={labelSx} />
                <TextField
                  select
                  variant="outlined"
                  fullWidth
                  value={values.flight_return_cabinClass ?? "economy"}
                  onChange={(e) =>
                    void setFieldValue("flight_return_cabinClass", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_return_cabinClass"))}
                  helperText={fieldError(errors, touched, "flight_return_cabinClass") ?? " "}
                >
                  <MenuItem value="economy">Economy</MenuItem>
                  <MenuItem value="premium">Premium Economy</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <CustomInputLabel label="SEAT PREFERENCE" sx={labelSx} />
                <TextField
                  select
                  variant="outlined"
                  fullWidth
                  value={values.flight_seatPreference ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_seatPreference", e.target.value, true)
                  }
                  helperText=" "
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="aisle">Aisle</MenuItem>
                  <MenuItem value="window">Window</MenuItem>
                  <MenuItem value="no_preference">No Preference</MenuItem>
                </TextField>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Stack spacing={1}>
                <CustomInputLabel label="REMARKS" sx={labelSx} />
                <TextField
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Enter additional requests..."
                  value={values.flight_remarks ?? ""}
                  onChange={(e) =>
                    void setFieldValue("flight_remarks", e.target.value, true)
                  }
                  error={Boolean(fieldError(errors, touched, "flight_remarks"))}
                  helperText={fieldError(errors, touched, "flight_remarks") ?? " "}
                />
                <Typography className={styles.remarksHelper}>{remarksHelperCopy}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Box className={styles.flightReturnFooterActions}>
                <Button
                  type="button"
                  variant="outlined"
                  className={styles.flightBackToOrigin}
                  onClick={() => setDetailTab("origin")}
                >
                  Back to Origin
                </Button>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

export default FlightOfflineBookingForm;
