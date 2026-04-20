import type { FormikProps } from "formik";
import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import { getTodayLocalDateString } from "@/features/DomesticBooking/utils/todayDateString";
import type { OfflineItineraryFormState } from "../../../offlineItinerary/types";
import {
  usePlaceLookup,
  type PlaceLookupItem,
} from "../../../hooks/usePlaceLookup";
import styles from "../../styles/DomesticOfflineBookingForms.module.scss";

export type JrOfflineBookingFormProps = Pick<
  FormikProps<OfflineItineraryFormState>,
  | "values"
  | "errors"
  | "touched"
  | "handleChange"
  | "handleBlur"
  | "setFieldValue"
>;

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

/** Formik validation wins; then API lookup message; keep single-line space for layout. */
const lookupFieldHelper = (
  touched: boolean,
  formikMsg: string | undefined,
  lookupErr: string | null,
) => {
  if (touched && formikMsg) return formikMsg;
  if (lookupErr) return lookupErr;
  return " ";
};

const lookupFieldError = (
  touched: boolean,
  formikMsg: string | undefined,
  lookupErr: string | null,
) => Boolean((touched && formikMsg) || lookupErr);

const JrOfflineBookingForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}: JrOfflineBookingFormProps) => {
  const [originLookupInput, setOriginLookupInput] = useState(
    values.jr_origin,
  );
  const [destinationLookupInput, setDestinationLookupInput] = useState(
    values.jr_destination,
  );
  const [ticketOriginLookupInput, setTicketOriginLookupInput] = useState(
    values.jr_returnOrigin,
  );
  const [ticketDestinationLookupInput, setTicketDestinationLookupInput] =
    useState(values.jr_returnDestination);
  const [sameAsAbove, setSameAsAbove] = useState(false);

  const t = values.jr_transportType;
  const {
    places: originPlaces,
    loading: originPlacesLoading,
    error: originPlacesError,
  } = usePlaceLookup(originLookupInput, t);
  const {
    places: destinationPlaces,
    loading: destinationPlacesLoading,
    error: destinationPlacesError,
  } = usePlaceLookup(destinationLookupInput, t);
  const {
    places: ticketOriginPlaces,
    loading: ticketOriginPlacesLoading,
    error: ticketOriginPlacesError,
  } = usePlaceLookup(ticketOriginLookupInput, t);
  const {
    places: ticketDestinationPlaces,
    loading: ticketDestinationPlacesLoading,
    error: ticketDestinationPlacesError,
  } = usePlaceLookup(ticketDestinationLookupInput, t);

  useEffect(() => {
    setOriginLookupInput(values.jr_origin);
  }, [values.jr_origin]);
  useEffect(() => {
    setDestinationLookupInput(values.jr_destination);
  }, [values.jr_destination]);
  useEffect(() => {
    setTicketOriginLookupInput(values.jr_returnOrigin);
  }, [values.jr_returnOrigin]);
  useEffect(() => {
    setTicketDestinationLookupInput(values.jr_returnDestination);
  }, [values.jr_returnDestination]);

  useEffect(() => {
    if (values.jr_transportType !== "rail") setSameAsAbove(false);
  }, [values.jr_transportType]);

  useEffect(() => {
    if (!sameAsAbove) return;
    const aligned =
      values.jr_returnOrigin === values.jr_origin &&
      values.jr_returnDestination === values.jr_destination;
    if (!aligned) setSameAsAbove(false);
  }, [
    sameAsAbove,
    values.jr_origin,
    values.jr_destination,
    values.jr_returnOrigin,
    values.jr_returnDestination,
  ]);

  return (
    <Box className={styles.jrRoot}>
      <Box className={styles.jrNotice}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              name="jr_noReservationRequired"
              checked={values.jr_noReservationRequired}
              onChange={handleChange}
            />
          }
          label={
            <Typography className={styles.jrNoticeText}>
              No reservation required (Fill an itinerary out to save for
              your personal records. No request will be sent to travel
              agent.)
            </Typography>
          }
        />
      </Box>
      <Box className={styles.jrFormSection}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="TRANSPORTATION TYPE"
              required
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <RadioGroup
              row
              name="jr_transportType"
              value={values.jr_transportType}
              onChange={handleChange}
              className={styles.radioGroupRow}
            >
              <FormControlLabel
                value="rail"
                control={<Radio size="small" />}
                label="Rail"
              />
              <FormControlLabel
                value="bus"
                control={<Radio size="small" />}
                label="Bus"
              />
              <FormControlLabel
                value="ship"
                control={<Radio size="small" />}
                label="Ship"
              />
            </RadioGroup>
          </Grid>
        </Grid>
        <Divider />
        {/* Rail form */}
        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="DEPARTURE DATE"
              required
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={3.5}>
            <TextField
              fullWidth
              type="date"
              name="jr_departureDate"
              value={values.jr_departureDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.jr_departureDate &&
                Boolean(errors.jr_departureDate)
              }
              helperText={
                touched.jr_departureDate && errors.jr_departureDate
                  ? errors.jr_departureDate
                  : " "
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayLocalDateString() }}
            />
          </Grid>
        </Grid>
        <Divider />

        {/* Searchable ORIGIN / DESTINATION */}
        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="ORIGIN / DESTINATION"
              required
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete<PlaceLookupItem, false, false, true>
              freeSolo={true}
              value={values.jr_origin}
              inputValue={originLookupInput}
              options={originPlaces}
              loading={originPlacesLoading}
              filterOptions={(opts) => opts}
              getOptionLabel={placeOptionLabel}
              isOptionEqualToValue={placeOptionEq}
              onInputChange={(_, newInputValue, reason) => {
                if (reason === "input" || reason === "clear") {
                  setOriginLookupInput(newInputValue);
                  void setFieldValue("jr_origin", newInputValue);
                }
              }}
              onChange={(_, newValue) => {
                const str =
                  typeof newValue === "string"
                    ? newValue
                    : newValue
                      ? newValue.name
                      : "";
                void setFieldValue("jr_origin", str);
                setOriginLookupInput(str);
              }}
              noOptionsText="Not found"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Origin"
                  fullWidth
                  name="jr_origin"
                  onBlur={handleBlur}
                  error={lookupFieldError(
                    Boolean(touched.jr_origin),
                    errors.jr_origin,
                    originPlacesError,
                  )}
                  helperText={lookupFieldHelper(
                    Boolean(touched.jr_origin),
                    errors.jr_origin,
                    originPlacesError,
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={1} className={styles.gridArrowCell}>
            <ArrowForward className={styles.mutedArrow} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Autocomplete<PlaceLookupItem, false, false, true>
              freeSolo={true}
              value={values.jr_destination}
              inputValue={destinationLookupInput}
              options={destinationPlaces}
              loading={destinationPlacesLoading}
              filterOptions={(opts) => opts}
              getOptionLabel={placeOptionLabel}
              isOptionEqualToValue={placeOptionEq}
              onInputChange={(_, newInputValue, reason) => {
                if (reason === "input" || reason === "clear") {
                  setDestinationLookupInput(newInputValue);
                  void setFieldValue("jr_destination", newInputValue);
                }
              }}
              onChange={(_, newValue) => {
                const str =
                  typeof newValue === "string"
                    ? newValue
                    : newValue
                      ? newValue.name
                      : "";
                void setFieldValue("jr_destination", str);
                setDestinationLookupInput(str);
              }}
              noOptionsText="Not found"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Destination"
                  fullWidth
                  name="jr_destination"
                  onBlur={handleBlur}
                  error={lookupFieldError(
                    Boolean(touched.jr_destination),
                    errors.jr_destination,
                    destinationPlacesError,
                  )}
                  helperText={lookupFieldHelper(
                    Boolean(touched.jr_destination),
                    errors.jr_destination,
                    destinationPlacesError,
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
        <Divider />

        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="ORIGIN / DESTINATION TIME"
              required
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="time"
              name="jr_departureTime"
              value={values.jr_departureTime}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.jr_departureTime &&
                Boolean(errors.jr_departureTime)
              }
              helperText={
                touched.jr_departureTime && errors.jr_departureTime
                  ? errors.jr_departureTime
                  : " "
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <CustomInputLabel
              label="DEPARTURE"
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="time"
              name="jr_arrivalTime"
              value={values.jr_arrivalTime}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.jr_arrivalTime && Boolean(errors.jr_arrivalTime)
              }
              helperText={
                touched.jr_arrivalTime && errors.jr_arrivalTime
                  ? errors.jr_arrivalTime
                  : " "
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <CustomInputLabel
              label="ARRIVAL"
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
        </Grid>
        <Divider />
        {values.jr_transportType === "rail" && (
          <Grid
            container
            spacing={2}
            alignItems="center"
            className={styles.formRow}
          >
            <Grid item xs={12} md={3}>
              <CustomInputLabel
                label="TRAIN NAME / TRAIN NO."
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              />
            </Grid>
            <Grid item xs={12} md={2.5}>
              <TextField
                fullWidth
                placeholder="Train Name"
                name="jr_trainName"
                value={values.jr_trainName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                placeholder="Train No."
                name="jr_trainNo"
                value={values.jr_trainNo}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Grid>
          </Grid>
        )}
        <Divider />

        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="SEATS"
              required
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={4.5}>
            <TextField
              select
              fullWidth
              name="jr_seats"
              value={values.jr_seats}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.jr_seats && Boolean(errors.jr_seats)}
              helperText={
                touched.jr_seats && errors.jr_seats
                  ? errors.jr_seats
                  : " "
              }
            >
              <MenuItem value="reserved">RESERVED SEAT</MenuItem>
              <MenuItem value="unreserved_joban_line">
                UNRESERVED SEAT TICKET(JOBAN LINE)
              </MenuItem>
              <MenuItem value="unreserved_chuo_line">
                UNRESERVED SEAT TICKET(CHUO LINE)
              </MenuItem>
              <MenuItem value="green_car">GREEN CAR</MenuItem>
              <MenuItem value="grain_class">GRAN CLASS</MenuItem>
              <MenuItem value="basic_fare">BASIC FARE ONLY</MenuItem>
              <MenuItem value="non-reserved">NON-RESERVED</MenuItem>
              <MenuItem value="compartmant">COMPARTMENT</MenuItem>
              <MenuItem value="sleeping_car_a">SLEEPING CAR A</MenuItem>
              <MenuItem value="sleeping_car_b">SLEEPING CAR B</MenuItem>
              <MenuItem value="unspecified">UNSPECIFIED</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Divider />
        {values.jr_transportType === "rail" && (
          <Grid
            container
            spacing={2}
            alignItems="flex-start"
            className={styles.formRow}
          >
            <Grid item xs={12} md={3}>
              <CustomInputLabel
                label="TICKET"
                required
                sx={{ fontSize: "12px", fontWeight: "bold" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <Autocomplete<PlaceLookupItem, false, false, true>
                  freeSolo={true}
                  fullWidth
                  sx={{ alignSelf: "stretch" }}
                  value={values.jr_returnOrigin}
                  inputValue={ticketOriginLookupInput}
                  options={ticketOriginPlaces}
                  loading={ticketOriginPlacesLoading}
                  filterOptions={(opts) => opts}
                  getOptionLabel={placeOptionLabel}
                  isOptionEqualToValue={placeOptionEq}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === "input" || reason === "clear") {
                      setTicketOriginLookupInput(newInputValue);
                      void setFieldValue("jr_returnOrigin", newInputValue);
                    }
                  }}
                  onChange={(_, newValue) => {
                    const str =
                      typeof newValue === "string"
                        ? newValue
                        : newValue
                          ? newValue.name
                          : "";
                    void setFieldValue("jr_returnOrigin", str);
                    setTicketOriginLookupInput(str);
                  }}
                  noOptionsText="Not found"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Origin"
                      fullWidth
                      name="jr_returnOrigin"
                      onBlur={handleBlur}
                      error={lookupFieldError(
                        Boolean(touched.jr_returnOrigin),
                        errors.jr_returnOrigin,
                        ticketOriginPlacesError,
                      )}
                      helperText={lookupFieldHelper(
                        Boolean(touched.jr_returnOrigin),
                        errors.jr_returnOrigin,
                        ticketOriginPlacesError,
                      )}
                    />
                  )}
                />
                <FormControlLabel
                  sx={{ mt: 0.5, ml: 0, mr: 0, alignSelf: "flex-start" }}
                  control={
                    <Checkbox
                      checked={sameAsAbove}
                      onChange={(_, checked) => {
                        setSameAsAbove(checked);
                        if (checked) {
                          void setFieldValue(
                            "jr_returnOrigin",
                            values.jr_origin,
                          );
                          void setFieldValue(
                            "jr_returnDestination",
                            values.jr_destination,
                          );
                          setTicketOriginLookupInput(values.jr_origin);
                          setTicketDestinationLookupInput(
                            values.jr_destination,
                          );
                        }
                      }}
                      sx={{
                        color: "#E53935",
                        "&.Mui-checked": { color: "#E53935" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "10px",
                        textTransform: "uppercase",
                        color: "#475569",
                        mt: 0.5,
                      }}
                    >
                      SAME AS ABOVE
                    </Typography>
                  }
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={1} className={styles.gridArrowCell}>
              <ArrowForward className={styles.mutedArrow} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete<PlaceLookupItem, false, false, true>
                freeSolo={true}
                value={values.jr_returnDestination}
                inputValue={ticketDestinationLookupInput}
                options={ticketDestinationPlaces}
                loading={ticketDestinationPlacesLoading}
                filterOptions={(opts) => opts}
                getOptionLabel={placeOptionLabel}
                isOptionEqualToValue={placeOptionEq}
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === "input" || reason === "clear") {
                    setTicketDestinationLookupInput(newInputValue);
                    void setFieldValue(
                      "jr_returnDestination",
                      newInputValue,
                    );
                  }
                }}
                onChange={(_, newValue) => {
                  const str =
                    typeof newValue === "string"
                      ? newValue
                      : newValue
                        ? newValue.name
                        : "";
                  void setFieldValue("jr_returnDestination", str);
                  setTicketDestinationLookupInput(str);
                }}
                noOptionsText="Not found"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Destination"
                    fullWidth
                    name="jr_returnDestination"
                    onBlur={handleBlur}
                    error={lookupFieldError(
                      Boolean(touched.jr_returnDestination),
                      errors.jr_returnDestination,
                      ticketDestinationPlacesError,
                    )}
                    helperText={lookupFieldHelper(
                      Boolean(touched.jr_returnDestination),
                      errors.jr_returnDestination,
                      ticketDestinationPlacesError,
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
        <Divider />

        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="SEAT PREFERENCE"
              required
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              name="jr_seatPreference1"
              value={values.jr_seatPreference1}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.jr_seatPreference1 &&
                Boolean(errors.jr_seatPreference1)
              }
              helperText={
                touched.jr_seatPreference1 && errors.jr_seatPreference1
                  ? errors.jr_seatPreference1
                  : " "
              }
            >
              <MenuItem value="aisle">Aisle</MenuItem>
              <MenuItem value="middle">Middle</MenuItem>
              <MenuItem value="no_preference">No Preference</MenuItem>
              <MenuItem value="exit_row">Exit Row</MenuItem>
              <MenuItem value="bulkhead">Bulkhead</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <TextField
              select
              fullWidth
              name="jr_seatPreference2"
              value={values.jr_seatPreference2}
              onChange={handleChange}
              onBlur={handleBlur}
              error={
                touched.jr_seatPreference2 &&
                Boolean(errors.jr_seatPreference2)
              }
              helperText={
                touched.jr_seatPreference2 && errors.jr_seatPreference2
                  ? errors.jr_seatPreference2
                  : " "
              }
            >
              <MenuItem value="window">Window</MenuItem>
              <MenuItem value="aisle">Aisle</MenuItem>
              <MenuItem value="middle">Middle</MenuItem>
              <MenuItem value="no_preference">No Preference</MenuItem>
              <MenuItem value="exit_row">Exit Row</MenuItem>
              <MenuItem value="bulkhead">Bulkhead</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Divider />

        <Grid
          container
          spacing={2}
          alignItems="flex-start"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="REMARKS"
              sx={{ fontSize: "12px", fontWeight: "bold" }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter additional requests..."
              name="jr_remarks"
              value={values.jr_remarks}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Typography className={styles.remarksHelper}>
              Please indicate the number of people needing a "Seat w /
              oversized baggage area" when booking multiple seats.
            </Typography>
            <Typography className={styles.remarksHelperTight}>
              If you have any request for arrangement, please fill in
              the remarks column. (within 1000 characters)
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default JrOfflineBookingForm;
