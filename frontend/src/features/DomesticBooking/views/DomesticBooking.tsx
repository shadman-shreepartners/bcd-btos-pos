import { Formik, useFormikContext } from "formik";
import { useEffect } from "react";
import type {
  DomesticBookingFormValues,
  DomesticData,
} from "../domesticBookingTypes";
import { domesticBookingValidationSchema } from "../domesticBookingSchema";
import { useBookingStore } from "@/store/useBookingStore";
import {
  deriveContactForDomesticData,
  resolveCanonicalMeetingNumber,
} from "../utils/contactFromFormValues";
import { normalizeApplicantForForm } from "../utils/normalizeApplicantForForm";
import { buildItineraryItemsFromOfflineEntries } from "../utils/buildItineraryTimelineFromOffline";
import DomesticBookingFormBody from "./DomesticBookingFormBody";

type DomesticBookingProps = {
  initialData: DomesticData;
  onSubmit: () => void;
  onDataChange: (data: DomesticData) => void;
};

function formValuesFromDomesticData(
  data: DomesticData,
): DomesticBookingFormValues {
  return {
    applicant: normalizeApplicantForForm(data.applicant),
    meeting_number: data.meeting_number,
    travell_type: data.travell_type,
    applicant_name: data.applicant_name || data.name,
    contact_no: data.contact_no,
    applicant_email: data.applicant_email || data.email,
    travellerSource: data.travellerSource,
    existingTravelers: (data.existingTravelers ?? []).slice(0, 1),
    meeting_number_existing: data.meeting_number_existing,
    trip_purpose_existing: data.trip_purpose_existing,
    last_name: data.last_name,
    first_name: data.first_name,
    last_name_eng: data.last_name_eng,
    firstName: data.firstName,
    gender: data.gender,
    travell_type_guest: data.travell_type_guest,
    meeting_number_guest: data.meeting_number_guest,
    trip_purpose: data.trip_purpose,
    offlineItineraries: data.offlineItineraries ?? [],
  };
}

function FormikZustandSync() {
  const { values } = useFormikContext<DomesticBookingFormValues>();

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      useBookingStore.getState().setBookingData((prev) => ({
        ...prev,
        ...values,
        meeting_number: resolveCanonicalMeetingNumber(values),
      }));
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [values]);

  return null;
}

const DomesticBooking = ({
  initialData,
  onSubmit,
  onDataChange,
}: DomesticBookingProps) => (
  <Formik<DomesticBookingFormValues>
    initialValues={formValuesFromDomesticData(initialData)}
    enableReinitialize
    validateOnMount
    validationSchema={domesticBookingValidationSchema}
    onSubmit={(values) => {
      const prevItems = useBookingStore.getState().itineraryItems;
      const preservedOnline = prevItems.filter((item) => item.supplier !== "OFFLINE");
      const fromOffline = buildItineraryItemsFromOfflineEntries(
        values.offlineItineraries,
      );
      useBookingStore
        .getState()
        .setItineraryItems([...fromOffline, ...preservedOnline]);

      const { name, email } = deriveContactForDomesticData(values);
      onDataChange({
        ...values,
        meeting_number: resolveCanonicalMeetingNumber(values),
        step: 1,
        name,
        email,
      });
      onSubmit();
    }}
  >
    <>
      <FormikZustandSync />
      <DomesticBookingFormBody />
    </>
  </Formik>
);

export default DomesticBooking;
