import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { TriangleAlert } from "lucide-react";

export type CommonModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** When true, primary action shows loading state and is disabled. */
  confirmLoading?: boolean;
};

const styles: Record<string, SxProps<Theme>> = {
  paper: {
    borderRadius: 3,
    px: { xs: 2, sm: 3 },
    pt: 3,
    pb: 2,
    maxWidth: 400,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.12)",
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    bgcolor: "rgba(239, 68, 68, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
    mb: 2,
    color: "error.main",
  },
  title: {
    fontWeight: 700,
    fontSize: "1.125rem",
    letterSpacing: "0.06em",
    color: "text.primary",
    mb: 1,
    textTransform: "uppercase",
  },
  message: {
    color: "text.secondary",
    fontSize: "0.9375rem",
    lineHeight: 1.5,
    px: { xs: 0, sm: 1 },
  },
  actions: {
    justifyContent: "center",
    gap: 1.5,
    px: { xs: 1, sm: 2 },
    pb: 1,
    pt: 2,
    flexWrap: "wrap",
  },
  cancelBtn: {
    minWidth: 120,
    borderRadius: 2,
    py: 1,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    bgcolor: "grey.100",
    color: "text.primary",
    "&:hover": { bgcolor: "grey.200" },
  },
  confirmBtn: {
    minWidth: 120,
    borderRadius: 2,
    py: 1,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};

const CommonModal = ({
  open,
  title,
  message,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  confirmLoading = false,
}: CommonModalProps) => {
  const handleDialogClose = (
    _: object,
    reason: "backdropClick" | "escapeKeyDown",
  ) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      if (!confirmLoading) {
        onCancel();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={false}
      BackdropProps={{
        sx: {
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(15, 23, 42, 0.35)",
        },
      }}
      PaperProps={{ sx: styles.paper }}
      aria-labelledby="common-modal-title"
      aria-describedby="common-modal-description"
    >
      <DialogContent sx={{ p: 0, overflow: "visible" }}>
        <Box sx={styles.iconWrap} aria-hidden>
          <TriangleAlert size={32} strokeWidth={2} aria-hidden />
        </Box>
        <Typography
          id="common-modal-title"
          component="h2"
          variant="h6"
          sx={styles.title}
        >
          {title}
        </Typography>
        <Typography
          id="common-modal-description"
          variant="body2"
          sx={styles.message}
        >
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={styles.actions}>
        <Stack direction="row" spacing={1.5} justifyContent="center" width="100%">
          <Button
            variant="contained"
            color="inherit"
            disableElevation
            onClick={onCancel}
            disabled={confirmLoading}
            sx={styles.cancelBtn}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            color="error"
            disableElevation
            onClick={onConfirm}
            disabled={confirmLoading}
            sx={styles.confirmBtn}
          >
            {confirmLabel}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CommonModal;
