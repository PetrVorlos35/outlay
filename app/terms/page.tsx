import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms — outlay" };

export default async function TermsPage() {
  const locale = await getLocale();
  return <LegalPage doc={getLegalDoc("terms", locale)} />;
}
