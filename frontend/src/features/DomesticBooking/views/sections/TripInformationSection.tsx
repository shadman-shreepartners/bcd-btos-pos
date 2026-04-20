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
import { Info } from "lucide-react";
import { useFormikContext } from "formik";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import type { DomesticBookingFormValues } from "../../domesticBookingTypes";
import {
  meetingNumberSelectProps,
  selectWithPlaceholder,
  TRIP_PURPOSE_CATEGORY_OPTIONS,
  MEETING_NUMBER_OPTIONS,
} from "../domesticBookingConstants";
import SectionCardHeader from "../components/SectionCardHeader";
const TripInformationSection = () => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    useFormikContext<DomesticBookingFormValues>();

  return (
    <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
      <SectionCardHeader icon={Info} title="TRIP INFORMATION" />
      <Grid container spacing={2} sx={{ p: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Stack spacing={1}>
            <CustomInputLabel
              label="APPLICANT"
              sx={{ fontSize: "12px", fontWeight: "bold" }}
              required
            />
            <RadioGroup
              name="applicant"
              row
              sx={{ gap: 2 }}
              value={values.applicant}
              onChange={(_, value) =>
                setFieldValue(
                  "applicant",
                  value as DomesticBookingFormValues["applicant"],
                )
              }
            >
              <FormControlLabel
                value="traveller"
                control={<Radio />}
                label="Traveler"
              />
              <FormControlLabel
                value="travel-arranger"
                control={<Radio />}
                label="Travel Arranger"
              />
            </RadioGroup>
          </Stack>
        </Grid>
      </Grid>
      {values.applicant === "traveller" ? (
        <Grid container spacing={2} sx={{ p: 3, pt: 0 }}>
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
                id="meeting_number"
                name="meeting_number"
                value={values.meeting_number || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.meeting_number && Boolean(errors.meeting_number)}
                helperText={
                  touched.meeting_number && errors.meeting_number
                    ? errors.meeting_number
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
                id="travell_type"
                name="travell_type"
                value={values.travell_type || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.travell_type && Boolean(errors.travell_type)}
                helperText={
                  touched.travell_type && errors.travell_type
                    ? errors.travell_type
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
    </Paper>
  );
};

export default TripInformationSection;
