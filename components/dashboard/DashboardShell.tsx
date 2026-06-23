"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useTranslations } from "next-intl";
import {
  ChartColumnIncreasing,
  CreditCard,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import Wordmark from "@/components/Wordmark";
import DashboardProvider, { useDashboard } from "./DashboardProvider";
import SubscriptionDrawer from "./SubscriptionDrawer";
import Toaster from "./Toaster";

type NavItem = {
  href: string;
  key: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", key: "overview", Icon: LayoutGrid, exact: true },
  { href: "/dashboard/subscriptions", key: "subscriptions", Icon: CreditCard },
  { href: "/dashboard/insights", key: "insights", Icon: ChartColumnIncreasing },
  { href: "/dashboard/settings", key: "settings", Icon: Settings },
];

function useActive() {
  const pathname = usePathname();
  return (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const isActive = useActive();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, key, Icon, exact }) => {
        const active = isActive(href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-navy/[0.06] text-navy"
                : "text-navy/60 hover:bg-navy/[0.04] hover:text-navy"
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] ${active ? "text-emerald-ink" : "text-navy/45 group-hover:text-navy/70"}`}
              strokeWidth={2}
            />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

function AddButton({ onClick }: { onClick?: () => void }) {
  const t = useTranslations("dashboard");
  const { openAdd } = useDashboard();
  return (
    <button
      type="button"
      onClick={() => {
        openAdd();
        onClick?.();
      }}
      className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-ink px-4 text-sm font-medium text-paper transition-colors hover:bg-emerald-ink/90 focus:outline-none focus:ring-2 focus:ring-emerald-ink/40 focus:ring-offset-2 focus:ring-offset-paper"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
      {t("add")}
    </button>
  );
}

function AccountBlock() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);

  const name = viewer?.name?.trim();
  const email = viewer?.email ?? "";
  const display = name || email || "—";
  const initial = (name || email || "?").charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="flex items-center gap-3 border-t border-navy/[0.07] px-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-paper">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy">{display}</p>
        {name && email && (
          <p className="truncate text-xs text-navy/50">{email}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        aria-label={t("signOut")}
        title={t("signOut")}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-navy/45 transition-colors hover:bg-navy/[0.05] hover:text-navy"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}

function Chrome({ children }: { children: React.ReactNode }) {
  const t = useTranslations("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock scroll while the mobile nav is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-navy/10 bg-white lg:flex">
        <div className="px-5 py-5">
          <Link href="/dashboard" aria-label="outlay" className="inline-flex">
            <Wordmark />
          </Link>
        </div>
        <div className="px-3">
          <AddButton />
        </div>
        <div className="mt-5 flex-1 overflow-y-auto px-3">
          <NavLinks />
        </div>
        <AccountBlock />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy/10 bg-paper/85 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" aria-label="outlay">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={t("menuOpen")}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-navy/70 transition-colors hover:bg-navy/[0.05] hover:text-navy"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile slide-over nav */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`absolute inset-0 bg-navy/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              aria-label="outlay"
            >
              <Wordmark />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label={t("menuClose")}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-navy/60 transition-colors hover:bg-navy/[0.05] hover:text-navy"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-3">
            <AddButton onClick={() => setMobileOpen(false)} />
          </div>
          <div className="mt-5 flex-1 overflow-y-auto px-3">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </div>
          <AccountBlock />
        </div>
      </div>

      {/* Content */}
      <main className="min-w-0">{children}</main>
    </div>
  );
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <Chrome>{children}</Chrome>
      <SubscriptionDrawer />
      <Toaster />
    </DashboardProvider>
  );
}
