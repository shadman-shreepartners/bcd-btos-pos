import type { DomesticData } from "../domesticBookingTypes";
import {
  type BookingConfirmationExtras,
  formatBookingConfirmationNotes,
  mergeJrRemarksWithConfirmation,
} from "./bookingConfirmationExtras";
import {
  isTravelArrangerApplicant,
  resolveCanonicalMeetingNumber,
} from "./contactFromFormValues";
import type {
  DomesticBookingApplicant,
  DomesticBookingGender,
  DomesticBookingItineraryPayload,
  DomesticBookingJrDeliveryConfirmationPayload,
  DomesticBookingPayload,
  DomesticBookingTripPurpose,
} from "@/services/api/bookingService";
import {
  isOfflineCarItinerary,
  isOfflineFlightItinerary,
  isOfflineHotelItinerary,
  type JrOfflineItineraryFormState,
} from "../offlineItinerary/types";

/**
 * Booking create payload — transform rules (until backend supplies full profiles):
 *
 * 1) Applicant **Traveller (self)**  
 *    Use any contact / identity fields present on `DomesticData`; for anything missing or invalid
 *    (email format, phone, names, gender), fall back to `STATIC_TRAVELLER_DEFAULTS`.
 *
 * 2) Applicant **Travel arranger**  
 *    Root `email` / `telephone` are **always** the static applicant placeholders (same defaults as
 *    traveller), not the APPLICANT INFORMATION form values.
 *
 *    2.1 **Existing traveller** — The UI and schema allow only one row in `existingTravelers`;
 *        `travellerId` is parsed from `existingTravelers[0].id`. Other traveller identity fields use
 *        static defaults.
 *
 *    2.2 **Guest traveller** — Japanese + passport names, `gender`, and `travellerType` come from
 *        the guest form (`first_name`/`last_name`, `firstName`/`last_name_eng`, `gender`,
 *        `travell_type_guest`), with fallbacks only where needed for API-safe strings.
 */

function deriveJrTicketTypeForApi(d: JrOfflineItineraryFormState): string {
  const explicit = d.jr_ticketType?.trim();
  if (explicit) return explicit;
  const ro = d.jr_returnOrigin?.trim();
  const rd = d.jr_returnDestination?.trim();
  if (ro && rd) return "Round-trip";
  return "One-way";
}

/** Fallback when the UI does not collect a value or the value fails API validation. */
const STATIC_TRAVELLER_DEFAULTS = {
  email: "domestic-self-traveller-placeholder@bcd.travel",
  telephone: "09000000000",
  firstName: "Taro",
  lastName: "Yamada",
  japaneseFirstName: "太郎",
  japaneseLastName: "山田",
  gender: "male" as const satisfies DomesticBookingGender,
} as const;

const EMAIL_FALLBACK = "domestic-booking-placeholder@bcd.travel";

function mapApplicant(bookingData: DomesticData): DomesticBookingApplicant {
  const a = bookingData.applicant;
  if (
    a === "travelArranger" ||
    a === "travel-arranger" ||
    a === "arranger"
  ) {
    return "travelArranger";
  }
  return "traveller";
}

function mapTripPurpose(bookingData: DomesticData): DomesticBookingTripPurpose {
  const raw =
    bookingData.travell_type ||
    bookingData.trip_purpose_existing ||
    bookingData.travell_type_guest ||
    bookingData.trip_purpose ||
    "";
  const s = String(raw).toLowerCase();
  if (s.includes("external")) return "external";
  return "internal";
}

function parseTravellerId(bookingData: DomesticData): number {
  const raw = bookingData.existingTravelers?.[0]?.id;
  if (raw == null || raw === "") return 0;
  const s = String(raw).trim();
  const digitsOnly = s.replace(/\D/g, "");
  if (digitsOnly.length > 0) {
    const n = Number.parseInt(digitsOnly, 10);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : 0;
}

function normalizeGender(raw: string | undefined): DomesticBookingGender {
  const s = (raw ?? "").toLowerCase().trim();
  if (s === "female" || s === "f") return "female";
  return "male";
}

function ensureApiEmail(raw: string | undefined): string {
  const t = raw?.trim() ?? "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return t;
  return EMAIL_FALLBACK;
}

function buildFullPassportName(first: string, last: string): string {
  return [first, last]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ")
    .toUpperCase();
}

function pickTelephone(raw: string | undefined, fallback: string): string {
  const t = (raw ?? "").trim();
  return t.length > 0 ? t : fallback;
}

function buildSelfTravellerPayload(bookingData: DomesticData): {
  firstName: string;
  lastName: string;
  japaneseFirstName: string;
  japaneseLastName: string;
  fullNameAsPerPassport: string;
  email: string;
  telephone: string;
  gender: DomesticBookingGender;
  travellerId: number;
  travellerType: string;
} {
  const d = STATIC_TRAVELLER_DEFAULTS;
  const email = ensureApiEmail(bookingData.applicant_email || bookingData.email);
  const telephone = pickTelephone(bookingData.contact_no, d.telephone);

  const firstName =
    (bookingData.firstName || bookingData.first_name || "").trim() || d.firstName;
  const lastName =
    (bookingData.last_name_eng || bookingData.last_name || "").trim() || d.lastName;
  const japaneseFirstName =
    (bookingData.first_name || "").trim() || d.japaneseFirstName;
  const japaneseLastName =
    (bookingData.last_name || "").trim() || d.japaneseLastName;

  let fullNameAsPerPassport = buildFullPassportName(firstName, lastName);
  if (!fullNameAsPerPassport.trim()) {
    fullNameAsPerPassport = buildFullPassportName(d.firstName, d.lastName);
  }

  const gender =
    bookingData.gender === "male" || bookingData.gender === "female"
      ? bookingData.gender
      : normalizeGender(bookingData.gender);

  return {
    firstName,
    lastName,
    japaneseFirstName,
    japaneseLastName,
    fullNameAsPerPassport,
    email,
    telephone,
    gender,
    travellerId: 0,
    travellerType: "",
  };
}

function buildArrangerGuestPayload(bookingData: DomesticData): {
  firstName: string;
  lastName: string;
  japaneseFirstName: string;
  japaneseLastName: string;
  fullNameAsPerPassport: string;
  email: string;
  telephone: string;
  gender: DomesticBookingGender;
  travellerId: number;
  travellerType: string;
} {
  const d = STATIC_TRAVELLER_DEFAULTS;
  const firstName =
    (bookingData.firstName || bookingData.first_name || "").trim() || d.firstName;
  const lastName =
    (bookingData.last_name_eng || bookingData.last_name || "").trim() || d.lastName;
  const japaneseFirstName =
    (bookingData.first_name || "").trim() || d.japaneseFirstName;
  const japaneseLastName =
    (bookingData.last_name || "").trim() || d.japaneseLastName;

  let fullNameAsPerPassport = buildFullPassportName(firstName, lastName);
  if (!fullNameAsPerPassport.trim()) {
    fullNameAsPerPassport = buildFullPassportName(d.firstName, d.lastName);
  }

  const travellerType = (bookingData.travell_type_guest ?? "").trim() || "guest";

  return {
    firstName,
    lastName,
    japaneseFirstName,
    japaneseLastName,
    fullNameAsPerPassport,
    email: d.email,
    telephone: d.telephone,
    gender: normalizeGender(bookingData.gender),
    travellerId: 0,
    travellerType,
  };
}

function buildArrangerExistingPayload(bookingData: DomesticData): {
  firstName: string;
  lastName: string;
  japaneseFirstName: string;
  japaneseLastName: string;
  fullNameAsPerPassport: string;
  email: string;
  telephone: string;
  gender: DomesticBookingGender;
  travellerId: number;
  travellerType: string;
} {
  const d = STATIC_TRAVELLER_DEFAULTS;
  return {
    firstName: d.firstName,
    lastName: d.lastName,
    japaneseFirstName: d.japaneseFirstName,
    japaneseLastName: d.japaneseLastName,
    fullNameAsPerPassport: buildFullPassportName(d.firstName, d.lastName),
    email: d.email,
    telephone: d.telephone,
    gender: d.gender,
    travellerId: parseTravellerId(bookingData),
    travellerType: "",
  };
}

function buildTravellerBlock(bookingData: DomesticData): {
  firstName: string;
  lastName: string;
  japaneseFirstName: string;
  japaneseLastName: string;
  fullNameAsPerPassport: string;
  email: string;
  telephone: string;
  gender: DomesticBookingGender;
  travellerId: number;
  travellerType: string;
} {
  if (!isTravelArrangerApplicant(bookingData.applicant)) {
    return buildSelfTravellerPayload(bookingData);
  }
  if (bookingData.travellerSource === "guest") {
    return buildArrangerGuestPayload(bookingData);
  }
  return buildArrangerExistingPayload(bookingData);
}

function buildJrDeliveryConfirmationPayload(
  confirmation: BookingConfirmationExtras | undefined,
): DomesticBookingJrDeliveryConfirmationPayload | undefined {
  if (!confirmation) return undefined;
  const additionalRecipients =
    confirmation.additionalEmails?.map((r) => ({
      name: (r.name ?? "").trim(),
      email: (r.email ?? "").trim(),
    })) ?? [];
  const deliveryMethod = confirmation.deliveryMethod?.trim() ?? "";
  const expectedDeliveryDate = confirmation.deliveryDate?.trim() ?? "";
  const timeOfDay = confirmation.deliveryTime?.trim() ?? "";
  const remarks = confirmation.deliveryRemarks?.trim() ?? "";
  const hasData =
    deliveryMethod ||
    expectedDeliveryDate ||
    timeOfDay ||
    remarks ||
    additionalRecipients.some((r) => r.name || r.email);
  if (!hasData) return undefined;
  return {
    deliveryMethod,
    expectedDeliveryDate,
    timeOfDay,
    remarks,
    additionalRecipients,
  };
}

function localDateTimeForParsing(date: string, time: string): string {
  const t = time.trim();
  const hasSeconds = /^\d{1,2}:\d{2}:\d{2}/.test(t);
  const clock = hasSeconds ? t : `${t}:00`;
  return `${date.trim()}T${clock}`;
}

function toIsoDate(date?: string, time?: string): string {
  const dStr = date?.trim() ?? "";
  const tStr = time?.trim() ?? "";
  if (!dStr || !tStr) return "";
  const parsed = new Date(localDateTimeForParsing(dStr, tStr));
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

/** When only one endpoint is known, assume ~1h block; API requires arrival strictly after departure. */
const FLIGHT_LEG_PLACEHOLDER_DURATION_MS = 60 * 60 * 1000;

function addMsToIso(iso: string, ms: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Date(d.getTime() + ms).toISOString();
}

/**
 * Produces valid ISO strings for both endpoints. Fills a missing side with a 1h offset from
 * the known side. If both exist but arrival is not after departure, bumps arrival forward.
 */
function normalizeFlightLegIsoOrder(
  departureIso: string,
  arrivalIso: string,
): { departureDateTime: string; arrivalDateTime: string } {
  let dep = departureIso.trim();
  let arr = arrivalIso.trim();

  if (!dep && !arr) {
    return { departureDateTime: "", arrivalDateTime: "" };
  }
  if (dep && !arr) {
    return {
      departureDateTime: dep,
      arrivalDateTime: addMsToIso(dep, FLIGHT_LEG_PLACEHOLDER_DURATION_MS),
    };
  }
  if (!dep && arr) {
    return {
      departureDateTime: addMsToIso(arr, -FLIGHT_LEG_PLACEHOLDER_DURATION_MS),
      arrivalDateTime: arr,
    };
  }

  const tDep = new Date(dep).getTime();
  const tArr = new Date(arr).getTime();
  if (Number.isNaN(tDep) || Number.isNaN(tArr)) {
    return { departureDateTime: dep, arrivalDateTime: arr };
  }
  if (tArr <= tDep) {
    arr = addMsToIso(dep, FLIGHT_LEG_PLACEHOLDER_DURATION_MS);
  }
  return { departureDateTime: dep, arrivalDateTime: arr };
}

function flightOptionalStrings(seat?: string, remarks?: string) {
  const seatT = seat?.trim() ?? "";
  const remT = remarks?.trim() ?? "";
  return {
    ...(seatT ? { seatPreference: seatT } : {}),
    ...(remT ? { remarks: remT } : {}),
  };
}

export function buildBookingCreatePayload(
  bookingData: DomesticData,
  confirmation?: BookingConfirmationExtras,
): DomesticBookingPayload {
  const applicant = mapApplicant(bookingData);
  const tripPurpose = mapTripPurpose(bookingData);
  const meetingNo = resolveCanonicalMeetingNumber(bookingData);
  const {
    firstName,
    lastName,
    japaneseFirstName,
    japaneseLastName,
    fullNameAsPerPassport,
    email,
    telephone,
    gender,
    travellerId,
    travellerType,
  } = buildTravellerBlock(bookingData);

  const confirmationNotes = formatBookingConfirmationNotes(
    bookingData,
    confirmation,
  );

  const itineraries: DomesticBookingItineraryPayload[] = [];
  const seenJrEntryIds = new Set<string>();
  const seenCarEntryIds = new Set<string>();
  const seenHotelEntryIds = new Set<string>();
  const seenFlightEntryIds = new Set<string>();
  let mergedConfirmationIntoJr = false;
  let attachedJrDeliveryStruct = false;

  if (Array.isArray(bookingData.offlineItineraries)) {
    for (const entry of bookingData.offlineItineraries) {
      if (isOfflineHotelItinerary(entry)) {
        if (seenHotelEntryIds.has(entry.id)) continue;
        seenHotelEntryIds.add(entry.id);
        itineraries.push({
          type: "offline_hotel",
          checkIn: entry.checkIn,
          checkOut: entry.checkOut,
          accommodationCity: entry.accommodationCity,
          firstPreference: entry.firstPreference,
          secondPreference: entry.secondPreference,
          budgetMin: entry.budgetMin ?? 0,
          budgetMax: entry.budgetMax ?? 0,
          roomCondition: entry.roomCondition,
          amenities: entry.amenities,
          roomCount: entry.roomCount,
          roomType: entry.roomType,
          remarks: entry.remarks,
        });
        continue;
      }
      if (isOfflineCarItinerary(entry)) {
        if (seenCarEntryIds.has(entry.id)) continue;
        seenCarEntryIds.add(entry.id);
        itineraries.push({
          type: "offline_car",
          rentalDateTime: entry.rentalDateTime,
          rentalCity: entry.rentalCity,
          returnDateTime: entry.returnDateTime,
          returnCity: entry.returnCity,
          numberOfCars: entry.numberOfCars,
          rentalCarCompany: entry.rentalCarCompany,
          carSize: entry.carSize,
          driver: entry.driver,
          remarks: entry.remarks,
        });
        continue;
      }
      if (isOfflineFlightItinerary(entry)) {
        if (seenFlightEntryIds.has(entry.id)) continue;
        seenFlightEntryIds.add(entry.id);
        const d = entry.details;
        const isReturn = d.flight_tripType === "return";
        const tripType = (d.flight_tripType || "oneway") as "oneway" | "return";
        const outboundTimes = normalizeFlightLegIsoOrder(
          toIsoDate(
            d.flight_outbound_departureDate,
            d.flight_outbound_departureTime,
          ),
          toIsoDate(
            d.flight_outbound_arrivalDate,
            d.flight_outbound_arrivalTime,
          ),
        );
        itineraries.push({
          type: "offline_flight",
          tripType,
          isReturn: false,
          departureDateTime: outboundTimes.departureDateTime,
          departureCity: d.flight_outbound_origin || "",
          arrivalDateTime: outboundTimes.arrivalDateTime,
          arrivalCity: d.flight_outbound_destination || "",
          airline: d.flight_outbound_airline || "",
          flightNumber: d.flight_outbound_flightNo || "",
          cabinClass: d.flight_outbound_cabinClass || "economy",
          ...flightOptionalStrings(d.flight_seatPreference, d.flight_remarks),
        });
        if (isReturn) {
          const returnTimes = normalizeFlightLegIsoOrder(
            toIsoDate(
              d.flight_return_departureDate,
              d.flight_return_departureTime,
            ),
            toIsoDate(
              d.flight_return_arrivalDate,
              d.flight_return_arrivalTime,
            ),
          );
          itineraries.push({
            type: "offline_flight",
            tripType: "return",
            isReturn: true,
            departureDateTime: returnTimes.departureDateTime,
            departureCity: d.flight_return_origin || "",
            arrivalDateTime: returnTimes.arrivalDateTime,
            arrivalCity: d.flight_return_destination || "",
            airline: d.flight_return_airline || "",
            flightNumber: d.flight_return_flightNo || "",
            cabinClass: d.flight_return_cabinClass || "economy",
            ...flightOptionalStrings(d.flight_seatPreference, d.flight_remarks),
          });
        }
        continue;
      }
      if (entry.provider !== "jr") continue;
      if (seenJrEntryIds.has(entry.id)) continue;
      seenJrEntryIds.add(entry.id);
      const details = entry.details;
      const attachConfirmation =
        confirmationNotes.length > 0 && !mergedConfirmationIntoJr;
      if (attachConfirmation) mergedConfirmationIntoJr = true;
      const jrDeliveryStruct =
        !attachedJrDeliveryStruct
          ? buildJrDeliveryConfirmationPayload(confirmation)
          : undefined;
      if (jrDeliveryStruct) attachedJrDeliveryStruct = true;
      itineraries.push({
        type: "offline_jr",
        transportationType: details.jr_transportType,
        ticketType: deriveJrTicketTypeForApi(details),
        departureDate: details.jr_departureDate,
        origin: details.jr_origin,
        destination: details.jr_destination,
        departureTime: details.jr_departureTime,
        arrivalTime: details.jr_arrivalTime,
        trainName: details.jr_trainName,
        trainNo: details.jr_trainNo,
        seats: details.jr_seats?.trim() || undefined,
        ticketOrigin: details.jr_ticketOrigin ?? details.jr_returnOrigin,
        ticketDestination:
          details.jr_ticketDestination ?? details.jr_returnDestination,
        seatPreference: [details.jr_seatPreference1, details.jr_seatPreference2]
          .filter(Boolean)
          .join(", "),
        seatType: details.jr_seatType?.trim() ?? "",
        remarks: attachConfirmation
          ? mergeJrRemarksWithConfirmation(details.jr_remarks, confirmationNotes)
          : details.jr_remarks,
        ...(jrDeliveryStruct
          ? { jrDeliveryConfirmation: jrDeliveryStruct }
          : {}),
      });
    }
  }

  return {
    applicant,
    firstName,
    lastName,
    telephone,
    extensionNo: "",
    email,
    travellerId,
    japaneseFirstName,
    japaneseLastName,
    fullNameAsPerPassport,
    gender,
    travellerType,
    tripPurpose,
    meetingNo,
    itineraries,
    ...(confirmationNotes.length > 0 && !mergedConfirmationIntoJr
      ? { bookingRemarks: confirmationNotes }
      : {}),
  };
}
