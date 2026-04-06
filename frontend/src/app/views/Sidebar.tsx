import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { NavLink } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import styles from "./styles/Sidebar.module.scss";
import type { SidebarNavSection } from "../utils/constants";
import logo from "../../assets/tripsource-logo-new.png";

interface SidebarProps {
  sections: SidebarNavSection[];
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

const Sidebar = ({ sections, mobileOpen = false, onNavigate }: SidebarProps) => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const ariaHidden = !isLg && !mobileOpen;

  return (
    <Box
      component="aside"
      id="app-sidebar"
      aria-hidden={ariaHidden}
      className={`${styles.root} ${mobileOpen ? styles.mobileOpen : ""}`}
    >
      <Box className={styles.header}>
        <Box
          component="img"
          src={logo}
          alt="TripSource Logo"
          width={160}
          height={60}
          decoding="async"
          onClick={onNavigate}
          className={styles.logo}
        />
      </Box>

      <Box
        component="nav"
        aria-label="Main Navigation"
        className={styles.nav}
      >
        {sections.map((section) => (
          <Box key={section.titleKey} className={styles.section}>
            <Typography component="p" className={styles.sectionLabel}>
              {section.titleKey}
            </Typography>
            <List className={styles.list} disablePadding component="ul">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <ListItem key={item.to} disablePadding className={styles.listItem}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={styles.navLink}
                    >
                      {({ isActive }) => (
                        <ListItemButton
                          component="div"
                          selected={isActive}
                          className={`${styles.listItemButton} ${isActive ? styles.active : ""
                            }`}
                        >
                          {Icon && (
                            <ListItemIcon className={styles.icon}>
                              <Icon
                                width={20}
                                height={20}
                                strokeWidth={1.65}
                                aria-hidden
                              />
                            </ListItemIcon>
                          )}
                          <ListItemText primary={item.labelKey} />
                        </ListItemButton>
                      )}
                    </NavLink>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <footer className={styles.footer}>
        <p className={styles.copyright}>
          Copyright © {new Date().getFullYear()} BCD Travel Limited
        </p>
      </footer>
    </Box>
  );
};

export default Sidebar;

