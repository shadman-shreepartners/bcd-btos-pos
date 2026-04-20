/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_INTEGRATION_API_URL?: string;
  /** When `"true"`, persist booking draft to sessionStorage in production (dev always persists when persist is on). */
  readonly VITE_ENABLE_BOOKING_PERSIST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
