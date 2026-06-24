import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Once a day, email users about subscriptions renewing within the lead window.
// 13:00 UTC is a reasonable mid-day slot across EU/US time zones.
crons.cron(
  "renewal reminders",
  "0 13 * * *",
  internal.notifications.sendDueReminders,
  {},
);

// Monday morning recap for users who opted into the weekly summary.
crons.cron(
  "weekly summary",
  "0 13 * * 1",
  internal.notifications.sendWeeklySummaries,
  {},
);

export default crons;
