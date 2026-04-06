import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import styles from "./styles/Topbar.module.scss";

interface TopbarProps {
  menuOpen?: boolean;
  onMenuClick?: () => void;
}

const Topbar = ({ menuOpen = false, onMenuClick }: TopbarProps) => {
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
            <MenuIcon />
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
