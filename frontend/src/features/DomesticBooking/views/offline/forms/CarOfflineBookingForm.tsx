import { useEffect, useMemo } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import { getTodayLocalDateString } from "@/features/DomesticBooking/utils/todayDateString";
import {
  usePlaceLookup,
  type PlaceLookupItem,
} from "../../../hooks/usePlaceLookup";
import styles from "../../styles/DomesticOfflineBookingForms.module.scss";
import type { JrOfflineBookingFormProps } from "./JrOfflineBookingForm";
import {
  CAR_COUNT_OPTIONS,
  CAR_RENTAL_COMPANY_OPTIONS,
  CAR_SIZE_OPTIONS,
} from "./carBookingOptions";

export type CarOfflineBookingFormProps = JrOfflineBookingFormProps & {
  driverOptions: string[];
};

const CITY_LOOKUP = "city" as const;

const labelSx = { fontSize: "12px", fontWeight: "bold" } as const;

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

const CityFieldHint = () => (
  <Typography className={styles.remarksHelper} sx={{ display: "block", mt: 1 }}>
    If you have decided on a business office name, please enter it, above.
  </Typography>
);

const CarOfflineBookingForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
  driverOptions,
}: CarOfflineBookingFormProps) => {
  const {
    places: rentalPlaces,
    loading: rentalPlacesLoading,
    error: rentalPlacesError,
  } = usePlaceLookup(values.car_rentalCity, CITY_LOOKUP);
  const {
    places: returnPlaces,
    loading: returnPlacesLoading,
    error: returnPlacesError,
  } = usePlaceLookup(values.car_returnCity, CITY_LOOKUP);

  const effectiveDriverOptions = useMemo(() => {
    const next = new Set(driverOptions);
    const cur = values.car_driver?.trim();
    if (cur) next.add(cur);
    return [...next];
  }, [driverOptions, values.car_driver]);

  useEffect(() => {
    const first = effectiveDriverOptions[0];
    if (!first) return;
    if (values.car_driver?.trim()) return;
    void setFieldValue("car_driver", first);
  }, [effectiveDriverOptions, values.car_driver, setFieldValue]);

  return (
    <Box className={styles.carPaper}>
      <Box className={styles.carSection}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          className={styles.formRow}
        >
          <Grid item xs={12} md={3}>
            <CustomInputLabel
              label="RENTAL DATE / TIME"
              required
              sx={labelSx}
            />
          </Grid>
          <Grid item xs={12} md={4.5}>
            <TextField
              fullWidth
              type="date"
              name="car_rentalDate"
              value={values.car_rentalDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.car_rentalDate && Boolean(errors.car_rentalDate)}
              helperText={
                touched.car_rentalDate && errors.car_rentalDate
                  ? errors.car_rentalDate
                  : " "
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4.5}>
            <TextField
              fullWidth
              type="time"
              name="car_rentalTime"
              value={values.car_rentalTime}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.car_rentalTime && Boolean(errors.car_rentalTime)}
              helperText={
                touched.car_rentalTime && errors.car_rentalTime
                  ? errors.car_rentalTime
                  : " "
              }
              InputLabelProps={{ shrink: true }}
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
            <CustomInputLabel label="RENTAL CITY" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Autocomplete<PlaceLookupItem, false, false, true>
              freeSolo
              value={values.car_rentalCity}
              inputValue={values.car_rentalCity}
              options={rentalPlaces}
              loading={rentalPlacesLoading}
              filterOptions={(opts) => opts}
              getOptionLabel={placeOptionLabel}
              isOptionEqualToValue={placeOptionEq}
              onInputChange={(_, newInputValue, reason) => {
                if (reason === "input" || reason === "clear")
                  void setFieldValue("car_rentalCity", newInputValue);
              }}
              onChange={(_, newValue) => {
                const str =
                  typeof newValue === "string"
                    ? newValue
                    : newValue
                      ? newValue.name
                      : "";
                void setFieldValue("car_rentalCity", str);
              }}
              noOptionsText="Not found"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Enter City"
                  fullWidth
                  name="car_rentalCity"
                  onBlur={handleBlur}
                  error={lookupFieldError(
                    Boolean(touched.car_rentalCity),
                    errors.car_rentalCity,
                    rentalPlacesError,
                  )}
                  helperText={lookupFieldHelper(
                    Boolean(touched.car_rentalCity),
                    errors.car_rentalCity,
                    rentalPlacesError,
                  )}
                />
              )}
            />
            <CityFieldHint />
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
              label="RETURN DATE / TIME"
              required
              sx={labelSx}
            />
          </Grid>
          <Grid item xs={12} md={4.5}>
            <TextField
              fullWidth
              type="date"
              name="car_returnDate"
              value={values.car_returnDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.car_returnDate && Boolean(errors.car_returnDate)}
              helperText={
                touched.car_returnDate && errors.car_returnDate
                  ? errors.car_returnDate
                  : " "
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: getTodayLocalDateString() }}
            />
          </Grid>
          <Grid item xs={12} md={4.5}>
            <TextField
              fullWidth
              type="time"
              name="car_returnTime"
              value={values.car_returnTime}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.car_returnTime && Boolean(errors.car_returnTime)}
              helperText={
                touched.car_returnTime && errors.car_returnTime
                  ? errors.car_returnTime
                  : " "
              }
              InputLabelProps={{ shrink: true }}
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
            <CustomInputLabel label="RETURN CITY" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "flex-start" }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Autocomplete<PlaceLookupItem, false, false, true>
                  freeSolo
                  value={values.car_returnCity}
                  inputValue={values.car_returnCity}
                  options={returnPlaces}
                  loading={returnPlacesLoading}
                  filterOptions={(opts) => opts}
                  getOptionLabel={placeOptionLabel}
                  isOptionEqualToValue={placeOptionEq}
                  onInputChange={(_, newInputValue, reason) => {
                    if (reason === "input" || reason === "clear")
                      void setFieldValue("car_returnCity", newInputValue);
                  }}
                  onChange={(_, newValue) => {
                    const str =
                      typeof newValue === "string"
                        ? newValue
                        : newValue
                          ? newValue.name
                          : "";
                    void setFieldValue("car_returnCity", str);
                  }}
                  noOptionsText="Not found"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter City"
                      fullWidth
                      name="car_returnCity"
                      onBlur={handleBlur}
                      error={lookupFieldError(
                        Boolean(touched.car_returnCity),
                        errors.car_returnCity,
                        returnPlacesError,
                      )}
                      helperText={lookupFieldHelper(
                        Boolean(touched.car_returnCity),
                        errors.car_returnCity,
                        returnPlacesError,
                      )}
                    />
                  )}
                />
              </Box>
              <Button
                type="button"
                variant="outlined"
                size="medium"
                sx={{
                  height: 56,
                  flexShrink: 0,
                  textTransform: "none",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  borderColor: "#e4ebf5",
                  color: "#5f728c",
                }}
                onClick={() => void setFieldValue("car_returnCity", values.car_rentalCity)}
              >
                Same as Pick-up Location
              </Button>
            </Stack>
            <CityFieldHint />
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
            <CustomInputLabel label="NO. OF CARS" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              select
              className={styles.selectNarrow}
              name="car_numberOfCars"
              value={values.car_numberOfCars}
              onChange={(e) =>
                void setFieldValue("car_numberOfCars", Number(e.target.value))
              }
              onBlur={handleBlur}
              error={
                touched.car_numberOfCars && Boolean(errors.car_numberOfCars)
              }
              helperText={
                touched.car_numberOfCars && errors.car_numberOfCars
                  ? errors.car_numberOfCars
                  : " "
              }
            >
              {CAR_COUNT_OPTIONS.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
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
            <CustomInputLabel label="RENTAL CAR COMPANY" sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              select
              fullWidth
              name="car_rentalCarCompany"
              value={values.car_rentalCarCompany}
              onChange={handleChange}
              onBlur={handleBlur}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">
                <em>Select One</em>
              </MenuItem>
              {CAR_RENTAL_COMPANY_OPTIONS.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
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
            <CustomInputLabel label="CAR SIZE" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              select
              fullWidth
              name="car_carSize"
              value={values.car_carSize}
              onChange={handleChange}
              onBlur={handleBlur}
              SelectProps={{ displayEmpty: true }}
              error={touched.car_carSize && Boolean(errors.car_carSize)}
              helperText={
                touched.car_carSize && errors.car_carSize
                  ? errors.car_carSize
                  : " "
              }
            >
              <MenuItem value="">
                <em>Select One</em>
              </MenuItem>
              {CAR_SIZE_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
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
            <CustomInputLabel label="DRIVER" required sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              select
              className={styles.selectNarrow}
              name="car_driver"
              value={values.car_driver}
              onChange={handleChange}
              onBlur={handleBlur}
              SelectProps={{ displayEmpty: true }}
              error={touched.car_driver && Boolean(errors.car_driver)}
              helperText={
                touched.car_driver && errors.car_driver
                  ? errors.car_driver
                  : " "
              }
            >
              <MenuItem value="">
                <em>Select Driver</em>
              </MenuItem>
              {effectiveDriverOptions.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
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
            <CustomInputLabel label="REMARKS" sx={labelSx} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Enter additional requests..."
              name="car_remarks"
              value={values.car_remarks}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.car_remarks && Boolean(errors.car_remarks)}
              helperText={
                touched.car_remarks && errors.car_remarks
                  ? errors.car_remarks
                  : " "
              }
            />
            <Typography className={styles.remarksHelperTight}>
              If you have any request for arrangement, please fill in the
              remarks column. (within 1000 characters)
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CarOfflineBookingForm;
