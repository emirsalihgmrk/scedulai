import { getCurrentUserService } from "@/services/auth";

import TimeZoneReporter from "./time-zone-reporter";

// Days (listening goal, activity calendar) are counted on the learner's own
// calendar, which only the browser knows.
export default async function TimeZoneSync() {
  const user = await getCurrentUserService();
  if (!user) return null;
  return <TimeZoneReporter savedTimeZone={user.timeZone} />;
}
