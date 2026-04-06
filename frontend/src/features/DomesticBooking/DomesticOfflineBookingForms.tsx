import React, { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  MenuItem,
  Divider,
  Autocomplete,
  Button,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import CustomInputLabel from "../../shared/components/CustomInputLabel";
import styles from "./views/styles/DomesticOfflineBookingForms.module.scss";

type OfflineItineraryProviderId =
  | "jr"
  | "flight"
  | "hotel"
  | "car"
  | "route"
  | "";

type Props = {
  activeProvider: OfflineItineraryProviderId;
};

const stationOptions = [
  "Tokyo",
  "Osaka",
  "Nagoya",
  "Kyoto",
  "Sapporo",
  "Fukuoka",
];

type JrTransportType = "rail" | "bus" | "ship";

const DomesticOfflineBookingForms: React.FC<Props> = ({ activeProvider }) => {
  const [jrTransportType, setJrTransportType] =
    useState<JrTransportType>("rail");

  return (
    <Box>
      {activeProvider === "" && (
        <Typography className={styles.emptyState} component="p">
          Select a service above to enter itinerary details.
        </Typography>
      )}

      {activeProvider === "flight" ||
        activeProvider === "car" ||
        activeProvider === "route" ? (
        <Typography className={styles.emptyState} component="p">
          This itinerary type is not available yet.
        </Typography>
      ) : null}

      {/* JR form  */}
      {activeProvider === "jr" && (
        // <Paper
        //   elevation={0}
        //   sx={{
        //     m: 2,
        //     // border: "1px solid #edf1f7",
        //     borderRadius: 2,
        //     overflow: "hidden",
        //     bgcolor: "#fff",
        //   }}
        // >  
        <Box className={styles.jrRoot}>
          <Box className={styles.jrNotice}>
            <FormControlLabel
              control={<Checkbox size="small" />}
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
                  className={styles.fieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9}>
                <RadioGroup
                  row
                  value={jrTransportType}
                  onChange={(_, value) =>
                    setJrTransportType(value as JrTransportType)
                  }
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
            {jrTransportType === "rail" && (
              <>
                {/* Rail form */}
                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel
                      label="DEPARTURE DATE"
                      required
                      className={styles.fieldLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={3.5}>
                    <TextField fullWidth type="date" />
                  </Grid>
                </Grid>
                <Divider />

                {/* Searchable ORIGIN / DESTINATION */}
                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel
                      label="ORIGIN / DESTINATION"
                      required
                      className={styles.fieldLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      freeSolo
                      options={stationOptions}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Origin" fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={1} className={styles.gridArrowCell}>
                    <ArrowForward className={styles.mutedArrow} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      freeSolo
                      options={stationOptions}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Destination"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Divider />

                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel
                      label="ORIGIN / DESTINATION TIME"
                      required
                      className={styles.fieldLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth defaultValue="09:00" type="time" />
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    <Typography className={styles.legLabel}>
                      DEPARTURE
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth defaultValue="17:00" type="time" />
                  </Grid>
                  <Grid item xs={12} md={1.5}>
                    <Typography className={styles.legLabel}>
                      ARRIVAL
                    </Typography>
                  </Grid>
                </Grid>
                <Divider />

                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel
                      label="TRAIN NAME / TRAIN NO."
                      className={styles.fieldLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <TextField fullWidth placeholder="Train Name" />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth placeholder="Train No." />
                  </Grid>
                </Grid>
                <Divider />

                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel label="SEATS" required className={styles.fieldLabel} />
                  </Grid>
                  <Grid item xs={12} md={4.5}>
                    <TextField select fullWidth defaultValue="">
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
                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel
                      label="ORIGIN / DESTINATION"
                      required
                      className={styles.fieldLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      freeSolo
                      options={stationOptions}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Origin" fullWidth />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={1} className={styles.gridArrowCell}>
                    <ArrowForward className={styles.mutedArrow} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      freeSolo
                      options={stationOptions}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Destination"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>
                <Divider />

                <Grid container spacing={2} alignItems="center" className={styles.formRow}>
                  <Grid item xs={12} md={3}>
                    <CustomInputLabel
                      label="SEAT PREFERENCE"
                      required
                      className={styles.fieldLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <TextField select fullWidth defaultValue="">
                      <MenuItem value="aisle">Aisle</MenuItem>
                      <MenuItem value="middle">Middle</MenuItem>
                      <MenuItem value="no_preference">No Preference</MenuItem>
                      <MenuItem value="exit_row">Exit Row</MenuItem>
                      <MenuItem value="bulkhead">Bulkhead</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2.5}>
                    <TextField select fullWidth defaultValue="">
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
                    <CustomInputLabel label="REMARKS" className={styles.fieldLabel} />
                  </Grid>

                  <Grid item xs={12} md={9}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Enter additional requests..."
                    />

                    <Typography className={styles.remarksHelper}>
                      Please indicate the number of people needing a "Seat w /
                      oversized baggage area" when booking multiple seats.
                    </Typography>
                    <Typography className={styles.remarksHelperTight}>
                      If you have any request for arrangement, please fill in the
                      remarks column. (within 1000 characters)
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}

            {(jrTransportType === "bus" || jrTransportType === "ship") && (
              <>
                {/* Bus / ship form (same layout; customize ship labels later if needed) */}
            <Grid container spacing={2} alignItems="center" className={styles.formRow}>
              <Grid item xs={12} md={3}>
                <CustomInputLabel
                  label="DEPARTURE DATE"
                  required
                  className={styles.fieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={3.5}>
                <TextField fullWidth type="date" />
              </Grid>
            </Grid>
            <Divider />

            {/* Searchable ORIGIN / DESTINATION */}
            <Grid container spacing={2} alignItems="center" className={styles.formRow}>
              <Grid item xs={12} md={3}>
                <CustomInputLabel
                  label="ORIGIN / DESTINATION"
                  required
                  className={styles.fieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  freeSolo
                  options={stationOptions}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Origin" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={1} className={styles.gridArrowCell}>
                <ArrowForward className={styles.mutedArrow} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  freeSolo
                  options={stationOptions}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Destination"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Divider />

            <Grid container spacing={2} alignItems="center" className={styles.formRow}>
              <Grid item xs={12} md={3}>
                <CustomInputLabel
                  label="ORIGIN / DESTINATION TIME"
                  required
                  className={styles.fieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth defaultValue="09:00" type="time" />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <Typography className={styles.legLabel}>
                  DEPARTURE
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth defaultValue="17:00" type="time" />
              </Grid>
              <Grid item xs={12} md={1.5}>
                <Typography className={styles.legLabel}>
                  ARRIVAL
                </Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2} alignItems="center" className={styles.formRow}>
              <Grid item xs={12} md={3}>
                <CustomInputLabel label="SEATS" required className={styles.fieldLabel} />
              </Grid>
              <Grid item xs={12} md={4.5}>
                <TextField select fullWidth defaultValue="">
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
            <Grid container spacing={2} alignItems="center" className={styles.formRow}>
              <Grid item xs={12} md={3}>
                <CustomInputLabel
                  label="SEAT PREFERENCE"
                  required
                  className={styles.fieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField select fullWidth defaultValue="">
                  <MenuItem value="aisle">Aisle</MenuItem>
                  <MenuItem value="middle">Middle</MenuItem>
                  <MenuItem value="no_preference">No Preference</MenuItem>
                  <MenuItem value="exit_row">Exit Row</MenuItem>
                  <MenuItem value="bulkhead">Bulkhead</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField select fullWidth defaultValue="">
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

            <Grid container spacing={2} alignItems="flex-start" className={styles.formRow}>
              <Grid item xs={12} md={3}>
                <CustomInputLabel label="REMARKS" className={styles.fieldLabel} />
              </Grid>

              <Grid item xs={12} md={9}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Enter additional requests..."
                />

                <Typography className={styles.remarksHelper}>
                  Please indicate the number of people needing a "Seat w /
                  oversized baggage area" when booking multiple seats.
                </Typography>
                <Typography className={styles.remarksHelperTight}>
                  If you have any request for arrangement, please fill in the
                  remarks column. (within 1000 characters)
                </Typography>
              </Grid>
            </Grid>
              </>
            )}
          </Box>
          {/* </Paper> */}
        </Box>
      )}

      {/* Hotel form */}

      {activeProvider === "hotel" && (
        <Paper elevation={0} className={styles.hotelPaper}>
          <Box className={styles.hotelInner}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={styles.hotelRow}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="CHECK-IN / CHECK-OUT"
                  required
                  className={styles.hotelFieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9.4}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item xs={12} md={2.7}>
                    <TextField fullWidth type="date" />
                  </Grid>
                  <Grid item xs="auto">
                    <Typography className={styles.dateTilde}>
                      ~
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2.7}>
                    <TextField fullWidth type="date" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={styles.hotelRow}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="ACCOMMODATION CITY"
                  required
                  className={styles.hotelFieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9.4}>
                <TextField
                  fullWidth
                  placeholder="e.g. Tokyo, Shinjuku-ku"
                  className={styles.hotelTextField}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={styles.hotelRow}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="ACCOMMODATION NAME"
                  className={styles.hotelFieldLabel}
                />
              </Grid>

              <Grid item xs={12} md={9.4}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} md={2.1}>
                    <FormControlLabel
                      control={<Radio size="small" defaultChecked />}
                      label="First Preference"
                      className={styles.hotelPreferenceLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={9.9}>
                    <TextField
                      fullWidth
                      placeholder="Hotel Name"
                      className={styles.hotelTextField}
                    />
                  </Grid>
                  <Grid item xs={12} md={2.1}>
                    <FormControlLabel
                      control={<Radio size="small" />}
                      label="Second Preference"
                      className={styles.hotelPreferenceLabel}
                    />
                  </Grid>
                  <Grid item xs={12} md={9.9}>
                    <TextField
                      fullWidth
                      placeholder="Hotel Name"
                      className={styles.hotelTextField}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={styles.hotelRow}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="BUDGET"
                  required
                  className={styles.hotelFieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9.4}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item>
                    <TextField
                      placeholder="Min Amount"
                      className={styles.budgetFieldMin}
                    />
                  </Grid>
                  <Grid item>
                    <Typography className={styles.budgetTilde}>
                      ~
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      placeholder="Max Amount"
                      className={styles.budgetFieldMax}
                    />
                  </Grid>
                  <Grid item>
                    <Typography className={styles.currencyYen}>
                      ¥
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={styles.hotelRow}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="ROOM CONDITIONS / AMENITIES"
                  required
                  className={styles.hotelFieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9.4}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item>
                    <TextField
                      select
                      defaultValue="nonSmoking"
                      className={styles.selectNarrow}
                    >
                      <MenuItem value="nonSmoking">Non-Smoking</MenuItem>
                      <MenuItem value="smoking">Smoking</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item>
                    <TextField
                      select
                      defaultValue="withBreakfast"
                      className={styles.selectNarrow}
                    >
                      <MenuItem value="withBreakfast">With Breakfast</MenuItem>
                      <MenuItem value="room-only">Room Only</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item></Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              className={styles.hotelRow}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="ROOM TYPE"
                  required
                  className={styles.hotelFieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9.4}>
                <Grid container spacing={1.5} alignItems="center">
                  <Grid item>
                    <TextField
                      select
                      defaultValue="1"
                      className={styles.selectRoomCount}
                    >
                      <MenuItem value="1">1</MenuItem>
                      <MenuItem value="2">2</MenuItem>
                      <MenuItem value="3">3</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item>
                    <Typography className={styles.roomCountSuffix}>
                      ROOM(S)
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      select
                      defaultValue="single"
                      className={styles.selectRoomType}
                    >
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="twin">Twin</MenuItem>
                      <MenuItem value="double">Double</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="flex-start"
              className={styles.hotelRowLast}
            >
              <Grid item xs={12} md={2.6}>
                <CustomInputLabel
                  label="REMARKS"
                  className={styles.hotelFieldLabel}
                />
              </Grid>
              <Grid item xs={12} md={9.4}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Enter additional requests..."
                  className={styles.hotelRemarksField}
                />
                <Typography className={styles.hotelRemarksHint}>
                  If you have any request for arrangement, please fill in the
                  remarks column. (within 1000 characters)
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box className={styles.hotelActions}>
            <Button variant="outlined" className={styles.buttonClear}>
              Clear
            </Button>
            <Button variant="contained" className={styles.buttonSubmit}>
              Add to Itinerary
            </Button>
          </Box>
        </Paper>
      )}

      {/* Car Form */}
    </Box>
  );
};

export default DomesticOfflineBookingForms;
