import * as Yup from "yup";
import {
  DATE_MUST_BE_TODAY_OR_FUTURE,
  isIsoDateOnOrAfterToday,
} from "../utils/todayDateString";
import type { JrTransportType, OfflineItineraryProviderId } from "./types";

const req = "This field is required";
const str = () => Yup.string().trim();

const dateNotPast = (v: string | undefined) =>
  !v?.trim() || isIsoDateOnOrAfterToday(v.trim());

const jrRailSchema = Yup.object({
  jr_departureDate: str()
    .required(req)
    .test("notPast", DATE_MUST_BE_TODAY_OR_FUTURE, dateNotPast),
  jr_origin: str().required(req),
  jr_destination: str().required(req),
  jr_departureTime: str().required(req),
  jr_arrivalTime: str().required(req),
  jr_seats: str().required(req),
  jr_returnOrigin: str().required(req),
  jr_returnDestination: str().required(req),
  jr_seatPreference1: str().required(req),
  jr_seatPreference2: str().required(req),
});

const jrBusShipSchema = Yup.object({
  jr_departureDate: str()
    .required(req)
    .test("notPast", DATE_MUST_BE_TODAY_OR_FUTURE, dateNotPast),
  jr_origin: str().required(req),
  jr_destination: str().required(req),
  jr_departureTime: str().required(req),
  jr_arrivalTime: str().required(req),
  jr_seats: str().required(req),
  jr_seatPreference1: str().required(req),
  jr_seatPreference2: str().required(req),
});

const invalidDateTime = "Invalid date or time";

const hotelOfflineSchema = Yup.object({
  checkIn: str()
    .required(req)
    .test("validCheckIn", invalidDateTime, (v) => {
      if (!v?.trim()) return true;
      return !Number.isNaN(new Date(v.trim()).getTime());
    })
    .test("notPast", DATE_MUST_BE_TODAY_OR_FUTURE, dateNotPast),
  checkOut: str()
    .required(req)
    .test("notPast", DATE_MUST_BE_TODAY_OR_FUTURE, dateNotPast)
    .test("checkOutValid", function (v) {
      if (!v?.trim()) return true;
      const out = new Date(v.trim()).getTime();
      if (Number.isNaN(out))
        return this.createError({ message: invalidDateTime });
      const ci = String(this.parent.checkIn ?? "").trim();
      if (!ci) return true;
      const inn = new Date(ci).getTime();
      if (Number.isNaN(inn)) return true;
      if (out <= inn) {
        return this.createError({ message: "Check-out must be after check-in" });
      }
      return true;
    }),
  accommodationCity: str().required(req),
  firstPreference: str(),
  secondPreference: str(),
  budgetMin: Yup.number()
    .nullable()
    .required(req)
    .min(0, "Must be 0 or greater"),
  budgetMax: Yup.number()
    .nullable()
    .required(req)
    .min(0, "Must be 0 or greater")
    .test(
      "budgetRange",
      "Maximum must be greater than or equal to minimum",
      function (v) {
        const min = this.parent.budgetMin;
        if (v == null || min == null) return true;
        return v >= min;
      },
    ),
  roomCondition: str().required(req),
  amenities: str().required(req),
  roomCount: Yup.number()
    .typeError(req)
    .integer()
    .required(req)
    .min(1, "At least one room is required"),
  roomType: str().required(req),
  remarks: str().max(1000, "Max 1000 characters"),
});

const hasFlightDateTimePair = (date?: string, time?: string) =>
  Boolean(String(date ?? "").trim() && String(time ?? "").trim());

const flightOfflineSchema = Yup.object({
  flight_tripType: Yup.mixed<"oneway" | "return">()
    .oneOf(["oneway", "return"])
    .required(req),
  flight_outbound_origin: str().required(req),
  flight_outbound_destination: str().required(req),
  flight_outbound_airline: str().required(req),
  flight_outbound_flightNo: str().required(req),
  flight_outbound_cabinClass: str().required(req),
  flight_seatPreference: str().optional(),
  flight_remarks: str().max(1000, "Max 1000 characters").optional(),
  flight_outbound_departureDate: str().test(
    "notPast",
    DATE_MUST_BE_TODAY_OR_FUTURE,
    dateNotPast,
  ),
  flight_outbound_departureTime: str().optional(),
  flight_outbound_arrivalDate: str().test(
    "notPast",
    DATE_MUST_BE_TODAY_OR_FUTURE,
    dateNotPast,
  ),
  flight_outbound_arrivalTime: str().optional(),
  flight_return_origin: str().optional(),
  flight_return_destination: str().optional(),
  flight_return_airline: str().optional(),
  flight_return_flightNo: str().optional(),
  flight_return_cabinClass: str().optional(),
  flight_return_departureDate: str().test(
    "notPast",
    DATE_MUST_BE_TODAY_OR_FUTURE,
    dateNotPast,
  ),
  flight_return_departureTime: str().optional(),
  flight_return_arrivalDate: str().test(
    "notPast",
    DATE_MUST_BE_TODAY_OR_FUTURE,
    dateNotPast,
  ),
  flight_return_arrivalTime: str().optional(),
})
  .test(
    "outboundSchedule",
    "Enter outbound departure or arrival date and time",
    (v) =>
      hasFlightDateTimePair(
        v.flight_outbound_departureDate,
        v.flight_outbound_departureTime,
      ) ||
      hasFlightDateTimePair(
        v.flight_outbound_arrivalDate,
        v.flight_outbound_arrivalTime,
      ),
  )
  .test("returnFields", function (v) {
    if (v.flight_tripType !== "return") return true;
    if (!String(v.flight_return_origin ?? "").trim()) {
      return this.createError({
        path: "flight_return_origin",
        message: req,
      });
    }
    if (!String(v.flight_return_destination ?? "").trim()) {
      return this.createError({
        path: "flight_return_destination",
        message: req,
      });
    }
    if (!String(v.flight_return_airline ?? "").trim()) {
      return this.createError({
        path: "flight_return_airline",
        message: req,
      });
    }
    if (!String(v.flight_return_flightNo ?? "").trim()) {
      return this.createError({
        path: "flight_return_flightNo",
        message: req,
      });
    }
    if (!String(v.flight_return_cabinClass ?? "").trim()) {
      return this.createError({
        path: "flight_return_cabinClass",
        message: req,
      });
    }
    const retOk =
      hasFlightDateTimePair(
        v.flight_return_departureDate,
        v.flight_return_departureTime,
      ) ||
      hasFlightDateTimePair(
        v.flight_return_arrivalDate,
        v.flight_return_arrivalTime,
      );
    if (!retOk) {
      return this.createError({
        path: "flight_return_departureDate",
        message: "Enter return departure or arrival date and time",
      });
    }
    return true;
  });

const carOfflineSchema = Yup.object({
  car_rentalDate: str()
    .required(req)
    .test("notPast", DATE_MUST_BE_TODAY_OR_FUTURE, dateNotPast)
    .test("rentalDt", invalidDateTime, function (v) {
      const time = String(this.parent.car_rentalTime ?? "");
      if (!v?.trim() || !time.trim()) return true;
      return !Number.isNaN(new Date(`${v.trim()}T${time.trim()}`).getTime());
    }),
  car_rentalTime: str().required(req),
  car_rentalCity: str().required(req),
  car_returnDate: str()
    .required(req)
    .test("notPast", DATE_MUST_BE_TODAY_OR_FUTURE, dateNotPast)
    .test("returnDt", invalidDateTime, function (v) {
      const time = String(this.parent.car_returnTime ?? "");
      if (!v?.trim() || !time.trim()) return true;
      return !Number.isNaN(new Date(`${v.trim()}T${time.trim()}`).getTime());
    }),
  car_returnTime: str().required(req),
  car_returnCity: str().required(req),
  car_numberOfCars: Yup.number()
    .typeError(req)
    .required(req)
    .min(1, "At least one car is required"),
  car_rentalCarCompany: str(),
  car_carSize: str().required(req),
  car_driver: str().required(req),
  car_remarks: str().max(1000, "Max 1000 characters"),
});

export function getOfflineItineraryValidationSchema(
  provider: OfflineItineraryProviderId,
  jrTransportType: JrTransportType,
) {
  if (provider === "car") return carOfflineSchema;
  if (provider === "hotel") return hotelOfflineSchema;
  if (provider === "flight") return flightOfflineSchema;
  if (provider !== "jr") {
    return Yup.object({});
  }
  return jrTransportType === "rail" ? jrRailSchema : jrBusShipSchema;
}
