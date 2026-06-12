"use client";

import { useFormikContext } from "formik";
import { useEffect, useRef } from "react";

const PersistBookingDraft = () => {
  const { values } = useFormikContext<Record<string, any>>();
  // Skip the first run so the empty initial values don't overwrite a saved
  // draft before it has been read back into the form on mount.
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    try {
      const stored = sessionStorage.getItem("userBookingInformation");
      const base = stored ? JSON.parse(stored) : {};
      sessionStorage.setItem(
        "userBookingInformation",
        JSON.stringify({ ...base, ...values }),
      );
    } catch {}
  }, [values]);

  return null;
};

export default PersistBookingDraft;
