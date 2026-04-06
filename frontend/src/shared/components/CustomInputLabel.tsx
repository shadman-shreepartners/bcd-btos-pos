import React from "react";
import { InputLabel, type SxProps, type Theme } from "@mui/material";

type CustomInputLabelProps = {
  label: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
};

const CustomInputLabel: React.FC<CustomInputLabelProps> = ({
  label,
  required = false,
  className,
  style,
  sx,
}) => {
  return (
    <InputLabel className={className || "customLabel"} style={style} sx={sx}>
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </InputLabel>
  );
};

export default CustomInputLabel;
