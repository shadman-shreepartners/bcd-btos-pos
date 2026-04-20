import {
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import { Users } from "lucide-react";
import { useFormikContext } from "formik";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import type { DomesticBookingFormValues } from "../../domesticBookingTypes";
import SectionCardHeader from "../components/SectionCardHeader";
import ExistingTravelerSearch from "../ExistingTravelerSearch";
import {
  GENDER_OPTIONS,
  MEETING_NUMBER_OPTIONS,
  TRAVELL_TYPE_OPTIONS,
  TRIP_PURPOSE_CATEGORY_OPTIONS,
  meetingNumberSelectProps,
  selectWithPlaceholder,
} from "../domesticBookingConstants";

const TravellInformationSection = () => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    useFormikContext<DomesticBookingFormValues>();
  if (values.applicant !== "travel-arranger") return null;
  return (
    <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
      <SectionCardHeader icon={Users} title="TRAVELL INFORMATION" />
      <Grid container spacing={2} sx={{ px: 3, pt: 3, pb: 0 }}>
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          sx={{ bgcolor: "var(--page)", borderRadius: 1 }}
        >
          <Stack spacing={1}>
            <RadioGroup
              name="travellerSource"
              row
              sx={{ gap: 2 }}
              value={values.travellerSource}
              onChange={(_, value) => {
                const src =
                  value as DomesticBookingFormValues["travellerSource"];
                setFieldValue("travellerSource", src);
                if (src === "guest") setFieldValue("existingTravelers", []);
              }}
            >
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label="Existing Traveler"
              />
              <FormControlLabel
                value="guest"
                control={<Radio />}
                label="Guest Traveler"
              />
            </RadioGroup>
          </Stack>
        </Grid>
        {values.travellerSource === "existing" ? (
          <Grid item xs={12} sx={{ py: 3 }}>
            <ExistingTravelerSearch />
          </Grid>
        ) : null}
      </Grid>
      {values.travellerSource === "existing" ? (
        <Grid container spacing={2} sx={{ px: 3, pb: 3, pt: 0 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="MEETING NUMBER"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <TextField
                select
                fullWidth
                variant="outlined"
                id="meeting_number_existing"
                name="meeting_number_existing"
                value={values.meeting_number_existing || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.meeting_number_existing &&
                  Boolean(errors.meeting_number_existing)
                }
                helperText={
                  touched.meeting_number_existing &&
                  errors.meeting_number_existing
                    ? errors.meeting_number_existing
                    : " "
                }
                SelectProps={meetingNumberSelectProps("Select meeting")}
              >
                {MEETING_NUMBER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="TRIP PURPOSE"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <TextField
                select
                fullWidth
                variant="outlined"
                id="trip_purpose_existing"
                name="trip_purpose_existing"
                value={values.trip_purpose_existing || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.trip_purpose_existing &&
                  Boolean(errors.trip_purpose_existing)
                }
                helperText={
                  touched.trip_purpose_existing && errors.trip_purpose_existing
                    ? errors.trip_purpose_existing
                    : " "
                }
                SelectProps={selectWithPlaceholder(
                  TRIP_PURPOSE_CATEGORY_OPTIONS,
                  "Select trip purpose",
                )}
              >
                {TRIP_PURPOSE_CATEGORY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Grid>
        </Grid>
      ) : null}
      {values.travellerSource === "guest" ? (
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="FULL NAME (JAPANESE)"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <Grid container spacing={0.5}>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="last_name"
                    name="last_name"
                    placeholder="Last Name"
                    value={values.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.last_name && Boolean(errors.last_name)}
                    helperText={
                      touched.last_name && errors.last_name
                        ? errors.last_name
                        : " "
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="first_name"
                    name="first_name"
                    placeholder="First Name"
                    value={values.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.first_name && Boolean(errors.first_name)}
                    helperText={
                      touched.first_name && errors.first_name
                        ? errors.first_name
                        : " "
                    }
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="FULL NAME (AS PER PASSPORT)"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <Grid container spacing={0.5}>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="last_name_eng"
                    name="last_name_eng"
                    placeholder="Last Name"
                    value={values.last_name_eng}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.last_name_eng && Boolean(errors.last_name_eng)
                    }
                    helperText={
                      touched.last_name_eng && errors.last_name_eng
                        ? errors.last_name_eng
                        : " "
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={
                      touched.firstName && errors.firstName
                        ? errors.firstName
                        : " "
                    }
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <CustomInputLabel
                    label="GENDER"
                    sx={{ fontSize: "12px", fontWeight: "bold" }}
                    required
                  />
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    id="gender"
                    name="gender"
                    value={values.gender || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.gender && Boolean(errors.gender)}
                    helperText={
                      touched.gender && errors.gender ? errors.gender : " "
                    }
                    SelectProps={selectWithPlaceholder(
                      GENDER_OPTIONS,
                      "Select gender",
                    )}
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <CustomInputLabel
                    label="TRAVELLER TYPE"
                    sx={{ fontSize: "12px", fontWeight: "bold" }}
                    required
                  />
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    id="travell_type_guest"
                    name="travell_type_guest"
                    value={values.travell_type_guest || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.travell_type_guest &&
                      Boolean(errors.travell_type_guest)
                    }
                    helperText={
                      touched.travell_type_guest && errors.travell_type_guest
                        ? errors.travell_type_guest
                        : " "
                    }
                    SelectProps={selectWithPlaceholder(
                      TRAVELL_TYPE_OPTIONS,
                      "Select type",
                    )}
                  >
                    {TRAVELL_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <CustomInputLabel
                    label="MEETING NUMBER"
                    sx={{ fontSize: "12px", fontWeight: "bold" }}
                    required
                  />
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    id="meeting_number_guest"
                    name="meeting_number_guest"
                    value={values.meeting_number_guest || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.meeting_number_guest &&
                      Boolean(errors.meeting_number_guest)
                    }
                    helperText={
                      touched.meeting_number_guest &&
                      errors.meeting_number_guest
                        ? errors.meeting_number_guest
                        : " "
                    }
                    SelectProps={meetingNumberSelectProps("Select meeting")}
                  >
                    {MEETING_NUMBER_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <CustomInputLabel
                    label="TRIP PURPOSE"
                    sx={{ fontSize: "12px", fontWeight: "bold" }}
                    required
                  />
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    id="trip_purpose"
                    name="trip_purpose"
                    value={values.trip_purpose || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.trip_purpose && Boolean(errors.trip_purpose)}
                    helperText={
                      touched.trip_purpose && errors.trip_purpose
                        ? errors.trip_purpose
                        : " "
                    }
                    SelectProps={selectWithPlaceholder(
                      TRIP_PURPOSE_CATEGORY_OPTIONS,
                      "Select trip purpose",
                    )}
                  >
                    {TRIP_PURPOSE_CATEGORY_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : null}
    </Paper>
  );
};

export default TravellInformationSection;
