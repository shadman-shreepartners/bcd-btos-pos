import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  Bus,
  Car,
  Check,
  Hotel,
  Info,
  MapPin,
  MessageSquare,
  Plane,
  Plus,
  Send,
  ShieldCheck,
  Ship,
  Train,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useBookingStore, type UnifiedTimelineItem } from "@/store/useBookingStore";
import { createDomesticBooking } from "@/services/api";
import {
  allocateOfflineItineraryId,
  isOfflineCarItinerary,
  isOfflineFlightItinerary,
  isOfflineHotelItinerary,
  type FlightOfflineItineraryEntry,
  type OfflineItineraryEntry,
} from "../offlineItinerary/types";
import type { JrOfflineItineraryEntry } from "../offlineItinerary/types";
import { buildBookingCreatePayload } from "../utils/bookingAdapter";
import { buildItineraryItemsFromOfflineEntries } from "../utils/buildItineraryTimelineFromOffline";
import {
  offlineItineraryCardDisplay,
  type OfflineItineraryCardStyles,
} from "../utils/offlineItineraryCardDisplay";
import { interpretDomesticBookingCreateResponse } from "../utils/interpretDomesticBookingCreateResponse";
import { getDomesticConfirmationSubmitError } from "../utils/domesticConfirmationSubmit";
import { getTodayLocalDateString } from "../utils/todayDateString";
import { selectWithPlaceholder } from "./domesticBookingConstants";
import { sanitizeBookingApiErrorMessage } from "../utils/sanitizeBookingApiErrorMessage";
import {
  isTravelArrangerApplicant,
  resolveCanonicalMeetingNumber,
} from "../utils/contactFromFormValues";
import styles from "./styles/DomesticBooking.module.scss";
import { Divider, Paper } from "@mui/material";
import CustomInputLabel from "@/shared/components/CustomInputLabel";

const PRIMARY_BLUE = "#2563eb";
const DASHBOARD_NAVY = "#0B2F5B";
const SECTION_TITLE_SX = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: PRIMARY_BLUE,
  textTransform: "uppercase" as const,
};

const LABEL_SX = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "text.secondary",
  textTransform: "uppercase" as const,
  mb: 0.5,
};

//Delivery fields label styles
const DELIVERY_FIELD_LABEL_SX = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "text.secondary",
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
};

const DELIVERY_METHOD_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "personal_pickup", label: "Personal Pickup" },
  { value: "inoffice", label: "In-Office Delivery" },
  { value: "e_ticket", label: "E-Ticket Only" },
];

const DELIVERY_TIME_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "late_night", label: "Late Night" },
];


type ConfirmationProps = {
  onBack: () => void;
};

type ExtraEmailRow = { id: string; name: string; email: string };

function displayOrDash(value: string | undefined): string {
  const t = value?.trim();
  return t && t.length > 0 ? t : "—";
}

function isOfflineJrEntry(raw: unknown): raw is JrOfflineItineraryEntry {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as { provider?: string };
  return o.provider === "jr";
}

function isReturnLegTimelineRaw(
  raw: unknown,
): raw is JrOfflineItineraryEntry & { leg: "return" } {
  return (
    isOfflineJrEntry(raw) &&
    "leg" in raw &&
    (raw as { leg?: string }).leg === "return"
  );
}

function timelineItemHasJrOrOfflineJr(item: UnifiedTimelineItem): boolean {
  if (item.supplier !== "OFFLINE") return false;
  return isOfflineJrEntry(item.originalRawData);
}

function offlineItinerariesIncludeJr(
  entries: OfflineItineraryEntry[] | undefined,
): boolean {
  return (entries ?? []).some(
    (e) => e && typeof e === "object" && "provider" in e && e.provider === "jr",
  );
}

function iconForTimelineItem(item: UnifiedTimelineItem): LucideIcon {
  switch (item.type) {
    case "FLIGHT":
      return Plane;
    case "BUS":
      return Bus;
    case "SHIP":
      return Ship;
    case "HOTEL":
      return Hotel;
    case "CAR":
      return Car;
    case "TRAIN":
    default:
      return Train;
  }
}

const itineraryBadgeStyles: OfflineItineraryCardStyles = {
  itineraryBadgeRail: styles.itineraryBadgeRail,
};

function SectionHeader({
  Icon,
  title,
  subtitle,
}: {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
      <Icon size={20} strokeWidth={2} color={PRIMARY_BLUE} aria-hidden />
      <Typography component="span" sx={SECTION_TITLE_SX}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "#60a5fa",
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Stack>
  );
}

function JrDetailLine({ label, value }: { label: string; value: string | undefined }) {
  return (
    <Typography
      variant="caption"
      component="div"
      sx={{ fontSize: 12, mt: 0.4, lineHeight: 1.45, color: "grey.800" }}
    >
      <Box component="span" sx={{ color: "text.secondary", fontWeight: 600, mr: 0.75 }}>
        {label}
      </Box>
      {displayOrDash(value)}
    </Typography>
  );
}

function JrOfflineConfirmationDetails({
  entry,
  variant = "full",
}: {
  entry: JrOfflineItineraryEntry;
  variant?: "full" | "return";
}) {
  const d = entry.details;
  if (variant === "return") {
    return (
      <Box
        sx={{
          mt: 1.5,
          pt: 1.5,
          borderTop: "1px dashed",
          borderColor: "grey.300",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em" }}
        >
          Return ticket segment
        </Typography>
        <JrDetailLine label="Ticket origin" value={d.jr_returnOrigin} />
        <JrDetailLine label="Ticket destination" value={d.jr_returnDestination} />
        <JrDetailLine label="Departure date" value={d.jr_departureDate} />
        <JrDetailLine label="Departure time" value={d.jr_departureTime} />
        <JrDetailLine label="Arrival time" value={d.jr_arrivalTime} />
      </Box>
    );
  }
  const seatPrefs = [d.jr_seatPreference1, d.jr_seatPreference2].filter(Boolean).join(", ");
  return (
    <Box
      sx={{
        mt: 1.5,
        pt: 1.5,
        borderTop: "1px dashed",
        borderColor: "grey.300",
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.06em" }}
      >
        Itinerary data (as entered)
      </Typography>
      <JrDetailLine label="Transport" value={d.jr_transportType} />
      <JrDetailLine label="Departure date" value={d.jr_departureDate} />
      <JrDetailLine label="Origin" value={d.jr_origin} />
      <JrDetailLine label="Destination" value={d.jr_destination} />
      <JrDetailLine label="Departure time" value={d.jr_departureTime} />
      <JrDetailLine label="Arrival time" value={d.jr_arrivalTime} />
      <JrDetailLine label="Train name" value={d.jr_trainName} />
      <JrDetailLine label="Train no." value={d.jr_trainNo} />
      <JrDetailLine label="Seats" value={d.jr_seats} />
      <JrDetailLine label="Return ticket origin" value={d.jr_returnOrigin} />
      <JrDetailLine label="Return ticket destination" value={d.jr_returnDestination} />
      <JrDetailLine label="Seat preferences" value={seatPrefs || undefined} />
      <JrDetailLine
        label="No reservation required"
        value={d.jr_noReservationRequired ? "Yes" : "No"}
      />
      <JrDetailLine label="Remarks" value={d.jr_remarks} />
    </Box>
  );
}

function FlightOfflineSummaryCard({ entry }: { entry: FlightOfflineItineraryEntry }) {
  const details = entry.details;
  const tripType = details.flight_tripType ?? "oneway";

  return (
    <Card variant="outlined" sx={{ mt: 1, p: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
        Flight route ({tripType})
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 600, color: "grey.900" }}>
        Outbound: {displayOrDash(details.flight_outbound_origin)} to{" "}
        {displayOrDash(details.flight_outbound_destination)}
      </Typography>
      {tripType === "return" ? (
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600, color: "grey.900" }}>
          Return: {displayOrDash(details.flight_return_origin)} to{" "}
          {displayOrDash(details.flight_return_destination)}
        </Typography>
      ) : null}
    </Card>
  );
}

export function BookingSubmittedSuccess({ tripId }: { tripId: string }) {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    useBookingStore.getState().setCreatedTripId(null);
    useBookingStore.getState().clearBookingData();
    useBookingStore.getState().setActiveStep(0);
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: { xs: "50vh", sm: "56vh" },
        py: 4,
        px: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow:
            "0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: "#E8F5E9",
              mx: "auto",
              display: "grid",
              placeItems: "center",
              mb: 3,
            }}
          >
            <Check size={48} strokeWidth={2.5} color="#2E7D32" />
          </Box>

          <Typography
            component="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.35rem", sm: "1.5rem" },
              color: "text.primary",
              mb: 2,
            }}
          >
            Request Submitted!
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              mb: 3,
            }}
          >
            Congratulations! Your business travel order has been successfully
            placed. We&apos;ll send you an update soon regarding your itinerary
            and approval status.
          </Typography>

          <Box
            sx={{
              bgcolor: "grey.100",
              borderRadius: 2,
              py: 2,
              px: 2.5,
              mb: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                letterSpacing: "0.08em",
                color: "text.secondary",
                fontWeight: 600,
                mb: 0.75,
              }}
            >
              TRIP ID
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.125rem",
                color: "text.primary",
                wordBreak: "break-all",
              }}
            >
              {tripId}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleReturnToDashboard}
            sx={{
              bgcolor: DASHBOARD_NAVY,
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              py: 1.25,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#092647",
                boxShadow: "none",
              },
            }}
          >
            RETURN TO DASHBOARD
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

const Confirmation = ({ onBack }: ConfirmationProps) => {
  const bookingData = useBookingStore((s) => s.bookingData);
  const itineraryItems = useBookingStore((s) => s.itineraryItems);

  const displayItineraryItems = useMemo(() => {
    const offline = bookingData?.offlineItineraries ?? [];
    if (offline.length > 0) {
      return buildItineraryItemsFromOfflineEntries(offline);
    }
    return itineraryItems;
  }, [itineraryItems, bookingData?.offlineItineraries]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitBlockedAfterAmbiguousResponse, setSubmitBlockedAfterAmbiguousResponse] =
    useState(false);

  const [approverRemarks, setApproverRemarks] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryRemarks, setDeliveryRemarks] = useState("");
  const [additionalEmails, setAdditionalEmails] = useState<ExtraEmailRow[]>([]);
  const [pendingEmailName, setPendingEmailName] = useState("");
  const [pendingEmailEmail, setPendingEmailEmail] = useState("");

  const showDeliverySection = useMemo(() => {
    if (offlineItinerariesIncludeJr(bookingData?.offlineItineraries)) {
      return true;
    }
    return displayItineraryItems.some(timelineItemHasJrOrOfflineJr);
  }, [bookingData?.offlineItineraries, displayItineraryItems]);

  const additionalEmailsForPayload = useMemo(
    () => additionalEmails.map(({ name, email }) => ({ name, email })),
    [additionalEmails],
  );

  const apiPayload = useMemo(
    () =>
      buildBookingCreatePayload(bookingData, {
        approverRemarks,
        deliveryMethod,
        deliveryDate,
        deliveryTime,
        deliveryRemarks,
        additionalEmails: additionalEmailsForPayload,
      }),
    [
      bookingData,
      approverRemarks,
      deliveryMethod,
      deliveryDate,
      deliveryTime,
      deliveryRemarks,
      additionalEmailsForPayload,
    ],
  );

  const isArranger = isTravelArrangerApplicant(bookingData.applicant);
  const selectedExistingTraveler = bookingData.existingTravelers?.[0];

  const meetingNo = useMemo(
    () => resolveCanonicalMeetingNumber(bookingData),
    [bookingData],
  );

  const travelTypeDisplay = useMemo(
    () =>
      displayOrDash(
        bookingData.travell_type_guest || bookingData.travell_type,
      ),
    [bookingData],
  );

  const tripPurposeDisplay = useMemo(
    () =>
      displayOrDash(
        bookingData.trip_purpose || bookingData.trip_purpose_existing,
      ),
    [bookingData],
  );

  const japaneseFullName = useMemo(() => {
    const last = bookingData.last_name?.trim() ?? "";
    const first = bookingData.first_name?.trim() ?? "";
    const combined = [last, first].filter(Boolean).join(" ");
    return combined || "—";
  }, [bookingData.last_name, bookingData.first_name]);

  const passportFullName = useMemo(() => {
    const first = bookingData.firstName?.trim() ?? "";
    const last = bookingData.last_name_eng?.trim() ?? "";
    const combined = [first, last].filter(Boolean).join(" ");
    return combined || "—";
  }, [bookingData.firstName, bookingData.last_name_eng]);

  const applicantNameDefault = useMemo(
    () =>
      (bookingData.applicant_name || bookingData.name || "").trim() || "—",
    [bookingData.applicant_name, bookingData.name],
  );

  const applicantEmailDefault = useMemo(
    () =>
      (bookingData.applicant_email || bookingData.email || "").trim() || "—",
    [bookingData.applicant_email, bookingData.email],
  );

  const handleBackFromConfirmation = () => {
    setSubmitBlockedAfterAmbiguousResponse(false);
    onBack();
  };

  const handleConfirm = async () => {
    setError(null);
    const submitError = getDomesticConfirmationSubmitError({
      showDeliverySection,
      deliveryMethod,
      deliveryDate,
      deliveryTime,
      deliveryRemarks,
    });
    if (submitError) {
      setError(submitError);
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await createDomesticBooking(apiPayload);
      const outcome = interpretDomesticBookingCreateResponse(response);
      if (outcome.kind === "ambiguousHttpSuccess") {
        setSubmitBlockedAfterAmbiguousResponse(true);
        setError(
          "The server accepted the request but did not return a valid booking id. Do not click Complete again — your booking may already exist. Contact support with your request details.",
        );
        return;
      }
      if (import.meta.env.DEV && outcome.response.createdAtSynthesized) {
        console.warn(
          "[DomesticBooking] Create response missing createdAt; using client clock for display id. Align parseDomesticBookingCreateResponse with the API contract if needed.",
          outcome.response,
        );
      }
      useBookingStore.getState().completeDomesticBookingSubmission(outcome.tripId);
    } catch (err) {
      console.error("[DomesticBooking] createDomesticBooking failed", err);
      let message = "Failed to create booking. Please try again.";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === "string" && data.trim()) {
          message = sanitizeBookingApiErrorMessage(data);
        } else if (
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof (data as { message?: unknown }).message === "string"
        ) {
          const m = (data as { message: string }).message.trim();
          if (m) message = sanitizeBookingApiErrorMessage(m);
        }
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commitPendingEmail = () => {
    const name = pendingEmailName.trim();
    const email = pendingEmailEmail.trim();
    if (!name && !email) return;
    setAdditionalEmails((prev) => [
      ...prev,
      { id: allocateOfflineItineraryId(), name, email },
    ]);
    setPendingEmailName("");
    setPendingEmailEmail("");
  };

  const updateExtraEmailRow = (
    id: string,
    patch: Partial<Pick<ExtraEmailRow, "name" | "email">>,
  ) => {
    setAdditionalEmails((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const removeExtraEmailRow = (id: string) => {
    setAdditionalEmails((prev) => prev.filter((row) => row.id !== id));
  };

  const cardShellSx = {
    borderRadius: 3,
    border: "1px solid",
    borderColor: "grey.200",
    bgcolor: "background.paper",
    p: { xs: 2, sm: 3 },
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  };

  return (
    <Box
    // id="booking-step-2"
    // sx={{
    //   display: "flex",
    //   flexDirection: "column",
    //   gap: 3,
    //   // bgcolor: "grey.50",
    //   mx: { xs: -1, sm: 0 },
    //   p: { xs: 1, sm: 0 },
    // }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          bgcolor: "#e8f2fe",
          border: "1px solid #bfdbfe",
          borderLeft: "4px solid var(--accent)",
        }}
      >
        <ShieldCheck
          size={22}
          strokeWidth={2}
          color={PRIMARY_BLUE}
          style={{ flexShrink: 0, marginTop: 2 }}
          aria-hidden
        />
        <Typography variant="body2" sx={{ color: "grey.900", lineHeight: 1.5 }}>
          Please review your trip details carefully before submitting your request.
        </Typography>
      </Box>

      <Box>
        {/* <SectionHeader Icon={User} title="Traveler details" /> */}
        {isArranger ? (
          // <Box sx={{ mb: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
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
                Applicant Info
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ p: 3 }}>
              <Grid item xs={12} sm={6} md={6}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Applicant Name"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{applicantNameDefault}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Contact No."
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(bookingData.contact_no)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Email ID"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">
                    {applicantEmailDefault}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        ) : null}
        {isArranger && bookingData.travellerSource === "existing" && selectedExistingTraveler ? (
          // <Box sx={{ mb: 2.5, pb: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
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
              <User
                style={{ width: 16, height: 16, color: "var(--accent)" }}
                strokeWidth={2}
                aria-hidden
              />
              <Typography
                variant="body1"
                component="h6"
                sx={{ fontWeight: "bold" }}
              >
                TRAVELLER DETAILS
              </Typography>
            </Box>
            <Typography variant="body1" sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              padding: 1,
            }}>Selected existing traveler</Typography>
            <Grid container spacing={2} sx={{ p: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Name"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(selectedExistingTraveler.name)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Employee ID"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(selectedExistingTraveler.employeeId)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Gender"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(bookingData.gender)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Department"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(selectedExistingTraveler.department)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Traveller ID (sent in booking request)"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{apiPayload.travellerId > 0
                    ? String(apiPayload.travellerId)
                    : "—"}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Selected traveller record id"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">
                    {
                      displayOrDash(selectedExistingTraveler.id)
                    }
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={2} sx={{ p: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Full Name (Japanese)"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{japaneseFullName}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Full Name (As per Passport)"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{passportFullName}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Gender"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(bookingData.gender)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Travel Type"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{travelTypeDisplay}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Meeting Number"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">{displayOrDash(meetingNo)}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack alignItems="start">
                  <CustomInputLabel
                    label="Trip Purpose"
                    sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                  />
                  <Typography variant="body1">
                    {
                      tripPurposeDisplay
                    }
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        ) : null}
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
              Traveler details
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ p: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Stack alignItems="start">
                <CustomInputLabel
                  label="Full Name (Japanese)"
                  sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                />
                <Typography variant="body1">{japaneseFullName}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack alignItems="start">
                <CustomInputLabel
                  label="Full Name (As per Passport)"
                  sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                />
                <Typography variant="body1">{passportFullName}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack alignItems="start">
                <CustomInputLabel
                  label="Gender"
                  sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                />
                <Typography variant="body1">{displayOrDash(bookingData.gender)}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack alignItems="start">
                <CustomInputLabel
                  label="Travel Type"
                  sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                />
                <Typography variant="body1">{travelTypeDisplay}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack alignItems="start">
                <CustomInputLabel
                  label="Meeting Number"
                  sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                />
                <Typography variant="body1">{displayOrDash(meetingNo)}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Stack alignItems="start">
                <CustomInputLabel
                  label="Trip Purpose"
                  sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
                />
                <Typography variant="body1">
                  {
                    tripPurposeDisplay
                  }
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

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
          <MapPin
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            TRAVELER ITINERARY LIST
          </Typography>
        </Box>
        {displayItineraryItems.length === 0 ? (
          <Typography color="text.secondary">No itineraries added.</Typography>
        ) : (
          <Stack spacing={2} sx={{ p: 3 }}>
            {displayItineraryItems.map((item, index) => {
              const raw = item.originalRawData;
              let Icon = iconForTimelineItem(item);
              let badgeLabel: string | null = null;
              const title: string = item.type;
              let routePrimary = `${displayOrDash(item.originName)} → ${displayOrDash(
                item.destinationName,
              )}`;
              let dateTimeSecondary =
                [displayOrDash(item.departureTime), displayOrDash(item.arrivalTime)]
                  .filter((s) => s !== "—")
                  .join(" · ") || "—";
              let detailStr = displayOrDash(item.status);

              if (isOfflineJrEntry(raw)) {
                const card = offlineItineraryCardDisplay(raw, itineraryBadgeStyles);
                Icon = card.Icon;
                badgeLabel = card.badgeLabel;
                routePrimary = card.titleLine;
                dateTimeSecondary = card.dateTimeLine;
                detailStr = card.metaLine;
              } else if (isOfflineCarItinerary(raw as OfflineItineraryEntry)) {
                const card = offlineItineraryCardDisplay(
                  raw as OfflineItineraryEntry,
                  itineraryBadgeStyles,
                );
                Icon = card.Icon;
                badgeLabel = card.badgeLabel;
                routePrimary = card.titleLine;
                dateTimeSecondary = card.dateTimeLine;
                detailStr = card.metaLine;
              } else if (isOfflineHotelItinerary(raw as OfflineItineraryEntry)) {
                const card = offlineItineraryCardDisplay(
                  raw as OfflineItineraryEntry,
                  itineraryBadgeStyles,
                );
                Icon = card.Icon;
                badgeLabel = card.badgeLabel;
                routePrimary = card.titleLine;
                dateTimeSecondary = card.dateTimeLine;
                detailStr = card.metaLine;
              } else if (isOfflineFlightItinerary(raw as OfflineItineraryEntry)) {
                const card = offlineItineraryCardDisplay(
                  raw as OfflineItineraryEntry,
                  itineraryBadgeStyles,
                );
                Icon = card.Icon;
                badgeLabel = card.badgeLabel;
                routePrimary = card.titleLine;
                dateTimeSecondary = card.dateTimeLine;
                detailStr = card.metaLine;
              }

              const orderLabel = String(index + 1).padStart(2, "0");

              return (
                <Stack
                  key={item.id}
                  direction="row"
                  spacing={0}
                  sx={{
                    overflow: "hidden",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "grey.200",
                    bgcolor: "#fff",
                    alignItems: "stretch",
                  }}
                >
                  <Stack
                    alignItems="center"
                    justifyContent="flex-start"
                    spacing={1}
                    sx={{
                      flexShrink: 0,
                      width: 56,
                      py: 2,
                      borderRight: "1px solid",
                      borderColor: "grey.200",
                      bgcolor: "grey.50",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "grey.500",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {orderLabel}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#eff6ff",
                        color: PRIMARY_BLUE,
                      }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </Box>
                  </Stack>
                  <Box sx={{ flex: 1, minWidth: 0, py: 2, px: 2 }}>
                    {badgeLabel ? (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-block",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          color: "#1d4ed8",
                          bgcolor: "#dbeafe",
                          px: 1.25,
                          py: 0.35,
                          borderRadius: 1,
                          mb: 0.75,
                        }}
                      >
                        {badgeLabel}
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                        {title}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "grey.900", mt: 0.5 }}>
                      {routePrimary}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 13 }}>
                      {dateTimeSecondary}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block", fontSize: 12 }}
                    >
                      {detailStr}
                    </Typography>
                    {/* {isOfflineJrEntry(raw) ? (
                      <JrOfflineConfirmationDetails
                        entry={raw}
                        variant={
                          isReturnLegTimelineRaw(raw) ? "return" : "full"
                        }
                      />
                    ) : null} */}
                  </Box>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Paper>

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
          <MapPin
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            Approver
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ p: 3 }}>
          <TableContainer
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "var(--border)",
              backgroundColor: "var(--page)",
              mb: 2,
              p: 1,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...LABEL_SX }}>
                    Approval order
                  </TableCell>
                  <TableCell sx={{ ...LABEL_SX }}>
                    Full name (Japanese)
                  </TableCell>
                  <TableCell sx={{ ...LABEL_SX }}>
                    Full name (English)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody >
                <TableRow sx={{ bgcolor: "#fff", p: 2 }}>
                  <TableCell sx={{ fontWeight: 600 }}>01</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>トリプール トリプール</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>MR TRIPUR PATEL</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
        <Box   sx={{
            gap: 1,
            borderRadius: 2,
            m:3,
            p:2,
            backgroundColor: "var(--page)",
            border: "1px solid var(--border)",
          }}>
          <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            backgroundColor: "var(--page)",
            // border: "var(--border)",
          }}
        >
          <MessageSquare
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body2"
            // component="h6"
            // sx={{ fontWeight: "bold" }}
          >
            Remarks (for approver)
          </Typography>
        </Box>
        <TextField
          multiline
          minRows={2}
          fullWidth
          placeholder="e.g., Purpose of trip, reason for urgent booking, etc."
          value={approverRemarks}
          onChange={(e) => setApproverRemarks(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
          }}
        />
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1, fontStyle: "italic", color: "text.secondary" }}
        >
          Please provide context if the booking is outside policy or requires urgent approval.
        </Typography>
       
        </Box>
      </Paper>

      {showDeliverySection ? (
        <Paper
          elevation={1}
          sx={{
            overflow: "hidden",
            mt: 2,
            borderRadius: 2,
            border: "1px solid var(--border)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              py: 1,
              pl: 2.5,
              borderBottom: "1px solid var(--border)",
              bgcolor: "var(--page)",
            }}
          >
            <Send
              style={{ width: 16, height: 16, color: "var(--accent)" }}
              strokeWidth={2}
              aria-hidden
            />
            <Stack direction="row" alignItems="baseline" flexWrap="wrap" columnGap={1} rowGap={0}>
              <Typography
                variant="body1"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  color: DASHBOARD_NAVY,
                  textTransform: "uppercase",
                }}
              >
                Delivery info
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  color: PRIMARY_BLUE,
                  textTransform: "uppercase",
                }}
              >
                (For JR railways only)
              </Typography>
            </Stack>
          </Box>

          <Stack spacing={3} sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <CustomInputLabel
                    label="Receive / document delivery"
                    sx={DELIVERY_FIELD_LABEL_SX}
                  />
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    id="delivery_method"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    SelectProps={selectWithPlaceholder(DELIVERY_METHOD_OPTIONS, "Select One")}
                  >
                    <MenuItem value="">
                      <em>Select One</em>
                    </MenuItem>
                    {DELIVERY_METHOD_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1}>
                  <CustomInputLabel
                    label="Receive / expected delivery date"
                    required
                    sx={DELIVERY_FIELD_LABEL_SX}
                  />
                  <TextField
                    type="date"
                    fullWidth
                    variant="outlined"
                    id="delivery_date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getTodayLocalDateString() }}
                    sx={{
                      "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
                    }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1} alignItems="stretch">
                  <CustomInputLabel
                    label="Time of day"
                    sx={{
                      ...DELIVERY_FIELD_LABEL_SX,
                      textAlign: { xs: "left", md: "right" },
                      alignSelf: { xs: "stretch", md: "flex-end" },
                      width: { md: "100%" },
                    }}
                  />
                  <TextField
                    select
                    fullWidth
                    variant="outlined"
                    id="delivery_time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    SelectProps={selectWithPlaceholder(DELIVERY_TIME_OPTIONS, "Select")}
                  >
                    <MenuItem value="">
                      <em>Select</em>
                    </MenuItem>
                    {DELIVERY_TIME_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={1}>
              <CustomInputLabel label="E-mail with reservation" sx={DELIVERY_FIELD_LABEL_SX} />
              <TableContainer
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Table size="small">
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ ...LABEL_SX, borderBottomColor: "grey.200" }}>Name</TableCell>
                      <TableCell sx={{ ...LABEL_SX, borderBottomColor: "grey.200" }}>
                        Email address
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ ...LABEL_SX, borderBottomColor: "grey.200", width: 140 }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: 14,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {applicantNameDefault}
                        </Typography>
                      </TableCell>
                      <TableCell>{applicantEmailDefault}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="caption"
                          sx={{
                            fontStyle: "italic",
                            color: "text.secondary",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Applicant
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {additionalEmails.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ verticalAlign: "middle" }}>
                          <TextField
                            size="small"
                            fullWidth
                            variant="outlined"
                            placeholder="Full name"
                            value={row.name}
                            onChange={(e) =>
                              updateExtraEmailRow(row.id, { name: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "middle" }}>
                          <TextField
                            size="small"
                            fullWidth
                            variant="outlined"
                            placeholder="email@example.com"
                            type="email"
                            value={row.email}
                            onChange={(e) =>
                              updateExtraEmailRow(row.id, { email: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ verticalAlign: "middle" }}>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => removeExtraEmailRow(row.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          variant="outlined"
                          placeholder="Full name"
                          value={pendingEmailName}
                          onChange={(e) => setPendingEmailName(e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          variant="outlined"
                          placeholder="email@example.com"
                          type="email"
                          value={pendingEmailEmail}
                          onChange={(e) => setPendingEmailEmail(e.target.value)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={commitPendingEmail}
                          aria-label="Add email recipient"
                          sx={{
                            bgcolor: "#0f172a",
                            color: "#fff",
                            borderRadius: 1,
                            "&:hover": { bgcolor: "#1e293b" },
                          }}
                        >
                          <Plus size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography
                variant="caption"
                sx={{ fontStyle: "italic", color: "text.secondary" }}
              >
                E-mail is also sent to approvers.
              </Typography>
            </Stack>

            <Stack spacing={1}>
              <CustomInputLabel label="Remarks" sx={DELIVERY_FIELD_LABEL_SX} />
              <TextField
                multiline
                minRows={3}
                fullWidth
                variant="outlined"
                placeholder="Specific delivery instructions..."
                value={deliveryRemarks}
                onChange={(e) => setDeliveryRemarks(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": { bgcolor: "#fff" },
                }}
              />
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        sx={{ pt: 1 }}
      >
        <Button
          variant="outlined"
          onClick={handleBackFromConfirmation}
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            borderColor: "grey.300",
            color: "grey.700",
            px: 3,
            borderRadius: 2,
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleConfirm()}
          disabled={isSubmitting || submitBlockedAfterAmbiguousResponse}
          sx={{
            textTransform: "uppercase",
            fontWeight: 700,
            px: 4,
            borderRadius: 2,
            bgcolor: PRIMARY_BLUE,
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {isSubmitting ? <CircularProgress size={22} color="inherit" /> : "Complete"}
        </Button>
      </Stack>
    </Box>
  );
};

export default Confirmation;
