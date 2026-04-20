import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileChartColumnIncreasing,
  Globe,
  History,
  Home,
  List,
  Map,
  Newspaper,
} from "lucide-react";

export interface SidebarNavItem {
  to: string;
  labelKey: string;
  end?: boolean;
  icon: LucideIcon;
}

export interface SidebarNavSection {
  titleKey: string;
  items: SidebarNavItem[];
}

export const sidebarNavSections: SidebarNavSection[] = [
  {
    titleKey: "Main",
    items: [{ to: "/home", labelKey: "Home", end: true, icon: Home }],
  },
  {
    titleKey: "Travel application",
    items: [
      { to: "/domestic-travel", labelKey: "Domestic Travel", icon: Map },
      {
        to: "/international-travel",
        labelKey: "International Travel",
        icon: Globe,
      },
      { to: "/change-or-cancel", labelKey: "Change or Cancel", icon: History },
      { to: "/library", labelKey: "My Trip Library", icon: Briefcase },
    ],
  },
  {
    titleKey: "Administration",
    items: [
      { to: "/reservations", labelKey: "Reservation List", icon: List },
      { to: "/bulletin", labelKey: "Internal Bulletin", icon: Newspaper },
      { to: "/reports", labelKey: "Reports", icon: FileChartColumnIncreasing },
    ],
  },
];
