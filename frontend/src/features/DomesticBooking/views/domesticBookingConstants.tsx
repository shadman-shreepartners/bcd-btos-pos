import type { ReactNode } from "react";

export const MEETING_NUMBER_OPTIONS = [
  { value: "0001", label: "0001" },
  { value: "0002", label: "0002" },
] as const;

export const TRAVELL_TYPE_OPTIONS = [
  { value: "guest", label: "Guest" },
  { value: "contractor", label: "Contractor" },
  { value: "employee", label: "Employee" },
] as const;

export const TRIP_PURPOSE_CATEGORY_OPTIONS = [
  { value: "internal", label: "INTERNAL" },
  { value: "external", label: "EXTERNAL" },
] as const;

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

export function selectWithPlaceholder(
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
  emptyLabel: string,
) {
  return {
    MenuProps: { disableScrollLock: false, PaperProps: { style: { maxHeight: 35 * 10 } } },
    displayEmpty: true,
    renderValue: (selected: unknown) => {
      if (selected == null || selected === "") return <span style={{ color: "#A0A4A8" }}>{emptyLabel}</span>;
      const key = String(selected);
      const opt = options.find((o) => o.value === key);
      return (opt?.label ?? key) as ReactNode;
    },
  };
}

export function meetingNumberSelectProps(emptyLabel: string) {
  return selectWithPlaceholder(MEETING_NUMBER_OPTIONS, emptyLabel);
}
