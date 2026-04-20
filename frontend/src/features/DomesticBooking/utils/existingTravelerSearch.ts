import type { ExistingTravelerRecord } from "../types/existingTraveler";

export const travelerSubtitle = (t: ExistingTravelerRecord) =>
  `${t.employeeId} • ${t.department}`;

/**
 * Anonymous offline fixtures until a directory/search API exists.
 * Replace `loadExistingTravelerDirectory` with HTTP-backed search when available.
 */
export const OFFLINE_EXISTING_TRAVELER_FIXTURES: ExistingTravelerRecord[] = [
  {
    id: "100042",
    name: "Traveler A",
    employeeId: "EMP-100042",
    department: "Corporate Travel",
    initials: "TA",
  },
  {
    id: "100001",
    name: "Traveler B",
    employeeId: "EMP-100001",
    department: "Regional Operations",
    initials: "TB",
  },
];

/** @deprecated Use `OFFLINE_EXISTING_TRAVELER_FIXTURES` or `loadExistingTravelerDirectory`. */
export const DUMMY_EXISTING_TRAVELERS = OFFLINE_EXISTING_TRAVELER_FIXTURES;

/** Client-side directory until a search API exists. */
export function loadExistingTravelerDirectory(): ExistingTravelerRecord[] {
  return OFFLINE_EXISTING_TRAVELER_FIXTURES;
}

export const filterTravelers = (
  travelers: ExistingTravelerRecord[],
  query: string,
  excludeIds: Set<string>,
): ExistingTravelerRecord[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return travelers.filter((t) => {
    if (excludeIds.has(t.id)) return false;
    const haystack = [t.name, t.employeeId, t.department, t.initials]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
};
