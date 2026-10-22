"use client";

import { useEffect } from "react";

import { saveTimeZoneAction } from "@/actions/user";

interface TimeZoneReporterProps {
  savedTimeZone: string | null;
}

export default function TimeZoneReporter({
  savedTimeZone,
}: TimeZoneReporterProps) {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone || timeZone === savedTimeZone) return;
    void saveTimeZoneAction({ timeZone }).catch(() => {
      // fire-and-forget: days fall back to UTC until the next visit
    });
  }, [savedTimeZone]);

  return null;
}
