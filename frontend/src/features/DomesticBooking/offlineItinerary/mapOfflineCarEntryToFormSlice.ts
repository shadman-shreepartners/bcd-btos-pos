import type {
  OfflineCarItineraryEntry,
  OfflineItineraryFormState,
} from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

function localDateTimeFromIso(iso: string): { date: string; time: string } {
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Hydrates car form fields from a persisted offline_car row (ISO → local date/time inputs). */
export function mapOfflineCarEntryToFormSlice(
  entry: OfflineCarItineraryEntry,
): Partial<OfflineItineraryFormState> {
  const rental = localDateTimeFromIso(entry.rentalDateTime);
  const ret = localDateTimeFromIso(entry.returnDateTime);
  return {
    car_rentalDate: rental.date,
    car_rentalTime: rental.time || "09:00",
    car_rentalCity: entry.rentalCity ?? "",
    car_returnDate: ret.date,
    car_returnTime: ret.time || "18:00",
    car_returnCity: entry.returnCity ?? "",
    car_numberOfCars: entry.numberOfCars,
    car_rentalCarCompany: entry.rentalCarCompany ?? "",
    car_carSize: entry.carSize ?? "",
    car_driver: entry.driver ?? "",
    car_remarks: entry.remarks ?? "",
  };
}
