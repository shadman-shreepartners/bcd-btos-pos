import React, { useMemo } from "react";
import { useFormik } from "formik";
import { Box, Button, Typography } from "@mui/material";
import * as Yup from "yup";
import {
  buildOfflineFlightItineraryEntry,
  buildOfflineHotelItineraryEntry,
  buildOfflineItineraryEntry,
  type OfflineItineraryEntry,
  type OfflineItineraryFormState,
  type OfflineItineraryProviderId,
} from "../../offlineItinerary/types";
import { mergeOfflineFormInitial } from "../../offlineItinerary/defaults";
import { getOfflineItineraryValidationSchema } from "../../offlineItinerary/schema";
import { transformCarItineraryPayload } from "../../offlineItinerary/transformCarItineraryPayload";
import styles from "../styles/DomesticOfflineBookingForms.module.scss";
import CarOfflineBookingForm from "./forms/CarOfflineBookingForm";
import FlightOfflineBookingForm, {
  type FlightOfflineBookingFormProps,
} from "./forms/FlightOfflineBookingForm";
import HotelOfflineBookingForm from "./forms/HotelOfflineBookingForm";
import JrOfflineBookingForm, {
  type JrOfflineBookingFormProps,
} from "./forms/JrOfflineBookingForm";
import RouteOfflineBookingForm from "./forms/RouteOfflineBookingForm";

/** Static driver names for car offline UI (replace with API data when wired). */
const CAR_DRIVER_OPTIONS: string[] = ["Test"];

type Props = {
  activeProvider: OfflineItineraryProviderId;
  editingEntryId?: string | null;
  initialValuesOverride?: Partial<OfflineItineraryFormState> | null;
  /** When true, the main domestic form is invalid — block adding/updating offline segments. */
  disableAddItinerary?: boolean;
  onAddItinerary: (entry: OfflineItineraryEntry) => void;
  onCancelEdit?: () => void;
};

function renderOfflineProviderFields(
  activeProvider: OfflineItineraryProviderId,
  formikFields: JrOfflineBookingFormProps,
  flightFormikFields: FlightOfflineBookingFormProps,
  carDriverOptions: string[],
) {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formikFields;

  switch (activeProvider) {
    case "jr":
      return (
        <JrOfflineBookingForm
          values={values}
          errors={errors}
          touched={touched}
          handleChange={handleChange}
          handleBlur={handleBlur}
          setFieldValue={setFieldValue}
        />
      );
    case "flight":
      return (
        <FlightOfflineBookingForm
          values={flightFormikFields.values}
          errors={flightFormikFields.errors}
          touched={flightFormikFields.touched}
          setFieldValue={flightFormikFields.setFieldValue}
        />
      );
    case "hotel":
      return (
        <HotelOfflineBookingForm
          values={values}
          errors={errors}
          touched={touched}
          handleChange={handleChange}
          handleBlur={handleBlur}
          setFieldValue={setFieldValue}
        />
      );
    case "car":
      return (
        <CarOfflineBookingForm
          values={values}
          errors={errors}
          touched={touched}
          handleChange={handleChange}
          handleBlur={handleBlur}
          setFieldValue={setFieldValue}
          driverOptions={carDriverOptions}
        />
      );
    case "route":
      return <RouteOfflineBookingForm />;
    default:
      return null;
  }
}

const DomesticOfflineBookingForms: React.FC<Props> = ({
  activeProvider,
  editingEntryId = null,
  initialValuesOverride = null,
  disableAddItinerary = false,
  onAddItinerary,
  onCancelEdit,
}) => {
  const initialValues = useMemo(
    () => mergeOfflineFormInitial(activeProvider, initialValuesOverride),
    [activeProvider, initialValuesOverride],
  );

  const mergedCarDriverOptions = useMemo(() => {
    const list = [...CAR_DRIVER_OPTIONS];
    const extra = initialValuesOverride?.car_driver?.trim();
    if (extra && !list.includes(extra)) list.push(extra);
    return list;
  }, [initialValuesOverride?.car_driver]);

  const offlineSegmentValidationSchema = useMemo(
    () =>
      Yup.lazy((values: OfflineItineraryFormState) =>
        getOfflineItineraryValidationSchema(
          activeProvider,
          values.jr_transportType,
        ),
      ),
    [activeProvider],
  );

  const formik = useFormik<OfflineItineraryFormState>({
    initialValues,
    enableReinitialize: true,
    validateOnMount: true,
    validateOnChange: true,
    validationSchema: offlineSegmentValidationSchema,
    onSubmit: (values, { resetForm }) => {
      if (activeProvider === "jr") {
        const entry = buildOfflineItineraryEntry(values, editingEntryId);
        onAddItinerary(entry);
        resetForm({ values: mergeOfflineFormInitial(activeProvider) });
        return;
      }
      if (activeProvider === "car") {
        onAddItinerary(
          transformCarItineraryPayload(values, editingEntryId),
        );
        resetForm({ values: mergeOfflineFormInitial(activeProvider) });
        return;
      }
      if (activeProvider === "hotel") {
        onAddItinerary(
          buildOfflineHotelItineraryEntry(values, editingEntryId),
        );
        resetForm({ values: mergeOfflineFormInitial(activeProvider) });
        return;
      }
      if (activeProvider === "flight") {
        onAddItinerary(
          buildOfflineFlightItineraryEntry(values, editingEntryId),
        );
        resetForm({ values: mergeOfflineFormInitial(activeProvider) });
        return;
      }
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    isValid: offlineSegmentFormValid,
  } = formik;

  const canSubmitOffline =
    activeProvider === "jr" ||
    activeProvider === "hotel" ||
    activeProvider === "car" ||
    activeProvider === "flight";

  const addItineraryDisabled =
    disableAddItinerary || !offlineSegmentFormValid;

  const addItineraryBlockedReason = disableAddItinerary
    ? "Complete the required fields in the main booking form first (for example meeting number and travel type for self-booking, or arranger contact and traveller details when booking for someone else)."
    : !offlineSegmentFormValid
      ? "This offline segment still has validation errors. Scroll the form and fix any fields marked in red."
      : null;

  return (
    <Box>
      {renderOfflineProviderFields(
        activeProvider,
        {
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        },
        { values, errors, touched, setFieldValue },
        mergedCarDriverOptions,
      )}
      {canSubmitOffline ? (
        <Box className={styles.hotelActions}>
          {addItineraryBlockedReason ? (
            <Typography
              variant="caption"
              color={disableAddItinerary ? "error" : "warning"}
              sx={{ display: "block", width: "100%", mb: 1, maxWidth: 560 }}
            >
              {addItineraryBlockedReason}
            </Typography>
          ) : null}
          <Button
            type="button"
            variant="outlined"
            className={styles.buttonClear}
            onClick={() => {
              resetForm({ values: mergeOfflineFormInitial(activeProvider) });
              onCancelEdit?.();
            }}
          >
            Clear
          </Button>
          <Button
            type="button"
            variant="contained"
            className={styles.buttonSubmit}
            disabled={addItineraryDisabled}
            onClick={() => void handleSubmit()}
          >
            {editingEntryId ? "Update Itinerary" : "Add to Itinerary"}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
};

export default DomesticOfflineBookingForms;
