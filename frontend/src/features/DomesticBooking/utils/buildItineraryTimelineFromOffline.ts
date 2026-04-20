import type { UnifiedTimelineItem } from "@/store/useBookingStore";
import {
  isOfflineCarItinerary,
  isOfflineFlightItinerary,
  isOfflineHotelItinerary,
  type JrTransportType,
  type OfflineItineraryEntry,
} from "../offlineItinerary/types";

function jrTransportToTimelineType(
  t: JrTransportType,
): UnifiedTimelineItem["type"] {
  if (t === "bus") return "BUS";
  if (t === "ship") return "SHIP";
  return "TRAIN";
}

function combineDepartureDisplay(dateStr: string, timeStr: string) {
  const date = dateStr?.trim() ?? "";
  const time = timeStr?.trim() ?? "";
  if (date && time) return `${date} ${time}`;
  return date || time;
}

function parseTimeToMinutes(timeStr: string): number | null {
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number.parseInt(m[1], 10);
  const min = Number.parseInt(m[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  return h * 60 + min;
}

function addOneCalendarDay(isoDate: string): string {
  const m = isoDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDate;
  const y = Number.parseInt(m[1], 10);
  const mo = Number.parseInt(m[2], 10) - 1;
  const day = Number.parseInt(m[3], 10);
  const d = new Date(Date.UTC(y, mo, day));
  d.setUTCDate(d.getUTCDate() + 1);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * JR cards only store one calendar date; when arrival clock time is earlier than departure
 * (e.g. night train), treat the arrival as the following day for display.
 */
function inferArrivalDateForDisplay(
  departureDate: string,
  departureTime: string,
  arrivalTime: string,
): string {
  const date = departureDate?.trim() ?? "";
  if (!date) return "";
  const dep = parseTimeToMinutes(departureTime);
  const arr = parseTimeToMinutes(arrivalTime);
  if (dep == null || arr == null) return date;
  if (arr < dep) return addOneCalendarDay(date);
  return date;
}

function combineDateAndTime(dateStr: string, timeStr: string) {
  const time = timeStr?.trim() ?? "";
  if (!time) return "";
  const date = dateStr?.trim() ?? "";
  return date ? `${date} ${time}` : time;
}

/**
 * Maps saved offline itinerary entries into unified timeline rows for the booking store.
 * Full entries are kept on `originalRawData` for debugging.
 */
export function buildItineraryItemsFromOfflineEntries(
  entries: OfflineItineraryEntry[],
): UnifiedTimelineItem[] {
  const out: UnifiedTimelineItem[] = [];
  const seenEntryIds = new Set<string>();
  for (const entry of entries) {
    if (isOfflineHotelItinerary(entry)) {
      if (seenEntryIds.has(entry.id)) continue;
      seenEntryIds.add(entry.id);
      const dest =
        [entry.firstPreference, entry.secondPreference]
          .map((x) => x?.trim())
          .filter(Boolean)
          .join(" · ") ||
        entry.accommodationCity ||
        "—";
      out.push({
        id: entry.id,
        type: "HOTEL",
        supplier: "OFFLINE",
        originName: entry.accommodationCity?.trim() || "—",
        destinationName: dest,
        departureTime: entry.checkIn,
        arrivalTime: entry.checkOut,
        status: "Pending",
        isNonArrange: false,
        originalRawData: entry,
      });
      continue;
    }
    if (isOfflineCarItinerary(entry)) {
      if (seenEntryIds.has(entry.id)) continue;
      seenEntryIds.add(entry.id);
      out.push({
        id: entry.id,
        type: "CAR",
        supplier: "OFFLINE",
        originName: entry.rentalCity,
        destinationName: entry.returnCity,
        departureTime: entry.rentalDateTime,
        arrivalTime: entry.returnDateTime,
        status: "Pending",
        isNonArrange: false,
        originalRawData: entry,
      });
      continue;
    }
    if (isOfflineFlightItinerary(entry)) {
      if (seenEntryIds.has(entry.id)) continue;
      seenEntryIds.add(entry.id);
      const d = entry.details;
      const departureTime = combineDepartureDisplay(
        d.flight_outbound_departureDate ?? "",
        d.flight_outbound_departureTime ?? "",
      );
      const arrivalTime = combineDateAndTime(
        d.flight_outbound_arrivalDate?.trim() ?? "",
        d.flight_outbound_arrivalTime ?? "",
      );
      out.push({
        id: entry.id,
        type: "FLIGHT",
        supplier: "OFFLINE",
        originName: d.flight_outbound_origin?.trim() || "—",
        destinationName: d.flight_outbound_destination?.trim() || "—",
        departureTime: departureTime || "—",
        arrivalTime: arrivalTime || "—",
        status: "Pending",
        isNonArrange: false,
        originalRawData: entry,
      });
      continue;
    }
    if (!("provider" in entry) || entry.provider !== "jr") continue;
    if (seenEntryIds.has(entry.id)) continue;
    seenEntryIds.add(entry.id);
    const d = entry.details;
    const type = jrTransportToTimelineType(d.jr_transportType);
    const departureTime = combineDepartureDisplay(
      d.jr_departureDate,
      d.jr_departureTime,
    );
    const arrivalDate = inferArrivalDateForDisplay(
      d.jr_departureDate,
      d.jr_departureTime,
      d.jr_arrivalTime,
    );
    const arrivalTime = combineDateAndTime(arrivalDate, d.jr_arrivalTime);

    if (d.jr_origin?.trim() && d.jr_destination?.trim()) {
      out.push({
        id: entry.id,
        type,
        supplier: "OFFLINE",
        originName: d.jr_origin,
        destinationName: d.jr_destination,
        departureTime,
        arrivalTime,
        status: "Pending",
        isNonArrange: d.jr_noReservationRequired,
        originalRawData: entry,
      });
    }

    // Return ticket fields are shown inside the JR confirmation details — do not add a second
    // timeline row per entry (avoids duplicate cards for a single offline JR itinerary).
  }
  return out;
}
