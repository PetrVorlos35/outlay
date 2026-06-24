import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy — outlay" };

export default async function PrivacyPage() {
  const locale = await getLocale();
  return <LegalPage doc={getLegalDoc("privacy", locale)} />;
}
