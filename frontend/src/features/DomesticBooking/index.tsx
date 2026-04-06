import { Box, Container, Step, StepLabel, Stepper, Typography } from "@mui/material";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import DomesticBooking from "./DomesticBooking";
import Confirmation from "./Confirmation";
import CompletedBooking from "./CompletedBooking";
import { CircleCheck } from "lucide-react";

export type DomesticData = { name: string; email: string; step: number };
const defaultData: DomesticData = { name: "John Doe", email: "john.doe@example.com", step: 0 };
const steps = ["Travel Info & Itinerary", "Confirmation", "Completed"];
const stepLabels = ["step 1", "step 2", "step 3"];

const QontoConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 16,
    left: "calc(-50% + 20px)",
    right: "calc(50% + 20px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: "#4F91FF" },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: "#4F91FF" },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const DomesticBookingForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState<DomesticData>(defaultData);
  const [hasUserNavigated, setHasUserNavigated] = useState(false);
  const initialStepSet = useRef(false);

  const loadInitial = useCallback(async () => {
    const data = defaultData;
    setBookingData(data);
    if (!hasUserNavigated && !initialStepSet.current) {
      setActiveStep(Math.min(Math.max(data.step, 0), steps.length - 1));
      initialStepSet.current = true;
    }
  }, [hasUserNavigated]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const handleNext = () => {
    setHasUserNavigated(true);
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setHasUserNavigated(true);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setHasUserNavigated(false);
    initialStepSet.current = false;
    setBookingData(defaultData);
    setActiveStep(0);
  };

  const renderStep = () => {
    if (activeStep === 0) {
      return <DomesticBooking initialData={bookingData} onSubmit={handleNext} onDataChange={setBookingData} />;
    }
    if (activeStep === 1) {
      return <Confirmation data={bookingData} onBack={handleBack} onNext={handleNext} />;
    }
    return <CompletedBooking onReset={handleReset} />;
  };

  return (
    <Box>
      <Typography variant="h2" sx={{ fontWeight: 800, color: "#111" }}>
        Domestic:New Request
      </Typography>

      <Box sx={{mt: 2, width: "100%", py: 2, bgcolor: "#fff", boxShadow: "0 0 20px rgba(0,0,0,.15)", borderRadius: 2, mb: 1 }}>
        <Container maxWidth={false}>
          <Stepper activeStep={activeStep} alternativeLabel connector={<QontoConnector />} sx={{ py: 1 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: index <= activeStep ? "#4F91FF" : "#E5EAF7",
                      }}
                    >
                      {index <= activeStep ? (
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
                  )}
                >
                  <Box textAlign="center">
                    <Typography sx={{ fontSize: 12, textTransform: "uppercase", color: "#202123" }}>{stepLabels[index]}</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: index <= activeStep ? "#4F91FF" : "#202123" }}>{label}</Typography>
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