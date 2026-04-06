import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";
import type { DomesticData } from "./index";
import CustomInputLabel from "../../shared/components/CustomInputLabel";
import { Info, MapPin, User } from "lucide-react";

type StepTwoConfirmationProps = {
  data: DomesticData;
  onBack: () => void;
  onNext: () => void;
};

export default function Confirmation({
  data,
  onBack,
  onNext,
}: StepTwoConfirmationProps) {
  console.log("Confirmation data:", data, onBack, onNext); // Debug log to check the data being passed
  return (
    <Box>
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <Info
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            Applicant Info
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Applicant Name"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"Amar Saxena"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Contact No."
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"9833456578"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Email ID"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">
                {"amar.saxena@example.com"}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <User
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            TRAVELLER DETAILS
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Full Name (Japanese)"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"アマル・サクスナ"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Full Name (As per Passport)"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"Amar Saxena"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Gender"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"Male"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Travel Type"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"Business"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Meeting Number"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">{"MEET12345"}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              <CustomInputLabel
                label="Trip Purpose"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              />
              <Typography variant="body1">
                {
                  "Business Meeting with BCD Japan Team to discuss upcoming projects and collaborations."
                }
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingY: 1,
            paddingLeft: 2.5,
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--page)",
          }}
        >
          <MapPin
            style={{ width: 16, height: 16, color: "var(--accent)" }}
            strokeWidth={2}
            aria-hidden
          />
          <Typography
            variant="body1"
            component="h6"
            sx={{ fontWeight: "bold" }}
          >
            TRAVELER ITINERARY LIST
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ p: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Stack alignItems="start">
              {/* <CustomInputLabel
                label="Full Name (Japanese)"
                sx={{ fontSize: "12px", fontWeight: "bold", color: "#94A3B8" }}
              /> */}
              <Typography variant="body1">
                {"No items added to itinerary yet."}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      {/* <Paper elevation={1} sx={{ overflow: 'hidden', mt: 3 }}> */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, m: 3 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button type="submit" variant="contained" onClick={onNext}>
          Complete
        </Button>
      </Box>
      {/* </Paper> */}
    </Box>
  );
}
