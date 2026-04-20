import {
  Box,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type { DomesticBookingFormValues } from "../../domesticBookingTypes";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Map, Pencil, Trash2 } from "lucide-react";
import { useFormikContext } from "formik";
import ServiceCard from "@/shared/components/ServiceCard";
import { CommonModal } from "@/shared/components/CommonModal";
import {
  isOfflineCarItinerary,
  isOfflineFlightItinerary,
  isOfflineHotelItinerary,
  type OfflineItineraryEntry,
  type OfflineItineraryFormState,
  type OfflineItineraryProviderId,
} from "../../offlineItinerary/types";
import { mapOfflineCarEntryToFormSlice } from "../../offlineItinerary/mapOfflineCarEntryToFormSlice";
import { mapOfflineFlightEntryToFormSlice } from "../../offlineItinerary/mapOfflineFlightEntryToFormSlice";
import { mapOfflineHotelEntryToFormSlice } from "../../offlineItinerary/mapOfflineHotelEntryToFormSlice";
import {
  offlineItineraryCardDisplay,
  type OfflineItineraryCardStyles,
} from "../../utils/offlineItineraryCardDisplay";
import DomesticOfflineBookingForms from "../offline/DomesticOfflineBookingForms";
import SectionCardHeader from "../components/SectionCardHeader";
import { OnlineSupplierTravelerList } from "../components/OnlineSupplierTravelerList";
import { useAnaPunchout } from "@/features/DomesticBooking/hooks/useAnaPunchout";
import { useJalPunchout } from "@/features/DomesticBooking/hooks/useJalPunchout";
import styles from "../styles/DomesticBooking.module.scss";
import {
  ITINERARY_PROVIDERS,
  ITINERARY_PROVIDERS_OFFLINE,
  type ItineraryProviderId,
} from "../itineraryProviders";
import { domesticBookingSchemaWithoutItineraryMinimum } from "../../domesticBookingSchema";
import { useBookingStore } from "@/store/useBookingStore";

const itineraryBadgeStyles: OfflineItineraryCardStyles = {
  itineraryBadgeRail: styles.itineraryBadgeRail,
};

export type ItineraryDetailsSectionProps = {
  /** When true, the primary step "NEXT" stays disabled (e.g. offline route not yet wired). */
  onBlocksStepNextChange?: (blocks: boolean) => void;
};

const ItineraryDetailsSection = ({
  onBlocksStepNextChange,
}: ItineraryDetailsSectionProps) => {
  const { values, setFieldValue } =
    useFormikContext<DomesticBookingFormValues>();
  const offlineItineraryEntries = values.offlineItineraries;

  /**
   * Disable "Add to Itinerary" until every main-form rule except "at least one itinerary" passes
   * (Yup sync — not dependent on Formik's `errors` key list).
   */
  const disableAddItinerary = useMemo(() => {
    try {
      domesticBookingSchemaWithoutItineraryMinimum.validateSync(values, {
        abortEarly: false,
      });
      return false;
    } catch {
      return true;
    }
  }, [values]);

  const [activeTab, setActiveTab] = useState(0);
  const [onlineProvider, setOnlineProvider] =
    useState<ItineraryProviderId | null>(null);
  const [offlineItineraryProvider, setOfflineItineraryProvider] =
    useState<OfflineItineraryProviderId>("");
  const [editingOfflineItineraryId, setEditingOfflineItineraryId] = useState<
    string | null
  >(null);
  const [editingOfflineDetails, setEditingOfflineDetails] =
    useState<Partial<OfflineItineraryFormState> | null>(null);
  const [itineraryDeleteIndex, setItineraryDeleteIndex] = useState<
    number | null
  >(null);

  const { initiatePunchout: initiateJal, loading: jalLoading, error: jalError } =
    useJalPunchout();
  const { initiatePunchout: initiateAna, loading: anaLoading, error: anaError } =
    useAnaPunchout();

  const syncOfflineItinerariesToStore = useCallback(
    (next: OfflineItineraryEntry[]) => {
      useBookingStore.getState().setBookingData((prev) => ({
        ...prev,
        offlineItineraries: next,
      }));
    },
    [],
  );

  const handleAddOfflineItinerary = useCallback(
    (entry: OfflineItineraryEntry) => {
      const prev = values.offlineItineraries;
      let next: OfflineItineraryEntry[];
      if ("provider" in entry && entry.provider === "jr") {
        const i = prev.findIndex(
          (x) => "provider" in x && x.provider === "jr" && x.id === entry.id,
        );
        if (i >= 0) {
          next = [...prev];
          next[i] = entry;
        } else {
          next = [...prev, entry];
        }
      } else if (isOfflineHotelItinerary(entry)) {
        const i = prev.findIndex(
          (x) => isOfflineHotelItinerary(x) && x.id === entry.id,
        );
        if (i >= 0) {
          next = [...prev];
          next[i] = entry;
        } else {
          next = [...prev, entry];
        }
      } else if (isOfflineCarItinerary(entry)) {
        const i = prev.findIndex(
          (x) => isOfflineCarItinerary(x) && x.id === entry.id,
        );
        if (i >= 0) {
          next = [...prev];
          next[i] = entry;
        } else {
          next = [...prev, entry];
        }
      } else if (isOfflineFlightItinerary(entry)) {
        const i = prev.findIndex(
          (x) => isOfflineFlightItinerary(x) && x.id === entry.id,
        );
        if (i >= 0) {
          next = [...prev];
          next[i] = entry;
        } else {
          next = [...prev, entry];
        }
      } else {
        next = [...prev, entry];
      }
      void setFieldValue("offlineItineraries", next);
      syncOfflineItinerariesToStore(next);
      setEditingOfflineItineraryId(null);
      setEditingOfflineDetails(null);
      setOfflineItineraryProvider("");
    },
    [setFieldValue, syncOfflineItinerariesToStore, values.offlineItineraries],
  );

  const handleDeleteItinerary = useCallback(
    (indexToRemove: number) => {
      const prev = values.offlineItineraries;
      const removed = prev[indexToRemove];
      const removedId = removed && "id" in removed ? removed.id : undefined;
      const next = prev.filter((_, i) => i !== indexToRemove);
      void setFieldValue("offlineItineraries", next);
      syncOfflineItinerariesToStore(next);
      if (removedId != null && removedId === editingOfflineItineraryId) {
        setEditingOfflineItineraryId(null);
        setEditingOfflineDetails(null);
      }
    },
    [
      setFieldValue,
      syncOfflineItinerariesToStore,
      values.offlineItineraries,
      editingOfflineItineraryId,
    ],
  );

  useEffect(() => {
    const blocksNonSubmittableOffline =
      activeTab === 1 && offlineItineraryProvider === "route";
    onBlocksStepNextChange?.(blocksNonSubmittableOffline);
    return () => {
      onBlocksStepNextChange?.(false);
    };
  }, [activeTab, offlineItineraryProvider, onBlocksStepNextChange]);

  return (
    <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
      <SectionCardHeader icon={Map} title="ITINERARY DETAILS" />

      {offlineItineraryEntries.length > 0 ? (
        <Box sx={{ px: 3, pt: 2, pb: 1 }}>
          <Stack spacing={2}>
            {offlineItineraryEntries.map((item, index) => {
              const card = offlineItineraryCardDisplay(
                item,
                itineraryBadgeStyles,
              );
              const CardIcon = card.Icon;
              const isJr = "provider" in item && item.provider === "jr";
              const isCar = isOfflineCarItinerary(item);
              const isHotel = isOfflineHotelItinerary(item);
              const isFlight = isOfflineFlightItinerary(item);
              const cardKey =
                "id" in item && item.id
                  ? `offline-itinerary-${item.id}`
                  : `offline-itinerary-${index}`;
              return (
                <Paper
                  key={cardKey}
                  variant="outlined"
                  className={styles.itineraryCard}
                  elevation={0}
                >
                  <Box className={styles.itineraryCardInner}>
                    <Box className={styles.itineraryCardRail}>
                      <Typography
                        component="span"
                        className={styles.itineraryCardIndexSmall}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </Typography>
                      <Box
                        className={styles.itineraryCardIconCircle}
                        aria-hidden
                      >
                        <CardIcon
                          size={20}
                          strokeWidth={1.75}
                          className={styles.itineraryCardIconGlyph}
                        />
                      </Box>
                    </Box>
                    <Box className={styles.itineraryCardMain}>
                      <span
                        className={`${styles.itineraryBadge} ${card.badgeClass}`}
                      >
                        {card.badgeLabel}
                      </span>
                      <Typography
                        className={styles.itineraryCardTitle}
                        component="p"
                      >
                        {card.titleLine}
                      </Typography>
                      <Typography
                        className={styles.itineraryCardSubline}
                        component="p"
                      >
                        {card.dateTimeLine}
                      </Typography>
                      <Typography
                        className={styles.itineraryCardMeta}
                        component="p"
                      >
                        {card.metaLine}
                      </Typography>
                    </Box>
                    <Stack
                      className={styles.itineraryCardActions}
                      spacing={0.25}
                    >
                      {isJr || isCar || isHotel || isFlight ? (
                        <IconButton
                          size="small"
                          aria-label="Edit itinerary"
                          className={styles.itineraryCardEditBtn}
                          onClick={() => {
                            if (isJr && "provider" in item) {
                              setOfflineItineraryProvider(item.provider);
                              setEditingOfflineItineraryId(item.id);
                              setEditingOfflineDetails(item.details);
                            } else if (isCar) {
                              setOfflineItineraryProvider("car");
                              setEditingOfflineItineraryId(item.id);
                              setEditingOfflineDetails(
                                mapOfflineCarEntryToFormSlice(item),
                              );
                            } else if (isHotel) {
                              setOfflineItineraryProvider("hotel");
                              setEditingOfflineItineraryId(item.id);
                              setEditingOfflineDetails(
                                mapOfflineHotelEntryToFormSlice(item),
                              );
                            } else if (isFlight) {
                              setOfflineItineraryProvider("flight");
                              setEditingOfflineItineraryId(item.id);
                              setEditingOfflineDetails(
                                mapOfflineFlightEntryToFormSlice(item),
                              );
                            }
                            setActiveTab(1);
                          }}
                        >
                          <Pencil size={18} strokeWidth={2} />
                        </IconButton>
                      ) : null}
                      <IconButton
                        size="small"
                        aria-label="Remove itinerary"
                        className={styles.itineraryCardEditBtn}
                        onClick={() => setItineraryDeleteIndex(index)}
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </IconButton>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      ) : null}

      <Grid
        container
        sx={{ p: 3, pt: offlineItineraryEntries.length > 0 ? 1 : 3 }}
      >
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

      {activeTab === 0 ? (
        <Box sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={2}>
            {ITINERARY_PROVIDERS.map((provider) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={provider.id}>
                <ServiceCard
                  title={provider.title}
                  subtitle={provider.category}
                  icon={
                    <provider.icon
                      size={20}
                      color={provider.iconColor}
                      strokeWidth={2}
                    />
                  }
                  selected={onlineProvider === provider.id}
                  onClick={() => setOnlineProvider(provider.id)}
                />
              </Grid>
            ))}
          </Grid>
          {onlineProvider === "jr-express" ? (
            <OnlineSupplierTravelerList
              warningMessage={
                <>
                  <Typography component="div" sx={{ fontWeight: 700 }}>
                    There is currently no Member ID registered in the travelers profile.
                  </Typography>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{ mt: 0.75, fontStyle: "italic", color: "var(--badge)" }}
                  >
                    Please return to the Profile page and register your EX IC Member ID to
                    continue.
                  </Typography>
                </>
              }
              memberIdLabel="JR MEMBER ID"
              memberIdPlaceholder="ID Number"
              inputAriaPrefix="Member ID"
              isLoading={false}
            />
          ) : null}
          {onlineProvider === "jal-online" ? (
            <OnlineSupplierTravelerList
              warningMessage={
                <>
                  <Typography component="div" sx={{ fontWeight: 700 }}>
                    There is currently no JAL Mileage Number registered in the travelers
                    profile.
                  </Typography>
                  <Typography
                    component="div"
                    variant="body2"
                    sx={{ mt: 0.75, fontStyle: "italic", color: "var(--badge)" }}
                  >
                    Please return to the Profile page and register your Mileage Number to
                    continue.
                  </Typography>
                </>
              }
              memberIdLabel="JAL MILEAGE NUMBER"
              memberIdPlaceholder="Mileage Number"
              inputAriaPrefix="JAL Mileage Number"
              isLoading={jalLoading}
              error={jalError}
              onBook={(id) => initiateJal(id || "XC0050870", "M5555J260300050")}
            />
          ) : null}
          {onlineProvider === "ana-biz" && (
            <OnlineSupplierTravelerList
              warningMessage={
                <>
                  {
                    "There is currently no ANA Member ID registered in the traveler's profile."
                  }
                  <br />
                  <span style={{ fontStyle: "italic", color: "#d32f2f" }}>
                    Please return to the Profile page and register your ANA Member ID to
                    continue.
                  </span>
                </>
              }
              memberIdLabel="ANA MEMBER ID"
              isLoading={anaLoading}
              error={anaError}
              onBook={(memberId) => {
                initiateAna({
                  companyId: "SCL96022",
                  employeeId: memberId || "0005233313",
                  projectNumber: "XXXXXTEST000001",
                });
              }}
            />
          )}
        </Box>
      ) : null}

      {activeTab === 1 ? (
        <Paper
          elevation={0}
          sx={{ mx: 2, mb: 2, border: "1px solid #edf1f7", borderRadius: 1 }}
        >
          <Box sx={{ p: 1 }}>
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
          </Box>
          <Grid container spacing={2} sx={{ px: 3, pb: 2 }}>
            {ITINERARY_PROVIDERS_OFFLINE.map((provider) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={provider.id}>
                <ServiceCard
                  title={provider.title}
                  subtitle={provider.category}
                  icon={
                    <provider.icon
                      size={20}
                      color={provider.iconColor}
                      strokeWidth={2}
                    />
                  }
                  selected={offlineItineraryProvider === provider.id}
                  onClick={() => setOfflineItineraryProvider(provider.id)}
                />
              </Grid>
            ))}
          </Grid>
          <DomesticOfflineBookingForms
            key={`${offlineItineraryProvider}-${editingOfflineItineraryId ?? "new"}`}
            activeProvider={offlineItineraryProvider}
            editingEntryId={editingOfflineItineraryId}
            initialValuesOverride={editingOfflineDetails}
            disableAddItinerary={disableAddItinerary}
            onAddItinerary={handleAddOfflineItinerary}
            onCancelEdit={() => {
              setEditingOfflineItineraryId(null);
              setEditingOfflineDetails(null);
            }}
          />
        </Paper>
      ) : null}

      {activeTab === 2 ? (
        <Box sx={{ px: 3, pb: 3 }}>
          <Typography variant="body1" sx={{ color: "var(--sublabel)" }}>
            Other booking options coming soon...
          </Typography>
        </Box>
      ) : null}

      <CommonModal
        open={itineraryDeleteIndex !== null}
        title="Are you sure?"
        message="Remove this item from your itinerary?"
        onCancel={() => setItineraryDeleteIndex(null)}
        onConfirm={() => {
          if (itineraryDeleteIndex !== null) {
            handleDeleteItinerary(itineraryDeleteIndex);
          }
          setItineraryDeleteIndex(null);
        }}
      />
    </Paper>
  );
};

export default ItineraryDetailsSection;
