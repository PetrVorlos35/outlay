"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChartColumnIncreasing,
  CornerDownLeft,
  CreditCard,
  LayoutGrid,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useDashboard } from "./DashboardProvider";
import SubLogo from "./SubLogo";

// Custom event the sidebar trigger dispatches so mouse users can open it too.
export const OPEN_PALETTE_EVENT = "outlay:command-palette";

type Item = {
  id: string;
  label: string;
  keywords: string;
  icon: React.ReactNode;
  run: () => void;
};

function isTypingTarget(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node) return false;
  return (
    node.tagName === "INPUT" ||
    node.tagName === "TEXTAREA" ||
    node.tagName === "SELECT" ||
    node.isContentEditable
  );
}

/**
 * Power-user command palette. ⌘K / Ctrl+K (or the sidebar trigger) opens it;
 * "n" anywhere adds a subscription. Jump to any page or any subscription, fully
 * keyboard-driven — the accelerator layer Alex (power user) was missing.
 */
export default function CommandPalette() {
  const t = useTranslations("dashboard.palette");
  const tnav = useTranslations("dashboard.nav");
  const router = useRouter();
  const { subscriptions, openAdd, openEdit } = useDashboard();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  // Global accelerators. Mounted for the whole dashboard lifetime.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette();
        return;
      }
      if (
        !open &&
        e.key.toLowerCase() === "n" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTypingTarget(e.target)
      ) {
        e.preventDefault();
        openAdd();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, openPalette);
    };
  }, [open, openAdd, openPalette]);

  // Focus the input and lock background scroll while open (DOM side-effects only).
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const close = () => setOpen(false);
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    const add: Item = {
      id: "add",
      label: t("add"),
      keywords: "add new create subscription přidat",
      icon: <Plus className="h-4 w-4" />,
      run: () => {
        close();
        openAdd();
      },
    };
    const nav: Item[] = [
      { id: "go-overview", label: tnav("overview"), keywords: "overview home přehled", icon: <LayoutGrid className="h-4 w-4" />, run: go("/dashboard") },
      { id: "go-subscriptions", label: tnav("subscriptions"), keywords: "subscriptions list předplatná", icon: <CreditCard className="h-4 w-4" />, run: go("/dashboard/subscriptions") },
      { id: "go-insights", label: tnav("insights"), keywords: "insights charts spend statistiky", icon: <ChartColumnIncreasing className="h-4 w-4" />, run: go("/dashboard/insights") },
      { id: "go-settings", label: tnav("settings"), keywords: "settings preferences account nastavení", icon: <Settings className="h-4 w-4" />, run: go("/dashboard/settings") },
    ];
    const subs: Item[] = subscriptions.map((s) => ({
      id: `sub-${s.id}`,
      label: s.name,
      keywords: s.name,
      icon: <SubLogo sub={s} size="sm" />,
      run: () => {
        close();
        openEdit(s);
      },
    }));
    return [add, ...nav, ...subs];
  }, [subscriptions, t, tnav, router, openAdd, openEdit]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.keywords.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Keep the active index in range as the list shrinks.
  const activeIndex = Math.min(active, Math.max(filtered.length - 1, 0));

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIndex]?.run();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-navy/40"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("placeholder")}
        className="animate-toast-in relative w-full max-w-lg overflow-hidden rounded-2xl border border-navy/10 bg-paper shadow-[0_24px_60px_-20px_rgba(11,18,32,0.5)] motion-reduce:animate-none"
      >
        <div className="flex items-center gap-2.5 border-b border-navy/[0.07] px-4">
          <Search className="h-4 w-4 shrink-0 text-navy/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("placeholder")}
            className="h-12 w-full bg-transparent text-sm text-navy placeholder:text-navy/40 focus:outline-none"
          />
        </div>

        <div
          role="listbox"
          aria-label={t("placeholder")}
          className="max-h-[min(60vh,22rem)] overflow-y-auto p-1.5"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-navy/50">
              {t("empty")}
            </p>
          ) : (
            filtered.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="option"
                onClick={() => it.run()}
                onMouseMove={() => setActive(i)}
                aria-selected={i === activeIndex}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === activeIndex ? "bg-navy/[0.06]" : "hover:bg-navy/[0.03]"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-navy/55">
                  {it.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
                  {it.label}
                </span>
                {i === activeIndex && (
                  <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-navy/35" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-navy/[0.07] px-4 py-2 text-[11px] text-navy/45">
          <Kbd>↑↓</Kbd>
          <span>{t("navigate")}</span>
          <Kbd>↵</Kbd>
          <span>{t("select")}</span>
          <Kbd>esc</Kbd>
          <span>{t("close")}</span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-navy/15 bg-white px-1.5 py-0.5 font-mono text-[10px] text-navy/55">
      {children}
    </kbd>
  );
}
