import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { Users } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { useBookingStore } from "@/store/useBookingStore";
import SectionDataTable from "@/shared/components/SectionDataTable";
import type { SectionDataTableColumn } from "@/shared/components/SectionDataTable";

export type TravelerRow = {
  id: string;
  no: string;
  nameJapanese: string;
  nameEnglish: string;
  gender: string;
};

const MOCK_TRAVELERS: TravelerRow[] = [
  {
    id: "1",
    no: "0001",
    nameJapanese: "トリプール トリプール",
    nameEnglish: "TRIPUR PATEL",
    gender: "MALE",
  },
];

export interface OnlineSupplierTravelerListProps {
  warningMessage: ReactNode;
  memberIdLabel: string;
  memberIdPlaceholder?: string;
  inputAriaPrefix?: string;
  travelers?: TravelerRow[];
  isLoading: boolean;
  onBook?: (memberId: string) => void;
  error?: string | null;
}

export function OnlineSupplierTravelerList({
  warningMessage,
  memberIdLabel,
  memberIdPlaceholder,
  inputAriaPrefix,
  travelers = MOCK_TRAVELERS,
  isLoading,
  onBook,
  error,
}: OnlineSupplierTravelerListProps) {
  const [profileIds, setProfileIds] = useState<Record<string, string>>({});
  const isUiLocked = useBookingStore((s) => s.isUiLocked);
  const disabled = isLoading || isUiLocked;

  const handleProfileIdChange = useCallback((travelerId: string, value: string) => {
    setProfileIds((prev) => ({ ...prev, [travelerId]: value }));
  }, []);

  const columns = useMemo<SectionDataTableColumn<TravelerRow>[]>(
    () => [
      {
        id: "no",
        label: "NO",
        minWidth: 72,
        renderCell: (row) => (
          <Typography component="span" sx={{ color: "var(--sublabel)" }}>
            {row.no}
          </Typography>
        ),
      },
      { id: "nameJa", label: "NAME (JAPANESE)", field: "nameJapanese", minWidth: 160 },
      {
        id: "nameEn",
        label: "NAME (ENGLISH)",
        minWidth: 140,
        renderCell: (row) => (
          <Typography
            component="span"
            sx={{ fontWeight: 700, textTransform: "uppercase", color: "var(--label)" }}
          >
            {row.nameEnglish}
          </Typography>
        ),
      },
      {
        id: "gender",
        label: "GENDER",
        minWidth: 88,
        renderCell: (row) => (
          <Typography component="span" sx={{ color: "var(--sublabel)", textTransform: "uppercase" }}>
            {row.gender}
          </Typography>
        ),
      },
      {
        id: "profileId",
        label: memberIdLabel,
        minWidth: 160,
        renderCell: (row) => (
          <TextField
            size="small"
            fullWidth
            placeholder={memberIdPlaceholder ?? ""}
            value={profileIds[row.id] ?? ""}
            onChange={(e) => handleProfileIdChange(row.id, e.target.value)}
            inputProps={{
              "aria-label": `${inputAriaPrefix ?? memberIdLabel} for ${row.nameEnglish}`,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "var(--header-bg)",
                fontSize: "0.8125rem",
              },
            }}
          />
        ),
      },
      {
        id: "action",
        label: "ACTION",
        align: "center",
        minWidth: 100,
        renderCell: (row) =>
          onBook ? (
            <Button
              variant="contained"
              size="small"
              disabled={disabled}
              startIcon={
                isLoading ? <CircularProgress size={14} color="inherit" /> : undefined
              }
              sx={{ textTransform: "none", minWidth: 88 }}
              onClick={() => onBook(profileIds[row.id] ?? "")}
            >
              {isLoading ? "Preparing..." : "BOOK"}
            </Button>
          ) : (
            <Button variant="contained" size="small" sx={{ textTransform: "none", minWidth: 88 }}>
              BOOK
            </Button>
          ),
      },
    ],
    [
      disabled,
      handleProfileIdChange,
      inputAriaPrefix,
      isLoading,
      memberIdLabel,
      memberIdPlaceholder,
      onBook,
      profileIds,
    ],
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Alert
        severity="error"
        sx={{
          mb: 2,
          alignItems: "flex-start",
          bgcolor: "#fdecef",
          color: "var(--label)",
          border: "1px solid var(--badge)",
          borderRadius: 1,
          "& .MuiAlert-icon": { color: "var(--badge)" },
        }}
      >
        {warningMessage}
      </Alert>

      <SectionDataTable<TravelerRow>
        title="TRAVELER LIST"
        titleIcon={Users}
        columns={columns}
        rows={travelers}
        getRowId={(row) => row.id}
      />

      {error ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "error.main" }}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
