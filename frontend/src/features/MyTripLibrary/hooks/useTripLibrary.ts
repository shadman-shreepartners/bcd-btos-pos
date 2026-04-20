import { useCallback, useState } from "react";

import type { TripBooking, TripLibraryFilters, TripMeta } from "../types";

export function useTripLibrary(filters: TripLibraryFilters) {
  void filters;
  const [data] = useState<TripBooking[]>([]);
  const [meta] = useState<TripMeta | undefined>(undefined);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const refetch = useCallback(() => {}, []);
  return { data, loading, error, meta, refetch };
}
