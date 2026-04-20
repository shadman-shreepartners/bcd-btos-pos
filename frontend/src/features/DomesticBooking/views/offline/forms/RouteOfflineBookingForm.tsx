import { Typography } from "@mui/material";
import styles from "../../styles/DomesticOfflineBookingForms.module.scss";

/** Route / NAVI offline — implement when ready. */
const RouteOfflineBookingForm = () => (
  <Typography className={styles.emptyState} component="p">
    This itinerary type is not available yet.
  </Typography>
);

export default RouteOfflineBookingForm;
