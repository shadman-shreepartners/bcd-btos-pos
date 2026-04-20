import {
  Box,
  Container,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import { useBookingStore } from "@/store/useBookingStore";
import DomesticBooking from "./views/DomesticBooking";
import Confirmation, { BookingSubmittedSuccess } from "./views/Confirmation";
import { CircleCheck } from "lucide-react";
export type {
  ApplicantFormCanonical,
  applicant,
  DomesticBookingFormValues,
  DomesticData,
  TravellerSource,
} from "./domesticBookingTypes";

const steps = [
  "Travel Info & Itinerary",
  "Confirmation",
  "Completed",
];
const stepLabels = ["step 1", "step 2", "step 3"];

/** In-progress / review steps */
const STEP_BLUE = "#4F91FF";
/** All steps finished — success screen (step 3) */
const STEP_SUCCESS_GREEN = "#22c55e";
const STEP_TRACK_PENDING = "#eaeaf0";

const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
    left: "calc(-50% + 20px)",
    right: "calc(50% + 20px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: STEP_BLUE },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: STEP_BLUE },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: STEP_TRACK_PENDING,
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

type DomesticStepIconProps = {
  index: number;
  activeStep: number;
  lastStepIndex: number;
};

function DomesticStepIcon({ index, activeStep, lastStepIndex }: DomesticStepIconProps) {
  const allStepsComplete = activeStep === lastStepIndex;
  const reached = index <= activeStep;
  const bg =
    allStepsComplete && reached
      ? STEP_SUCCESS_GREEN
      : reached
        ? STEP_BLUE
        : "#E5EAF7";

  return (
    <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        bgcolor: bg,
      }}
    >
      {reached ? (
        <CircleCheck size={18} color="#fff" />
      ) : (
        <Box
          sx={{
            width: 14,
            height: 14,
            bgcolor: "#fff",
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );
}

const DomesticBookingForm = () => {
  const activeStep = useBookingStore((state) => state.activeStep);
  const createdTripId = useBookingStore((state) => state.createdTripId);
  const bookingData = useBookingStore((state) => state.bookingData);
  const setActiveStep = useBookingStore((state) => state.setActiveStep);
  const setBookingData = useBookingStore((state) => state.setBookingData);

  const lastStepIndex = steps.length - 1;
  const allStepsComplete = activeStep === lastStepIndex;

  const handleNext = () => {
    const next = Math.min(activeStep + 1, steps.length - 1);
    setActiveStep(next);
    setBookingData((prev) => ({ ...prev, step: next }));
  };

  const handleBack = () => {
    const next = Math.max(activeStep - 1, 0);
    setActiveStep(next);
    setBookingData((prev) => ({ ...prev, step: next }));
  };

  const renderStep = () => {
    if (activeStep === 0) {
      return (
        <DomesticBooking
          initialData={bookingData}
          onSubmit={handleNext}
          onDataChange={setBookingData}
        />
      );
    }
    if (activeStep === 1) {
      return <Confirmation onBack={handleBack} />;
    }
    if (activeStep === 2) {
      if (createdTripId) {
        return <BookingSubmittedSuccess tripId={createdTripId} />;
      }
      return (
        <Typography color="error">
          Session expired or invalid trip ID.
        </Typography>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ fontWeight: 800, color: "#111" }}>
        Domestic:New Request
      </Typography>

      <Box
        sx={{
          mt: 2,
          width: "100%",
          py: 2,
          bgcolor: "#fff",
          boxShadow: "0 0 20px rgba(0,0,0,.15)",
          borderRadius: 2,
          mb: 1,
        }}
      >
        <Container maxWidth={false}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            connector={<QontoConnector />}
            sx={{
              py: 1,
              ...(allStepsComplete
                ? {
                    [`& .${stepConnectorClasses.line}`]: {
                      borderColor: `${STEP_SUCCESS_GREEN} !important`,
                    },
                  }
                : {}),
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <DomesticStepIcon
                      index={index}
                      activeStep={activeStep}
                      lastStepIndex={lastStepIndex}
                    />
                  )}
                >
                  <Box textAlign="center">
                    <Typography
                      sx={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        color: "#202123",
                      }}
                    >
                      {stepLabels[index]}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        color:
                          allStepsComplete && index <= activeStep
                            ? STEP_SUCCESS_GREEN
                            : index <= activeStep
                              ? STEP_BLUE
                              : "#202123",
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>
      <Box mt={3}>{renderStep()}</Box>
    </Box>
  );
};

export default DomesticBookingForm;
