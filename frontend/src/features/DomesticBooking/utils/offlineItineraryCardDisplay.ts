import type { LucideIcon } from "lucide-react";
import { Bus, Car, Hotel, Plane, Ship, Train } from "lucide-react";
import {
  isOfflineCarItinerary,
  isOfflineFlightItinerary,
  isOfflineHotelItinerary,
  type JrTransportType,
  type OfflineItineraryEntry,
} from "../offlineItinerary/types";

export type OfflineItineraryCardStyles = {
  itineraryBadgeRail: string;
};

function jrOfflineBadgeLabel(transport: JrTransportType): string {
  if (transport === "rail") return "RAILWAY (JR)";
  if (transport === "bus") return "BUS";
  return "FERRY";
}

function formatIsoLine(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function offlineItineraryCardDisplay(
  item: OfflineItineraryEntry,
  styles: OfflineItineraryCardStyles,
): {
  badgeLabel: string;
  badgeClass: string;
  titleLine: string;
  dateTimeLine: string;
  metaLine: string;
  Icon: LucideIcon;
} {
  if (isOfflineHotelItinerary(item)) {
    const city = item.accommodationCity?.trim() || "—";
    const titleLine = city.toLowerCase();
    const dateTimeLine = `${item.checkIn} → ${item.checkOut}`;
    const metaLine = [item.firstPreference, item.roomType]
      .map((x) => x?.trim())
      .filter(Boolean)
      .join(" • ");
    return {
      badgeLabel: "HOTEL",
      badgeClass: styles.itineraryBadgeRail,
      titleLine,
      dateTimeLine,
      metaLine: metaLine || "—",
      Icon: Hotel,
    };
  }

  if (isOfflineCarItinerary(item)) {
    const titleLine =
      `${item.rentalCity} → ${item.returnCity}`.toLowerCase() || "—";
    const dateTimeLine = `${formatIsoLine(item.rentalDateTime)} → ${formatIsoLine(item.returnDateTime)}`;
    const metaLine = [
      `${item.numberOfCars} car(s)`,
      item.carSize,
      item.driver,
      item.rentalCarCompany,
    ]
      .filter(Boolean)
      .join(" • ");
    return {
      badgeLabel: "CAR RENTAL",
      badgeClass: styles.itineraryBadgeRail,
      titleLine,
      dateTimeLine,
      metaLine: metaLine || "—",
      Icon: Car,
    };
  }

  if (isOfflineFlightItinerary(item)) {
    const d = item.details;
    const origin = d.flight_outbound_origin?.trim() ?? "";
    const dest = d.flight_outbound_destination?.trim() ?? "";
    const titleLine =
      origin && dest
        ? `${origin} → ${dest}`.toLowerCase()
        : (origin || dest || "—").toLowerCase();
    const dep = [d.flight_outbound_departureDate, d.flight_outbound_departureTime]
      .map((x) => x?.trim())
      .filter(Boolean)
      .join(" · ");
    const arr = [d.flight_outbound_arrivalDate, d.flight_outbound_arrivalTime]
      .map((x) => x?.trim())
      .filter(Boolean)
      .join(" · ");
    const dateTimeLine = [dep, arr].filter(Boolean).join(" → ") || "—";
    const trip = d.flight_tripType === "return" ? "Return" : "One-way";
    const metaLine = [trip, d.flight_outbound_airline, d.flight_outbound_flightNo]
      .map((x) => x?.trim())
      .filter(Boolean)
      .join(" • ") || "—";
    return {
      badgeLabel: "OFFLINE FLIGHT",
      badgeClass: styles.itineraryBadgeRail,
      titleLine,
      dateTimeLine,
      metaLine,
      Icon: Plane,
    };
  }

  if (isOfflineHotelItinerary(item)) {
    const prefs = [item.firstPreference, item.secondPreference]
      .map((x) => x?.trim())
      .filter(Boolean) as string[];
    const titleLine =
      (prefs.length ? prefs.join(" / ") : item.accommodationCity)?.toLowerCase() ||
      "—";
    const dateTimeLine = `${item.checkIn} → ${item.checkOut}`;
    const metaLine = [
      item.accommodationCity,
      item.roomType,
      `${item.roomCount} room(s)`,
      item.amenities,
    ]
      .filter(Boolean)
      .join(" • ");
    return {
      badgeLabel: "HOTEL",
      badgeClass: styles.itineraryBadgeRail,
      titleLine,
      dateTimeLine,
      metaLine: metaLine || "—",
      Icon: Hotel,
    };
  }

  const d = item.details;
  const t = item.jrTransportType ?? d.jr_transportType;
  const origin = d.jr_origin?.trim() ?? "";
  const dest = d.jr_destination?.trim() ?? "";
  const titleLine =
    origin && dest
      ? `${origin} -> ${dest}`.toLowerCase()
      : (origin || dest || "—").toLowerCase();
  const dateTimeLine = `${item.displayDate} • Dep ${item.departureTime} - Arr ${item.arrivalTime}`;
  const metaParts = [d.jr_trainName, d.jr_trainNo]
    .map((x) => x?.trim())
    .filter(Boolean) as string[];
  const seats = [d.jr_seatPreference1, d.jr_seatPreference2]
    .map((x) => x?.trim())
    .filter(Boolean) as string[];
  const metaLine = [...metaParts, ...seats].join(" • ") || "—";
  const Icon: LucideIcon = t === "bus" ? Bus : t === "ship" ? Ship : Train;
  return {
    badgeLabel: jrOfflineBadgeLabel(t),
    badgeClass: styles.itineraryBadgeRail,
    titleLine,
    dateTimeLine,
    metaLine,
    Icon,
  };
}
