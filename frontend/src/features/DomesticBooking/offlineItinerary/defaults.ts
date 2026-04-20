import type {
  OfflineItineraryFormState,
  OfflineItineraryProviderId,
} from "./types";

export const emptyOfflineItineraryFormState =
  (): OfflineItineraryFormState => ({
    jr_noReservationRequired: false,
    jr_transportType: "rail",
    jr_transportationType: "",
    jr_ticketType: "",
    jr_departureDate: "",
    jr_origin: "",
    jr_destination: "",
    jr_departureTime: "09:00",
    jr_arrivalTime: "17:00",
    jr_trainName: "",
    jr_trainNo: "",
    jr_seats: "",
    jr_seatType: "",
    jr_returnOrigin: "",
    jr_returnDestination: "",
    jr_ticketOrigin: "",
    jr_ticketDestination: "",
    jr_seatPreference1: "",
    jr_seatPreference2: "",
    jr_remarks: "",
    checkIn: "",
    checkOut: "",
    accommodationCity: "",
    firstPreference: "",
    secondPreference: "",
    budgetMin: null,
    budgetMax: null,
    roomCondition: "Non-smoking",
    amenities: "Breakfast",
    roomCount: 1,
    roomType: "1 Bed",
    car_rentalDate: "",
    car_rentalTime: "09:00",
    car_rentalCity: "",
    car_returnDate: "",
    car_returnTime: "18:00",
    car_returnCity: "",
    car_numberOfCars: 1,
    car_rentalCarCompany: "",
    car_carSize: "",
    car_driver: "",
    car_remarks: "",
    remarks: "",
  });

/** Seeded on flight offline form so Yup `required` matches visible select defaults. */
const FLIGHT_OFFLINE_FORM_DEFAULTS: Partial<OfflineItineraryFormState> = {
  flight_tripType: "return",
  flight_outbound_cabinClass: "economy",
  flight_return_cabinClass: "economy",
};

export function mergeOfflineFormInitial(
  _provider: OfflineItineraryProviderId,
  patch?: Partial<OfflineItineraryFormState> | null,
): OfflineItineraryFormState {
  const base = emptyOfflineItineraryFormState();
  if (_provider === "flight") {
    const merged = {
      ...base,
      ...FLIGHT_OFFLINE_FORM_DEFAULTS,
      ...(patch ?? {}),
    };
    return {
      ...merged,
      flight_tripType: merged.flight_tripType ?? "return",
      flight_outbound_cabinClass:
        merged.flight_outbound_cabinClass?.trim() || "economy",
      flight_return_cabinClass:
        merged.flight_return_cabinClass?.trim() || "economy",
    };
  }
  if (!patch) return base;
  return { ...base, ...patch };
}
