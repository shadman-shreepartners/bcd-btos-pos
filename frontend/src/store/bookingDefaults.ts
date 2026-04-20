import {
  defaultDomesticFormValues,
  type DomesticData,
} from "@/features/DomesticBooking/domesticBookingTypes";

export function buildDefaultBookingData(): DomesticData {
  return {
    ...defaultDomesticFormValues(),
    step: 0,
    name: "",
    email: "",
  };
}
