import { InputLabel, type SxProps, type Theme } from "@mui/material";
import type { CSSProperties } from "react";

type CustomInputLabelProps = { label: string; required?: boolean; className?: string; style?: CSSProperties; sx?: SxProps<Theme> };

const CustomInputLabel = ({ label, required = false, className, style, sx }: CustomInputLabelProps) => (
  <InputLabel className={className ?? "customLabel"} style={style} sx={sx}>
    {label} {required ? <span style={{ color: "red" }}>*</span> : null}
  </InputLabel>
);

export default CustomInputLabel;
