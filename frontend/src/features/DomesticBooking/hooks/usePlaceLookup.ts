import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { apiClient } from "@/services/api/client";

export type PlaceLookupItem = {
  id: number;
  name: string;
  type: string;
  code: string;
};

export type PlaceLookupResponse = {
  success: boolean;
  message: string;
  data: PlaceLookupItem[];
  meta: unknown;
};

const lookupCache = new Map<string, PlaceLookupItem[]>();

/** Paths are relative to `VITE_API_BASE_URL` (gateway). */
export type PlaceLookupKind =
  | "rail"
  | "bus"
  | "ship"
  | "airports"
  | "city";

const ENDPOINTS: Record<PlaceLookupKind, string> = {
  rail: "/lookup/places/rail-stations",
  bus: "/lookup/places/bus-stops",
  ship: "/lookup/places/ship-stops",
  airports: "/lookup/places/airports",
  city: "/lookup/places/cities",
};

function normalizeLookupError(e: unknown): string {
  if (typeof e === "string") return e;
  const ax = e as AxiosError<{ message?: string }>;
  return (
    ax.response?.data?.message ??
    ax.message ??
    "Place lookup failed"
  );
}

export function usePlaceLookup(searchTerm: string, transportType: PlaceLookupKind) {
  const [places, setPlaces] = useState<PlaceLookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const trimmedSearch = searchTerm.trim();
    const cacheKey = `${transportType}-${trimmedSearch}`;

    if (lookupCache.has(cacheKey)) {
      setPlaces(lookupCache.get(cacheKey)!);
      setLoading(false);
      setError(null);
      return;
    }

    const url = `${ENDPOINTS[transportType]}?search=${encodeURIComponent(trimmedSearch)}`;

    const timeoutId = setTimeout(() => {
      void (async () => {
        if (cancelled) return;
        setLoading(true);
        setError(null);
        try {
          const { data } = await apiClient.get<PlaceLookupResponse>(url);
          if (cancelled) return;

          if (data && typeof data === "object" && data.success === false) {
            setPlaces([]);
            setError(
              typeof data.message === "string" && data.message.trim()
                ? data.message
                : "Place lookup unsuccessful",
            );
            return;
          }

          const list = data?.data;
          const rows = Array.isArray(list) ? list : [];
          lookupCache.set(cacheKey, rows);
          setPlaces(rows);
          setError(null);
        } catch (e) {
          if (!cancelled) {
            setPlaces([]);
            setError(normalizeLookupError(e));
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, transportType]);

  return { places, loading, error };
}
