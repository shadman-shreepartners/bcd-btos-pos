import { useEffect, type ChangeEvent } from "react";
import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { InfoOutlined } from "@mui/icons-material";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import { getTodayLocalDateString } from "@/features/DomesticBooking/utils/todayDateString";
import {
  usePlaceLookup,
  type PlaceLookupItem,
} from "../../../hooks/usePlaceLookup";
import { useBookingStore } from "@/store/useBookingStore";
import styles from "../../styles/DomesticOfflineBookingForms.module.scss";
import type { JrOfflineBookingFormProps } from "./JrOfflineBookingForm";

const CITY_LOOKUP = "city" as const;

const placeOptionEq = (
  a: string | PlaceLookupItem,
  b: string | PlaceLookupItem,
) => {
  if (typeof a === "string" || typeof b === "string") return a === b;
  return a.id === b.id;
};

const placeOptionLabel = (option: string | PlaceLookupItem) => {
  if (typeof option === "string") return option;
  return option?.name ?? "";
};

const cityLookupFieldHelper = (
  touched: boolean,
  formikMsg: string | undefined,
  lookupErr: string | null,
) => {
  if (touched && formikMsg) return formikMsg;
  if (lookupErr) return lookupErr;
  return " ";
};

const cityLookupFieldError = (
  touched: boolean,
  formikMsg: string | undefined,
  lookupErr: string | null,
) => Boolean((touched && formikMsg) || lookupErr);

const budgetInputValue = (n: number | null) =>
  n === null || Number.isNaN(n) ? "" : String(n);

const hotelLookupHelper = (
  touched: boolean | undefined,
  formikMsg: string | undefined,
  lookupLoading: boolean,
  lookupHasData: boolean,
  lookupErr: string | null,
) => {
  if (lookupLoading && !lookupHasData) return "Loading options…";
  if (lookupErr) return lookupErr;
  return touched && formikMsg ? formikMsg : undefined;
};

const hotelLookupFieldError = (
  touched: boolean | undefined,
  formikMsg: string | undefined,
  lookupErr: string | null,
) => Boolean((touched && formikMsg) || lookupErr);

const HotelOfflineBookingForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}: JrOfflineBookingFormProps) => {
  const theme = useTheme();
  const labelSx = {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  } as const;

  const hotelAmenities = useBookingStore((s) => s.hotelAmenities);
  const {
    data: hotelLookupData,
    loading: hotelLookupLoading,
    error: hotelLookupError,
  } = hotelAmenities;
  const ensureHotelAmenities = useBookingStore((s) => s.ensureHotelAmenities);

  const {
    places: accommodationCityPlaces,
    loading: accommodationCityLoading,
    error: accommodationCityError,
  } = usePlaceLookup(values.accommodationCity, CITY_LOOKUP);

  useEffect(() => {
    void ensureHotelAmenities();
  }, [ensureHotelAmenities]);

  const smokingOptions = hotelLookupData?.smokingCondition ?? [];
  const mealPlanOptions = hotelLookupData?.mealPlanOptions ?? [];
  const numberOfRoomsOptions = hotelLookupData?.numberOfRoomsOptions ?? [];
  const bedTypeOptions = hotelLookupData?.bedTypeOptions ?? [];
  const hotelLookupReady = Boolean(hotelLookupData);
  const selectsDisabled = !hotelLookupReady;

  useEffect(() => {
    if (!hotelLookupData) return;

    const smoking = hotelLookupData.smokingCondition;
    const meals = hotelLookupData.mealPlanOptions;
    const rooms = hotelLookupData.numberOfRoomsOptions;
    const beds = hotelLookupData.bedTypeOptions;

    const smokeOk = smoking.some((x) => x.name === values.roomCondition);
    if (smoking.length && !smokeOk) {
      void setFieldValue("roomCondition", smoking[0].name);
    }

    const mealOk = meals.some((x) => x.name === values.amenities);
    if (meals.length && !mealOk) {
      void setFieldValue("amenities", meals[0].name);
    }

    const roomsOk = rooms.some((x) => x.id === values.roomCount);
    if (rooms.length && !roomsOk) {
      void setFieldValue("roomCount", rooms[0].id);
    }

    const bedOk = beds.includes(values.roomType);
    if (beds.length && !bedOk) {
      void setFieldValue("roomType", beds[0]);
    }
  }, [
    hotelLookupData,
    values.roomCondition,
    values.amenities,
    values.roomCount,
    values.roomType,
    setFieldValue,
  ]);

  const setBudget =
    (field: "budgetMin" | "budgetMax") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw.trim() === "") return void setFieldValue(field, null);
      const n = Number.parseInt(raw, 10);
      void setFieldValue(field, Number.isFinite(n) && n >= 0 ? n : null);
    };

  return (
    <Box className={styles.jrRoot}>
      <Box className={styles.jrFormSection}>
        <Grid
          container
          spacing={2}
          alignItems="flex-start"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="CHECK-IN / CHECK-OUT"
              required
              sx={labelSx}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <Typography
                  className={styles.legLabel}
                  component="label"
                  htmlFor="checkIn"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  CHECK-IN
                </Typography>
                <TextField
                  id="checkIn"
                  fullWidth
                  type="date"
                  name="checkIn"
                  value={values.checkIn}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.hotelTextField}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getTodayLocalDateString() }}
                  error={Boolean(touched.checkIn && errors.checkIn)}
                  helperText={
                    touched.checkIn && errors.checkIn ? errors.checkIn : undefined
                  }
                />
              </Grid>
              <Grid item xs={12} sm={1} className={styles.gridArrowCell}>
                <Typography className={styles.dateTilde} component="span">
                  ~
                </Typography>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Typography
                  className={styles.legLabel}
                  component="label"
                  htmlFor="checkOut"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  CHECK-OUT
                </Typography>
                <TextField
                  id="checkOut"
                  fullWidth
                  type="date"
                  name="checkOut"
                  value={values.checkOut}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={styles.hotelTextField}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: getTodayLocalDateString() }}
                  error={Boolean(touched.checkOut && errors.checkOut)}
                  helperText={
                    touched.checkOut && errors.checkOut
                      ? errors.checkOut
                      : undefined
                  }
                />
              </Grid>
            </Grid>
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
              label="ACCOMMODATION CITY"
              required
              sx={labelSx}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Autocomplete<PlaceLookupItem, false, false, true>
              freeSolo
              value={values.accommodationCity}
              inputValue={values.accommodationCity}
              options={accommodationCityPlaces}
              loading={accommodationCityLoading}
              filterOptions={(opts) => opts}
              getOptionLabel={placeOptionLabel}
              isOptionEqualToValue={placeOptionEq}
              onInputChange={(_, newInputValue, reason) => {
                if (reason === "input" || reason === "clear")
                  void setFieldValue("accommodationCity", newInputValue);
              }}
              onChange={(_, newValue) => {
                const str =
                  typeof newValue === "string"
                    ? newValue
                    : newValue
                      ? newValue.name
                      : "";
                void setFieldValue("accommodationCity", str);
              }}
              noOptionsText="Not found"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Enter City"
                  fullWidth
                  name="accommodationCity"
                  className={styles.hotelTextField}
                  onBlur={handleBlur}
                  error={cityLookupFieldError(
                    Boolean(touched.accommodationCity),
                    errors.accommodationCity,
                    accommodationCityError,
                  )}
                  helperText={cityLookupFieldHelper(
                    Boolean(touched.accommodationCity),
                    errors.accommodationCity,
                    accommodationCityError,
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
          alignItems="flex-start"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel label="ACCOMMODATION NAME" sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
              >
                <Typography
                  component="label"
                  htmlFor="firstPreference"
                  variant="body2"
                  sx={{
                    minWidth: { sm: 140 },
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  First preference
                </Typography>
                <TextField
                  id="firstPreference"
                  fullWidth
                  name="firstPreference"
                  value={values.firstPreference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Hotel Name"
                  className={styles.hotelTextField}
                  error={Boolean(
                    touched.firstPreference && errors.firstPreference,
                  )}
                  helperText={
                    touched.firstPreference && errors.firstPreference
                      ? errors.firstPreference
                      : undefined
                  }
                />
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
              >
                <Typography
                  component="label"
                  htmlFor="secondPreference"
                  variant="body2"
                  sx={{
                    minWidth: { sm: 140 },
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  Second preference
                </Typography>
                <TextField
                  id="secondPreference"
                  fullWidth
                  name="secondPreference"
                  value={values.secondPreference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Hotel Name"
                  className={styles.hotelTextField}
                  error={Boolean(
                    touched.secondPreference && errors.secondPreference,
                  )}
                  helperText={
                    touched.secondPreference && errors.secondPreference
                      ? errors.secondPreference
                      : undefined
                  }
                />
              </Stack>
            </Stack>
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
            <CustomInputLabel label="BUDGET" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                name="budgetMin"
                value={budgetInputValue(values.budgetMin)}
                onChange={setBudget("budgetMin")}
                onBlur={handleBlur}
                placeholder="Min Amount"
                className={styles.budgetFieldMin}
                error={Boolean(touched.budgetMin && errors.budgetMin)}
                helperText={
                  touched.budgetMin && errors.budgetMin
                    ? errors.budgetMin
                    : undefined
                }
              />
              <Typography className={styles.budgetTilde} component="span">
                ~
              </Typography>
              <TextField
                name="budgetMax"
                value={budgetInputValue(values.budgetMax)}
                onChange={setBudget("budgetMax")}
                onBlur={handleBlur}
                placeholder="Max Amount"
                className={styles.budgetFieldMax}
                error={Boolean(touched.budgetMax && errors.budgetMax)}
                helperText={
                  touched.budgetMax && errors.budgetMax
                    ? errors.budgetMax
                    : undefined
                }
              />
              <Typography
                className={styles.currencyYen}
                component="span"
                aria-hidden
              >
                ¥
              </Typography>
            </Stack>
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
              label="ROOM CONDITIONS / AMENITIES"
              required
              sx={labelSx}
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                select
                name="roomCondition"
                value={values.roomCondition}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={selectsDisabled}
                className={styles.selectNarrow}
                error={hotelLookupFieldError(
                  touched.roomCondition,
                  errors.roomCondition,
                  hotelLookupError,
                )}
                helperText={hotelLookupHelper(
                  touched.roomCondition,
                  errors.roomCondition,
                  hotelLookupLoading,
                  hotelLookupReady,
                  hotelLookupError,
                )}
              >
                {smokingOptions.map((o) => (
                  <MenuItem key={o.id} value={o.name}>
                    {o.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="amenities"
                value={values.amenities}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={selectsDisabled}
                className={styles.selectNarrow}
                error={Boolean(touched.amenities && errors.amenities)}
                helperText={
                  touched.amenities && errors.amenities
                    ? errors.amenities
                    : undefined
                }
              >
                {mealPlanOptions.map((o) => (
                  <MenuItem key={o.id} value={o.name}>
                    {o.name}
                  </MenuItem>
                ))}
              </TextField>
              <IconButton
                size="small"
                aria-label="Room conditions and amenities information"
                edge="end"
              >
                <InfoOutlined
                  fontSize="small"
                  sx={{ color: "action.active" }}
                />
              </IconButton>
            </Stack>
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
            <CustomInputLabel label="ROOM TYPE" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
            >
              <TextField
                select
                name="roomCount"
                value={String(values.roomCount)}
                onChange={(e) =>
                  void setFieldValue(
                    "roomCount",
                    Math.max(
                      1,
                      Number.parseInt(String(e.target.value), 10) || 1,
                    ),
                  )
                }
                onBlur={handleBlur}
                disabled={selectsDisabled}
                className={styles.selectRoomCount}
                error={Boolean(touched.roomCount && errors.roomCount)}
                helperText={
                  touched.roomCount && errors.roomCount
                    ? errors.roomCount
                    : undefined
                }
              >
                {numberOfRoomsOptions.map((o) => (
                  <MenuItem key={o.id} value={String(o.id)}>
                    {o.id}
                  </MenuItem>
                ))}
              </TextField>
              <Typography className={styles.roomCountSuffix} component="span">
                ROOM(S)
              </Typography>
              <TextField
                select
                name="roomType"
                value={values.roomType}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={selectsDisabled}
                className={styles.selectRoomType}
                error={Boolean(touched.roomType && errors.roomType)}
                helperText={
                  touched.roomType && errors.roomType
                    ? errors.roomType
                    : undefined
                }
              >
                {bedTypeOptions.map((label) => (
                  <MenuItem key={label} value={label}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
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
            <CustomInputLabel label="REMARKS" sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              name="remarks"
              value={values.remarks}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter additional requests..."
              className={styles.hotelRemarksField}
              error={Boolean(touched.remarks && errors.remarks)}
              helperText={
                touched.remarks && errors.remarks ? errors.remarks : undefined
              }
            />
            <Typography className={styles.hotelRemarksHint} component="p">
              If you have any request for arrangement, please fill in the
              remarks column. (within 1000 characters)
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default HotelOfflineBookingForm;
