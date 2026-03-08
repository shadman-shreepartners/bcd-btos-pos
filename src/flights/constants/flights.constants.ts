/** Supported airline IATA codes for schedule queries */
export const AIRLINE_CODES = ['JL', 'NH'] as const;

/** HTTP timeout for upstream API calls (milliseconds) */
export const API_TIMEOUT_MS = 15_000;

export type AirlineCode = (typeof AIRLINE_CODES)[number];
