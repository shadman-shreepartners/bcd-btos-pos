import type { LucideIcon } from "lucide-react";
import { Building, Building2, Car, Map, MapPin, Plane, Star, Train } from "lucide-react";

export type ItineraryProviderId =
  | "jr-express"
  | "jal-online"
  | "ana-biz"
  | "star-flyer"
  | "rakuten"
  | "jalan";

export type ItineraryProviderOfflineId = "jr" | "flight" | "hotel" | "car" | "route";

export const ITINERARY_PROVIDERS: ReadonlyArray<{
  id: ItineraryProviderId;
  title: string;
  category: string;
  icon: LucideIcon;
  iconColor: string;
}> = [
  { id: "jr-express", title: "JR Express", category: "RAILWAY", icon: Train, iconColor: "var(--itinerary-icon-rail)" },
  { id: "jal-online", title: "JAL Online", category: "FLIGHT", icon: Plane, iconColor: "var(--itinerary-icon-flight)" },
  { id: "ana-biz", title: "ANA Biz", category: "CORPORATE", icon: Plane, iconColor: "var(--itinerary-icon-corporate)" },
  { id: "star-flyer", title: "Star Flyer", category: "SFJ", icon: Star, iconColor: "var(--itinerary-icon-neutral)" },
  { id: "rakuten", title: "Rakuten", category: "HOTEL", icon: Building2, iconColor: "var(--itinerary-icon-hotel)" },
  { id: "jalan", title: "Jalan", category: "PORTAL", icon: Map, iconColor: "var(--itinerary-icon-portal)" },
];

export const ITINERARY_PROVIDERS_OFFLINE: ReadonlyArray<{
  id: ItineraryProviderOfflineId;
  title: string;
  category: string;
  icon: LucideIcon;
  iconColor: string;
}> = [
  { id: "jr", title: "JR", category: "RAILWAY", icon: Train, iconColor: "var(--itinerary-icon-rail)" },
  { id: "flight", title: "Flight", category: "AIR TRAVEL", icon: Plane, iconColor: "var(--itinerary-icon-flight)" },
  { id: "hotel", title: "Hotel", category: "LODGING", icon: Building, iconColor: "var(--itinerary-icon-hotel)" },
  { id: "car", title: "Car", category: "RENTAL", icon: Car, iconColor: "var(--itinerary-icon-portal)" },
  { id: "route", title: "Route", category: "NAVI", icon: MapPin, iconColor: "var(--itinerary-icon-rail)" },
];
