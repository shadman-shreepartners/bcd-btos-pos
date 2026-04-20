import { create, type StateCreator } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { DomesticData } from "@/features/DomesticBooking/domesticBookingTypes";
import type { OfflineTimelineOriginalRaw } from "@/features/DomesticBooking/offlineItinerary/types";
import {
  lookupService,
  type HotelAmenitiesLookupData,
} from "@/services/api/lookupService";
import { buildDefaultBookingData } from "./bookingDefaults";
import { migrateBookingPersistState } from "./bookingPersistMigrate";

export { buildDefaultBookingData } from "./bookingDefaults";

const PERSIST_KEY = "domestic-booking-session";
const PERSIST_VERSION = 1;

const persistEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_BOOKING_PERSIST === "true";

export interface UnifiedTimelineItem {
  id: string;
  type: "FLIGHT" | "TRAIN" | "HOTEL" | "BUS" | "SHIP" | "CAR";
  supplier: "JAL" | "ANA" | "EKISPERT" | "OFFLINE";
  departureTime: string;
  arrivalTime: string;
  originName: string;
  destinationName: string;
  status: string;
  isNonArrange: boolean;
  /** Offline JR / car / hotel rows; online rows may use a narrower shape later. */
  originalRawData: OfflineTimelineOriginalRaw;
}

/** Hotel amenities API: single state object (`data` + request lifecycle); not persisted. */
export type HotelAmenitiesState = {
  data: HotelAmenitiesLookupData | null;
  loading: boolean;
  error: string | null;
};

const initialHotelAmenities: HotelAmenitiesState = {
  data: null,
  loading: false,
  error: null,
};

export type BookingStoreState = {
  activeStep: number;
  bookingData: DomesticData;
  itineraryItems: UnifiedTimelineItem[];
  isUiLocked: boolean;
  createdTripId: string | null;
  hotelAmenities: HotelAmenitiesState;
};

export type BookingStoreActions = {
  setActiveStep: (value: number | ((prev: number) => number)) => void;
  setBookingData: (
    value: DomesticData | ((prev: DomesticData) => DomesticData),
  ) => void;
  setItineraryItems: (
    value:
      | UnifiedTimelineItem[]
      | ((prev: UnifiedTimelineItem[]) => UnifiedTimelineItem[]),
  ) => void;
  setUiLocked: (locked: boolean) => void;
  lockUi: () => void;
  unlockUi: () => void;
  resetBooking: () => void;
  setCreatedTripId: (id: string | null) => void;
  /** Clears persisted booking fields without changing `activeStep` (e.g. after submit, stay on success step). */
  clearBookingData: () => void;
  /**
   * One atomic update after successful API submit: saves trip id, wipes PII/itinerary,
   * sets `activeStep` past the last stepper index so both steps read as complete, then
   * Confirmation shows the success panel (avoids races with persist / follow-up `setBookingData`).
   */
  completeDomesticBookingSubmission: (tripId: string) => void;
  /** Loads hotel amenities lookup once per session (skips if already loaded or in flight). */
  ensureHotelAmenities: () => Promise<void>;
};

export type BookingStore = BookingStoreState & BookingStoreActions;

/**
 * Session resume stores `bookingData` / `itineraryItems` in sessionStorage.
 * Treat as PII: any same-origin script (e.g. XSS) can read this storage.
 */
const persistBookingOptions = {
  name: PERSIST_KEY,
  storage: createJSONStorage(() => sessionStorage),
  partialize: (state: BookingStore) => ({
    activeStep: state.activeStep,
    bookingData: state.bookingData,
    itineraryItems: state.itineraryItems,
    createdTripId: state.createdTripId,
  }),
  version: PERSIST_VERSION,
  migrate: (persisted: unknown, version: number) =>
    migrateBookingPersistState(persisted, version),
  /**
   * Default persist merge prefers persisted keys over current. If hydration resolves after the user
   * has already submitted (cleared PII in memory), that would restore stale itineraries — skip it.
   */
  merge: (persistedState: unknown, currentState: BookingStore): BookingStore => {
    if (!persistedState || typeof persistedState !== "object") {
      return currentState;
    }
    const cs = currentState;
    if (cs.activeStep >= 2 && cs.createdTripId != null) {
      return cs;
    }
    return {
      ...cs,
      ...(persistedState as Partial<
        Pick<
          BookingStore,
          "activeStep" | "bookingData" | "itineraryItems" | "createdTripId"
        >
      >),
    };
  },
};

const bookingStoreCreator = (
  set: {
    (
      partial:
        | BookingStore
        | Partial<BookingStore>
        | ((state: BookingStore) => BookingStore | Partial<BookingStore>),
    ): void;
  },
  get: () => BookingStore,
): BookingStore => ({
  activeStep: 0,
  bookingData: buildDefaultBookingData(),
  itineraryItems: [],
  isUiLocked: false,
  createdTripId: null,
  hotelAmenities: { ...initialHotelAmenities },

  setActiveStep: (value) =>
    set((state) => ({
      activeStep: typeof value === "function" ? value(state.activeStep) : value,
    })),

  setBookingData: (value) =>
    set((state) => ({
      bookingData:
        typeof value === "function" ? value(state.bookingData) : value,
    })),

  setItineraryItems: (value) =>
    set((state) => ({
      itineraryItems:
        typeof value === "function" ? value(state.itineraryItems) : value,
    })),

  setUiLocked: (locked) => set({ isUiLocked: locked }),

  lockUi: () => set({ isUiLocked: true }),

  unlockUi: () => set({ isUiLocked: false }),
  setCreatedTripId: (id) => set({ createdTripId: id }),

  resetBooking: () =>
    set({
      activeStep: 0,
      bookingData: buildDefaultBookingData(),
      itineraryItems: [],
      isUiLocked: false,
      createdTripId: null,
      hotelAmenities: { ...initialHotelAmenities },
    }),

  clearBookingData: () =>
    set({
      bookingData: buildDefaultBookingData(),
      itineraryItems: [],
    }),

  ensureHotelAmenities: async () => {
    const { hotelAmenities } = get();
    if (hotelAmenities.data !== null || hotelAmenities.loading) {
      return;
    }

    set({
      hotelAmenities: {
        ...get().hotelAmenities,
        loading: true,
        error: null,
      },
    });
    try {
      const data = await lookupService.getHotelAmenities();
      set({
        hotelAmenities: {
          data,
          loading: false,
          error: null,
        },
      });
    } catch (e) {
      const message =
        e instanceof Error && e.message.trim()
          ? e.message
          : "Hotel amenities lookup failed";
      set({
        hotelAmenities: {
          data: null,
          loading: false,
          error: message,
        },
      });
    }
  },

  completeDomesticBookingSubmission: (tripId) =>
    set({
      createdTripId: tripId,
      bookingData: { ...buildDefaultBookingData(), step: 2 },
      itineraryItems: [],
      activeStep: 2,
      isUiLocked: false,
    }),
});

/** Conditional persist/devtools stacks use different mutators; runtime is correct for each branch. */
const bookingStoreInitializer = (
  persistEnabled
    ? import.meta.env.DEV
      ? devtools(persist(bookingStoreCreator, persistBookingOptions), {
          name: "DomesticBookingStore",
        })
      : persist(bookingStoreCreator, persistBookingOptions)
    : import.meta.env.DEV
      ? devtools(bookingStoreCreator, { name: "DomesticBookingStore" })
      : bookingStoreCreator
) as StateCreator<BookingStore, [], []>;

export const useBookingStore = create<BookingStore>()(bookingStoreInitializer);
