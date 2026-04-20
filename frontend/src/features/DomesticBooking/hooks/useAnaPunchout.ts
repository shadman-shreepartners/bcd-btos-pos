import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";

import {
  fetchAnaSsoCredentials,
  type AnaSsoRequest,
} from "@/services/api/ssoService";
import { useBookingStore } from "@/store/useBookingStore";

let anaPunchoutPollIntervalId: ReturnType<typeof setInterval> | null = null;

function extractAxiosErrorMessage(err: unknown): string {
  if (!isAxiosError(err)) {
    return err instanceof Error && err.message.trim()
      ? err.message
      : "ANA punch-out failed";
  }
  const data = err.response?.data;
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    const m = (data as { message: string }).message.trim();
    if (m) return m;
  }
  return err.message.trim() || "ANA punch-out failed";
}

export function completeAnaPunchoutSession() {
  if (anaPunchoutPollIntervalId !== null) {
    clearInterval(anaPunchoutPollIntervalId);
    anaPunchoutPollIntervalId = null;
  }
  useBookingStore.getState().unlockUi();
  // TODO: Fetch final booking data here

  const popup = window.open("", "ana_supplier_window");
  if (popup && !popup.closed) {
    popup.close();
  }
}

export function useAnaPunchout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const punchoutActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (anaPunchoutPollIntervalId !== null) {
        clearInterval(anaPunchoutPollIntervalId);
        anaPunchoutPollIntervalId = null;
      }
      if (punchoutActiveRef.current) {
        useBookingStore.getState().unlockUi();
        punchoutActiveRef.current = false;
      }
    };
  }, []);

  const initiatePunchout = useCallback(async (params: AnaSsoRequest) => {
    setError(null);
    setLoading(true);

    const popup = window.open("", "ana_supplier_window");
    if (popup === null) {
      setError("Popup Blocked");
      setLoading(false);
      return;
    }

    try {
      useBookingStore.getState().lockUi();
      punchoutActiveRef.current = true;

      const payload = await fetchAnaSsoCredentials(params);

      if (!payload.success || !payload.data) {
        setError(payload.message?.trim() || "ANA punch-out failed");
        useBookingStore.getState().unlockUi();
        punchoutActiveRef.current = false;
        if (!popup.closed) {
          popup.close();
        }
        return;
      }

      const { targetUrl, method, fields } = payload.data;

      const form = document.createElement("form");
      form.action = targetUrl;
      form.method = method.toLowerCase();
      form.target = "ana_supplier_window";
      form.enctype = "multipart/form-data";

      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      form.remove();

      if (anaPunchoutPollIntervalId !== null) {
        clearInterval(anaPunchoutPollIntervalId);
        anaPunchoutPollIntervalId = null;
      }

      anaPunchoutPollIntervalId = setInterval(() => {
        if (popup.closed) {
          completeAnaPunchoutSession();
          punchoutActiveRef.current = false;
        }
      }, 1000);
    } catch (err: unknown) {
      setError(extractAxiosErrorMessage(err));
      useBookingStore.getState().unlockUi();
      punchoutActiveRef.current = false;
      if (!popup.closed) {
        popup.close();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { initiatePunchout, loading, error };
}
