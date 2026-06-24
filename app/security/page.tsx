import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { getLegalDoc } from "@/lib/legal";

export const metadata: Metadata = { title: "Security — outlay" };

export default async function SecurityPage() {
  const locale = await getLocale();
  return <LegalPage doc={getLegalDoc("security", locale)} />;
}
