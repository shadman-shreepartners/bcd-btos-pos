import {
  allocateOfflineItineraryId,
  type OfflineCarFormSlice,
  type OfflineCarItineraryEntry,
} from "./types";

function toIsoFromDateAndTime(date: string, time: string): string {
  return new Date(`${date.trim()}T${time.trim()}`).toISOString();
}

export function transformCarItineraryPayload(
  values: OfflineCarFormSlice,
  existingId?: string | null,
): OfflineCarItineraryEntry {
  return {
    type: "offline_car",
    rentalDateTime: toIsoFromDateAndTime(
      values.car_rentalDate,
      values.car_rentalTime,
    ),
    rentalCity: values.car_rentalCity.trim(),
    returnDateTime: toIsoFromDateAndTime(
      values.car_returnDate,
      values.car_returnTime,
    ),
    returnCity: values.car_returnCity.trim(),
    numberOfCars: values.car_numberOfCars,
    rentalCarCompany: values.car_rentalCarCompany.trim(),
    carSize: values.car_carSize.trim(),
    driver: values.car_driver.trim(),
    remarks: values.car_remarks.trim(),
    id: allocateOfflineItineraryId(existingId),
  };
}
