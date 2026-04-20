import { Box, Button } from "@mui/material";
import { useFormikContext } from "formik";
import { useState } from "react";
import type { DomesticBookingFormValues } from "../domesticBookingTypes";
import TripInformationSection from "./sections/TripInformationSection";
import ApplicantInformationSection from "./sections/ApplicantInformationSection";
import TravellInformationSection from "./sections/TravellInformationSection";
import ItineraryDetailsSection from "./sections/ItineraryDetailsSection";

const DomesticBookingFormBody = () => {
  const { handleSubmit, isValid } = useFormikContext<DomesticBookingFormValues>();
  const [blocksStepNext, setBlocksStepNext] = useState(false);

  const stepNextDisabled = blocksStepNext || !isValid;

  return (
    <Box component="form" noValidate onSubmit={handleSubmit}>
      <TripInformationSection />
      <ApplicantInformationSection />
      <TravellInformationSection />
      <ItineraryDetailsSection onBlocksStepNextChange={setBlocksStepNext} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, m: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={stepNextDisabled}
          sx={{
            minWidth: 112,
            height: 40,
            fontWeight: 800,
            textTransform: "none",
            letterSpacing: "0.04em",
            boxShadow: "none",
            ...(stepNextDisabled
              ? {
                  "&.Mui-disabled": {
                    bgcolor: "#c9d0da",
                    color: "#f4f6f9",
                  },
                }
              : {}),
          }}
        >
          NEXT
        </Button>
      </Box>
    </Box>
  );
};

export default DomesticBookingFormBody;
