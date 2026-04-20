import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/system";
import { Lock } from "lucide-react";

import { completeAnaPunchoutSession } from "@/features/DomesticBooking/hooks/useAnaPunchout";
import { completeJalPunchoutSession } from "@/features/DomesticBooking/hooks/useJalPunchout";
import { useBookingStore } from "@/store/useBookingStore";

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.96);
  }
`;

const PunchoutLockScreen = () => {
  const isUiLocked = useBookingStore((state) => state.isUiLocked);

  return (
    <Modal
      open={isUiLocked}
      disableEscapeKeyDown
      aria-labelledby="punchout-lock-title"
      aria-describedby="punchout-lock-description"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
    >
      <Box
        role="presentation"
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          p: 2,
          outline: "none",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "28rem",
            px: "2.5rem",
            py: "2.5rem",
            borderRadius: "2rem",
            bgcolor: "#fff",
            boxShadow:
              "0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.08)",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: "rgba(239, 246, 255, 0.9)",
              filter: "blur(48px)",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              bottom: -80,
              left: -80,
              width: 160,
              height: 160,
              borderRadius: "50%",
              bgcolor: "rgba(224, 242, 254, 0.9)",
              filter: "blur(48px)",
              opacity: 0.45,
              pointerEvents: "none",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                mx: "auto",
                mb: 3,
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "rgba(239, 246, 255, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            >
              <Lock aria-hidden size={36} color="#0f172a" strokeWidth={2.25} />
            </Box>

            <Typography
              id="punchout-lock-title"
              component="h2"
              sx={{
                fontSize: "1.5rem",
                lineHeight: 1.2,
                fontWeight: 900,
                color: "#0f172a",
                mb: 1.5,
                letterSpacing: "-0.02em",
              }}
            >
              Secure Session Active
            </Typography>

            <Typography
              id="punchout-lock-description"
              sx={{
                color: "#64748b",
                fontSize: "0.875rem",
                lineHeight: 1.65,
                px: 2,
                mb: 4,
              }}
            >
              Booking in progress on the supplier portal. This window is locked to prevent data corruption until you finish.
            </Typography>

            <Box
              component="button"
              type="button"
              onClick={() => {
                completeAnaPunchoutSession();
                completeJalPunchoutSession();
              }}
              sx={{
                width: "100%",
                py: 2,
                px: 2,
                border: "none",
                cursor: "pointer",
                borderRadius: "1rem",
                bgcolor: "#0A3266",
                color: "#fff",
                fontWeight: 900,
                fontSize: "0.8125rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.2)",
                transition:
                  "background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
                "&:hover": {
                  bgcolor: "#1e293b",
                  boxShadow: "0 12px 24px -6px rgba(148, 163, 184, 0.35)",
                },
                "&:focus-visible": {
                  outline: "2px solid #0A3266",
                  outlineOffset: 3,
                },
              }}
            >
              I Have Completed My Booking
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default PunchoutLockScreen;
