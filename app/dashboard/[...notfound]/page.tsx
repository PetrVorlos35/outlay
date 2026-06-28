import { notFound } from "next/navigation";

// Any unmatched /dashboard/* path lands here and triggers the dashboard-scoped
// not-found boundary (app/dashboard/not-found.tsx), so the 404 renders inside
// the product chrome instead of falling through to the global brand 404.
export default function DashboardCatchAll() {
  notFound();
}
