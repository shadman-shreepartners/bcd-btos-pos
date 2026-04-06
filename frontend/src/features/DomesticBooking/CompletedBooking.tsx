import { Box, Button, Typography } from "@mui/material";
import { CircleCheck } from "lucide-react";

type StepThreeCompletedProps = {
  onReset: () => void;
};

export default function CompletedBooking({ onReset }: StepThreeCompletedProps) {
  return (
    <Box textAlign="center" py={4}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: "#E5F2FF",
          mx: "auto",
          display: "grid",
          placeItems: "center",
          mb: 2,
        }}
      >
        <CircleCheck size={32} color="#4F91FF" />
      </Box>
      <Typography variant="h5" mb={1}>
        Completed
      </Typography>
      <Typography mb={2}>Domestic booking flow finished.</Typography>
      <Button variant="contained" onClick={onReset}>
        Start Again
      </Button>
    </Box>
  );
}