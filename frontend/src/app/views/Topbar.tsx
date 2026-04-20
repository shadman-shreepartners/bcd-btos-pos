import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Menu } from "lucide-react";
import { useTheme } from "@mui/material/styles";

import styles from "./styles/Topbar.module.scss";

const defaultMenuClick = () => {};

export interface TopbarProps {
  menuOpen?: boolean;
  onMenuClick?: () => void;
}

const Topbar = ({
  menuOpen = false,
  onMenuClick = defaultMenuClick,
}: TopbarProps) => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Box
      component="header"
      className={styles.root}
      role="banner"
      aria-label="Application top bar"
    >
      <Box className={styles.container}>
        {!isLg && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={onMenuClick}
            className={styles.menuButton}
            size="large"
          >
            <Menu size={24} aria-hidden />
          </IconButton>
        )}

        <Box className={styles.spacer} />

        <Box className={styles.actions}>
          {/* Add user profile, notifications, etc. here */}
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;
