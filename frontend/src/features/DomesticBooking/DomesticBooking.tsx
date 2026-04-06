import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Button,
} from "@mui/material";
import {
  Building2,
  Info,
  Star,
  UserPlus,
  Users,
  Train,
  Plane,
  Map,
  type LucideIcon,
  Building,
  Car,
  MapPin,
} from "lucide-react";
import Grid from "@mui/material/Grid";
import styles from "./views/styles/DomesticBooking.module.scss";
import CustomInputLabel from "../../shared/components/CustomInputLabel";
import type { DomesticData } from "./index";
import { useEffect, useState } from "react";
import ServiceCard from "../../shared/components/ServiceCard";
import DomesticOfflineBookingForms from "./DomesticOfflineBookingForms";
import ExistingTravelerSearch from "./ExistingTravelerSearch";
import { getJalSsoForm, redirectToJal } from "../../services/jalSso";
type ItineraryProviderId =
  | "jr-express"
  | "jal-online"
  | "ana-biz"
  | "star-flyer"
  | "rakuten"
  | "jalan"
  | "";
const ITINERARY_PROVIDERS: ReadonlyArray<{
  id: Exclude<ItineraryProviderId, "">;
  title: string;
  category: string;
  icon: LucideIcon;
  iconColor: string;
}> = [
  {
    id: "jr-express",
    title: "JR Express",
    category: "RAILWAY",
    icon: Train,
    iconColor: "#2563eb",
  },
  {
    id: "jal-online",
    title: "JAL Online",
    category: "FLIGHT",
    icon: Plane,
    iconColor: "#dc2626",
  },
  {
    id: "ana-biz",
    title: "ANA Biz",
    category: "CORPORATE",
    icon: Plane,
    iconColor: "#1d4ed8",
  },
  {
    id: "star-flyer",
    title: "Star Flyer",
    category: "SFJ",
    icon: Star,
    iconColor: "#111827",
  },
  {
    id: "rakuten",
    title: "Rakuten",
    category: "HOTEL",
    icon: Building2,
    iconColor: "#2563eb",
  },
  {
    id: "jalan",
    title: "Jalan",
    category: "PORTAL",
    icon: Map,
    iconColor: "#16a34a",
  },
];
type ItineraryProviderOfflineId = "jr" | "flight" | "hotel" | "car" | "route" | "";

const ITINERARY_PROVIDERS_OFFLINE: ReadonlyArray<{
  id: Exclude<ItineraryProviderOfflineId, "">;
  title: string;
  category: string;
  icon: LucideIcon;
  iconColor: string;
}> = [
  {
    id: "jr",
    title: "JR",
    category: "RAILWAY",
    icon: Train,
    iconColor: "#2563eb",
  },
  {
    id: "flight",
    title: "Flight",
    category: "AIR TRAVEL",
    icon: Plane,
    iconColor: "#dc2626",
  },
  {
    id: "hotel",
    title: "Hotel",
    category: "LODGING",
    icon: Building,
    iconColor: "#2563eb",
  },
  {
    id: "car",
    title: "Car",
    category: "RENTAL",
    icon: Car,
    iconColor: "#16a34a",
  },
    {
    id: "route",
    title: "Route",
    category: "NAVI",
    icon: MapPin,
    iconColor: "#2563eb",
  },
];
type DomesticBookingProps = Readonly<{
  initialData: DomesticData;
  onSubmit: () => void;
  onDataChange: (data: DomesticData) => void;
}>;
function DomesticBooking({
  initialData,
  onSubmit,
  onDataChange,
}: DomesticBookingProps) {
  console.log(
    "Initial Data:",
    initialData,
    "onSubmit:",
    onSubmit,
    "onDataChange:",
    onDataChange,
  );
  const [formValues, setFormValues] = useState<DomesticData>(initialData);
  const [activeTab, setActiveTab] = useState(0);
  const [onlineItineraryProvider, setOnlineItineraryProvider] =
    useState<ItineraryProviderId>("");
  const [offlineItineraryProvider, setOfflineItineraryProvider] =
    useState<ItineraryProviderOfflineId>("");
  const [travellerSource, setTravellerSource] = useState<"existing" | "guest">(
    "existing",
  );
  const [applicantRole, setApplicantRole] = useState<
    "traveller" | "travel-arranger"
  >("traveller");
  const [jalLoading, setJalLoading] = useState(false);
  const [jalError, setJalError] = useState<string | null>(null);

  const handleBookJal = async () => {
    setJalError(null);
    setJalLoading(true);
    try {
      const ssoData = await getJalSsoForm("XC0050870", "M5555J260300050");
      redirectToJal(ssoData);
    } catch (e) {
      setJalError(e instanceof Error ? e.message : "JAL SSO failed");
    } finally {
      setJalLoading(false);
    }
  };

  useEffect(() => {
    setFormValues(initialData);
  }, [initialData]);

  const onNextClick = () => {
    onDataChange({ ...formValues, step: 1 });
    onSubmit(); // move to step 2
  };
  return (
    <Box component="form">
      {/* Trip Info   */}
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <Info
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            TRIP INFORMATION
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          {/* Applicant  */}
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
                value={applicantRole}
                onChange={(_, value) =>
                  setApplicantRole(value as "traveller" | "travel-arranger")
                }
              >
                <FormControlLabel
                  value="traveller"
                  control={<Radio />}
                  label="Traveller"
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

        {applicantRole === "traveller" ? (
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
                  id="meeting_number"
                  name="meeting_number"
                  defaultValue=""
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) =>
                      v === "" ? <span style={{ color: "#aaa" }}>Required the attendee for Medical APAC Sales Meeting</span> : String(v),
                  }}
                >
                  <MenuItem value="inter">0001</MenuItem>
                  <MenuItem value="exter">0002</MenuItem>
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
                  id="travell_type"
                  name="travell_type"
                  defaultValue=""
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) =>
                      v === "" ? <span style={{ color: "#aaa" }}>Enter your trip purpose</span> : String(v),
                  }}
                >
                  <MenuItem value="inter">INTER</MenuItem>
                  <MenuItem value="exter">EXTER</MenuItem>
                </TextField>
              </Stack>
            </Grid>
          </Grid>
        ) : null}
      </Paper>

      {/* Applicant Info   */}
      {applicantRole === "travel-arranger" ? (
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <UserPlus
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            APPLICATION INFORMATION
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          {/* PAN Number - first row, left side */}
          <Grid item xs={12} sm={6} md={6}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="APPLICANT NAME"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <TextField
                fullWidth
                id="applicant_name"
                name="applicant_name"
                type="text"
                placeholder="Enter Applicant"
                // value={formik.values.pan_no}
                // disabled={loading}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="CONTACT NUMBER"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <TextField
                fullWidth
                id="contact_no"
                name="contact_no"
                type="text"
                placeholder="Enter number"
                // value={formik.values.pan_no}
                // disabled={loading}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={12}>
            <Stack spacing={1}>
              <CustomInputLabel
                label="APPLICANT EMAIL"
                sx={{ fontSize: "12px", fontWeight: "bold" }}
                required
              />
              <TextField
                fullWidth
                id="applicant_email"
                name="applicant_email"
                placeholder="Enter number"
                type="email"
                // value={formik.values.pan_no}
                // disabled={loading}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      ) : null}

      {/* Traveller Info   */}

      {applicantRole === "travel-arranger" ? (
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <Users
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            TRAVELL INFORMATION
          </Typography>
        </Box>
        {/* Existing traveller or New traveller radio button  */}
        <Grid container spacing={2} sx={{ px: 3, pt: 3, pb: 0 }}>
          <Grid item xs={12} sm={6} md={6} sx={{bgcolor: "var(--page)", borderRadius: 1}}>
            <Stack spacing={1}>
              <RadioGroup
                name="traveller-info"
                row
                sx={{ gap: 2 }}
                value={travellerSource}
                onChange={(_, value) =>
                  setTravellerSource(value as "existing" | "guest")
                }
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
          {travellerSource === "existing" ? (
            <Grid item xs={12} sx={{ py: 3 }}>
              <ExistingTravelerSearch />
            </Grid>
          ) : null}
        </Grid>
        {travellerSource === "existing" ? (
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
                  id="meeting_number_existing"
                  name="meeting_number_existing"
                  defaultValue=""
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) =>
                      v === "" ? <span style={{ color: "#aaa" }}>Required the attendee for Medical APAC Sales Meeting</span> : String(v),
                  }}
                >
                  <MenuItem value="inter">0001</MenuItem>
                  <MenuItem value="exter">0002</MenuItem>
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
                  id="trip_purpose_existing"
                  name="trip_purpose_existing"
                  defaultValue=""
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) =>
                      v === "" ? <span style={{ color: "#aaa" }}>Enter your trip purpose</span> : String(v),
                  }}
                >
                  <MenuItem value="guest">Guest</MenuItem>
                  <MenuItem value="contractor">Contractor</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                </TextField>
              </Stack>
            </Grid>
          </Grid>
        ) : null}
        {travellerSource === "guest" ? (
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
                    id="last_name"
                    name="last_name"
                    placeholder="Last Name"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    id="first_name"
                    name="first_name"
                    placeholder="First Name"
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
                    id="last_name_eng"
                    name="last_name_eng"
                    placeholder="Last Name"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth
                    id="first_name_eng"
                    name="first_name_eng"
                    placeholder="First Name"
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
                    id="gender"
                    name="gender"
                    defaultValue=""
                    placeholder="Select Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
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
                    id="travell_type_guest"
                    name="travell_type_guest"
                    defaultValue=""
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (v) =>
                        v === "" ? <span style={{ color: "#aaa" }}>Select Type</span> : String(v),
                    }}
                  >
                    <MenuItem value="inter">INTER</MenuItem>
                    <MenuItem value="exter">EXTER</MenuItem>
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
                    id="meeting_number_guest"
                    name="meeting_number_guest"
                    defaultValue=""
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (v) =>
                        v === "" ? <span style={{ color: "#aaa" }}>Required the attendee for Medical APAC Sales Meeting</span> : String(v),
                    }}
                  >
                    <MenuItem value="inter">0001</MenuItem>
                    <MenuItem value="exter">0002</MenuItem>
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
                    id="trip_purpose"
                    name="trip_purpose"
                    defaultValue=""
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (v) =>
                        v === "" ? <span style={{ color: "#aaa" }}>Enter your trip purpose</span> : String(v),
                    }}
                  >
                    <MenuItem value="guest">Guest</MenuItem>
                    <MenuItem value="contractor">Contractor</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        ) : null}
      </Paper>
      ) : null}

      {/* Itineary Details */}
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <Map
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            ITINEARY DETAILS
          </Typography>
        </Box>
        {/* tabs domestic online , offline , other */}
        <Grid container sx={{ p: 3 }}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                className={styles.tabBar}
                classes={{ flexContainer: styles.tabFlexContainer }}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                <Tab
                  label="Domestic Online"
                  className={`${styles.tabItem} ${activeTab === 0 ? styles.tabItemActive : ""}`}
                />
                <Tab
                  label="Domestic Offline"
                  className={`${styles.tabItem} ${activeTab === 1 ? styles.tabItemActive : ""}`}
                />
                <Tab
                  label="Other"
                  className={`${styles.tabItem} ${activeTab === 2 ? styles.tabItemActive : ""}`}
                />
              </Tabs>
            </Box>
          </Grid>
        </Grid>

        {/* Domestic Online Booking Section*/}
        {activeTab === 0 && (
          <Box>
            {/* <Grid item xs={12} sx={{ p: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1,
              }}
            >
              Online Booking
            </Typography>
          </Grid> */}

            <Grid container spacing={2} sx={{ p: 3 }}>
              {ITINERARY_PROVIDERS.map((provider) => (
                <Grid item xs={6} sm={6} md={2} key={provider.id}>
                  <ServiceCard
                    title={provider.title}
                    subtitle={provider.category}
                    icon={
                      <provider.icon size={20} color={provider.iconColor} />
                    }
                    selected={onlineItineraryProvider === provider.id}
                    onClick={() => setOnlineItineraryProvider(provider.id)}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Rest of your code */}

            <Paper
              sx={{
                m: 2,
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#163a6b",
                  color: "#fff",
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Users size={18} />
                <Typography fontWeight={600}>TRAVELER LIST</Typography>
              </Box>

              <Table>
                {/* Header */}
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#f1f5f9",
                    }}
                  >
                    <TableCell>NO</TableCell>
                    <TableCell>NAME (JAPANESE)</TableCell>
                    <TableCell>NAME (ENGLISH)</TableCell>
                    <TableCell>GENDER</TableCell>
                    <TableCell>MEMBER ID</TableCell>
                    <TableCell align="right">ACTION</TableCell>
                  </TableRow>
                </TableHead>

                {/* Body */}
                <TableBody>
                  <TableRow>
                    <TableCell>0001</TableCell>

                    <TableCell>トリプール トリプール</TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>TRIPUR PATEL</TableCell>

                    <TableCell>MALE</TableCell>

                    {/* Input inside table */}
                    <TableCell>
                      <TextField
                        size="small"
                        placeholder="ID Number"
                        sx={{
                          backgroundColor: "#f8fafc",
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>

                    {/* Action */}
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        disabled={jalLoading}
                        onClick={() => void handleBookJal()}
                        sx={{
                          backgroundColor: "var(--accent)",
                          borderRadius: "20px",
                          px: 3,
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        {jalLoading ? "Opening JAL…" : "Book"}
                      </Button>
                      {jalError ? (
                        <Typography sx={{ mt: 0.5, color: "error.main", fontSize: "0.75rem" }} role="alert">
                          {jalError}
                        </Typography>
                      ) : null}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Domestic Offline Section  */}
        {activeTab === 1 && (
          <Paper>
            <Grid item xs={6} sx={{ p: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 1,
                }}
              >
                Offline Itinerary Entry
              </Typography>
            </Grid>

            <Grid container spacing={2} sx={{ p: 3 }}>
              {ITINERARY_PROVIDERS_OFFLINE.map((provider) => (
                <Grid item xs={6} sm={6} md={2} key={provider.id}>
                  <ServiceCard
                    title={provider.title}
                    subtitle={provider.category}
                    icon={
                      <provider.icon size={20} color={provider.iconColor} />
                    }
                    selected={offlineItineraryProvider === provider.id}
                    onClick={() => setOfflineItineraryProvider(provider.id)}
                  />
                </Grid>
              ))}
            </Grid>

            <DomesticOfflineBookingForms
              activeProvider={offlineItineraryProvider}
            />
          </Paper>
        )}

        {/* Other Section  */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Other booking options coming soon...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* <Paper elevation={1} sx={{ overflow: 'hidden', mt: 3 }}> */}
      {/* Form Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, m: 3 }}>
        <Button type="submit" variant="contained" onClick={onNextClick}>
          Next
        </Button>
      </Box>
      {/* </Paper> */}
    </Box>
  );
}

export default DomesticBooking;
