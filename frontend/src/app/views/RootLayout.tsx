import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { sidebarNavSections } from "../utils/constants";
import styles from "./styles/RootLayout.module.scss";

interface RootLayoutProps {
  // Add props if needed
}

const RootLayout = ({ }: RootLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  useEffect(() => {
    if (isLg) {
      setMobileOpen(false);
    }
  }, [isLg]);

  const closeSidebar = () => {
    setMobileOpen(false);
  };

  const toggleSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box className={styles.root}>
      {mobileOpen && (
        <Box
          component="button"
          type="button"
          aria-label="Close overlay"
          onClick={closeSidebar}
          className={styles.overlay}
        />
      )}

      <Sidebar
        sections={sidebarNavSections}
        mobileOpen={mobileOpen}
        onNavigate={closeSidebar}
      />

      <Box className={styles.mainContainer}>
        <Topbar menuOpen={mobileOpen} onMenuClick={toggleSidebar} />
        {/* <Topbar /> */}
        <Box component="main" className={styles.mainContent}>
          <Box className={styles.contentWrapper}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RootLayout;
