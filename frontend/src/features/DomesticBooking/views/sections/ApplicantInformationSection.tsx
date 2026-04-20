import { Grid, Paper, Stack, TextField } from "@mui/material";
import { UserPlus } from "lucide-react";
import { useFormikContext } from "formik";
import CustomInputLabel from "@/shared/components/CustomInputLabel";
import type { DomesticBookingFormValues } from "../../domesticBookingTypes";
import SectionCardHeader from "../components/SectionCardHeader";

const ApplicantInformationSection = () => {
  const { values, errors, touched, handleChange, handleBlur } = useFormikContext<DomesticBookingFormValues>();
  if (values.applicant !== "travel-arranger") return null;
  return (
    <Paper elevation={1} sx={{ overflow: "hidden", mt: 2 }}>
      <SectionCardHeader icon={UserPlus} title="APPLICANT INFORMATION" />
      <Grid container spacing={2} sx={{ p: 3 }}>
        <Grid item xs={12} sm={6} md={6}>
          <Stack spacing={1}>
            <CustomInputLabel label="APPLICANT NAME" sx={{ fontSize: "12px", fontWeight: "bold" }} required />
            <TextField
              fullWidth
              variant="outlined"
              id="applicant_name"
              name="applicant_name"
              placeholder="Enter Applicant"
              value={values.applicant_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.applicant_name && Boolean(errors.applicant_name)}
              helperText={touched.applicant_name && errors.applicant_name ? errors.applicant_name : " "}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={6}>
          <Stack spacing={1}>
            <CustomInputLabel label="CONTACT NUMBER" sx={{ fontSize: "12px", fontWeight: "bold" }} required />
            <TextField
              fullWidth
              variant="outlined"
              id="contact_no"
              name="contact_no"
              placeholder="Enter number"
              value={values.contact_no}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.contact_no && Boolean(errors.contact_no)}
              helperText={touched.contact_no && errors.contact_no ? errors.contact_no : " "}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={12}>
          <Stack spacing={1}>
            <CustomInputLabel label="APPLICANT EMAIL" sx={{ fontSize: "12px", fontWeight: "bold" }} required />
            <TextField
              fullWidth
              variant="outlined"
              id="applicant_email"
              name="applicant_email"
              placeholder="Enter email"
              type="email"
              value={values.applicant_email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.applicant_email && Boolean(errors.applicant_email)}
              helperText={touched.applicant_email && errors.applicant_email ? errors.applicant_email : " "}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ApplicantInformationSection;
