import { useCallback, useEffect, useRef, useState } from "react";
import { useBookingStore } from "@/store/useBookingStore";

export type JalPunchoutRequest = {
  id: string;
  projectNumber: string;
};

export type JalPunchoutFields = Record<string, string>;

export type JalPunchoutResponse = {
  success: boolean;
  message: string;
  data: {
    targetUrl: string;
    method: string;
    contentType: string;
    fields: JalPunchoutFields;
  };
  meta: unknown | null;
};

const MOCK_JAL_PUNCHOUT_RESPONSE: JalPunchoutResponse = {
  success: true,
  message: "Success",
  data: {
    targetUrl: "https://john.jal.co.jp/rm_john/sso",
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    fields: {
      seamlessid: "HTBBTOS",
      accesscode: "CxDYAb2Qcbxv",
      id: "XC0050870",
      password: "",
      acudId: "JALSELF",
      acudPassword: "HTBJAL",
      projectnumber: "M5555J260300050",
    },
  },
  meta: null,
};

function simulateJalPunchoutApi(): Promise<JalPunchoutResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_JAL_PUNCHOUT_RESPONSE);
    }, 1000);
  });
}

let punchoutPollIntervalId: ReturnType<typeof setInterval> | null = null;

export function completeJalPunchoutSession() {
  if (punchoutPollIntervalId !== null) {
    clearInterval(punchoutPollIntervalId);
    punchoutPollIntervalId = null;
  }
  useBookingStore.getState().unlockUi();
  // TODO: Fetch final booking data here
  console.log("Fetch final booking data here");
  
  // Optional: If the popup is still open when they click the manual button, close it.
  // This is a nice UX touch so they don't have orphan tabs.
  const popup = window.open("", "supplier_window");
  if (popup && !popup.closed) {
      popup.close();
  }
}

export function useJalPunchout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const punchoutActiveRef = useRef(false);

  useEffect(() => {
    return () => {
      if (punchoutPollIntervalId !== null) {
        clearInterval(punchoutPollIntervalId);
        punchoutPollIntervalId = null;
      }
      if (punchoutActiveRef.current) {
        useBookingStore.getState().unlockUi();
        punchoutActiveRef.current = false;
      }
    };
  }, []);

  const initiatePunchout = useCallback(
    async (id: string, projectNumber: string) => {
      void id;
      void projectNumber;

      setError(null);
      setLoading(true);

      const popup = window.open("", "supplier_window");
      if (popup === null) {
        setError("Popup Blocked");
        setLoading(false);
        return;
      }

      try {
        useBookingStore.getState().lockUi();
        punchoutActiveRef.current = true;

        const payload = await simulateJalPunchoutApi();

        if (!payload.success || !payload.data) {
          setError(payload.message || "JAL punch-out failed");
          useBookingStore.getState().unlockUi();
          punchoutActiveRef.current = false;
          return;
        }

        const { targetUrl, method, fields } = payload.data;

        const form = document.createElement("form");
        form.action = targetUrl;
        form.method = method.toLowerCase();
        form.target = "supplier_window";

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

        if (punchoutPollIntervalId !== null) {
          clearInterval(punchoutPollIntervalId);
          punchoutPollIntervalId = null;
        }

        punchoutPollIntervalId = setInterval(() => {
          if (popup.closed) {
            completeJalPunchoutSession();
            punchoutActiveRef.current = false;
          }
        }, 1000);
      } catch {
        setError("JAL punch-out failed");
        useBookingStore.getState().unlockUi();
        punchoutActiveRef.current = false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { initiatePunchout, loading, error };
}
