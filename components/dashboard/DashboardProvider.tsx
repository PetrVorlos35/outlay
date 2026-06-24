"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  totalMonthly,
  type Subscription,
  type SubscriptionDraft,
} from "@/lib/subscriptions";

type DrawerState = { open: boolean; editing: Subscription | null };
type ToastTone = "success" | "error";
type ToastAction = { label: string; run: () => void };
type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
  action?: ToastAction;
};
type NotifyOptions = { tone?: ToastTone; action?: ToastAction };

type DashboardContextValue = {
  subscriptions: Subscription[];
  loading: boolean;
  drawer: DrawerState;
  openAdd: () => void;
  openEdit: (sub: Subscription) => void;
  closeDrawer: () => void;
  // Writes resolve to `true` on success, `false` on failure (they surface their
  // own toast either way), so callers can gate UI like closing the drawer.
  addSubscription: (draft: SubscriptionDraft) => Promise<boolean>;
  updateSubscription: (id: string, draft: SubscriptionDraft) => Promise<boolean>;
  deleteSubscription: (id: string, name: string) => Promise<boolean>;
  markPaid: (sub: Subscription) => Promise<void>;
  pauseSubscription: (sub: Subscription) => Promise<void>;
  toasts: Toast[];
  notify: (message: string, opts?: NotifyOptions) => void;
  dismissToast: (id: number) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within <DashboardProvider>");
  }
  return ctx;
}

export default function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const tt = useTranslations("dashboard.toast");

  // Live, per-user data from Convex. `undefined` while the first fetch is in
  // flight — that drives the loading skeletons.
  const data = useQuery(api.subscriptions.list);
  const loading = data === undefined;
  const subscriptions = useMemo<Subscription[]>(() => data ?? [], [data]);

  const addMutation = useMutation(api.subscriptions.add);
  const updateMutation = useMutation(api.subscriptions.update);
  const removeMutation = useMutation(api.subscriptions.remove);
  const markPaidMutation = useMutation(api.subscriptions.markPaid);
  const setStatusMutation = useMutation(api.subscriptions.setStatus);
  const setRenewalMutation = useMutation(api.subscriptions.setRenewal);
  const recordSpendMutation = useMutation(api.spend.recordCurrentMonth);

  // Keep this month's real spend snapshot fresh as subscriptions change, so the
  // trend chart is backed by actual history. No-ops server-side when unchanged;
  // the ref skips redundant calls when the normalized total hasn't moved.
  const lastRecorded = useRef<number | null>(null);
  useEffect(() => {
    if (loading) return;
    const total = Math.round(totalMonthly(subscriptions) * 100) / 100;
    if (lastRecorded.current === total) return;
    lastRecorded.current = total;
    void recordSpendMutation({});
  }, [loading, subscriptions, recordSpendMutation]);

  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    editing: null,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const openAdd = useCallback(
    () => setDrawer({ open: true, editing: null }),
    [],
  );
  const openEdit = useCallback(
    (sub: Subscription) => setDrawer({ open: true, editing: sub }),
    [],
  );
  // Keep `editing` during the close transition so the drawer doesn't flicker
  // its title/fields to the "add" state on the way out.
  const closeDrawer = useCallback(
    () => setDrawer((d) => ({ ...d, open: false })),
    [],
  );

  const dismissToast = useCallback(
    (id: number) => setToasts((t) => t.filter((toast) => toast.id !== id)),
    [],
  );

  const notify = useCallback(
    (message: string, opts?: NotifyOptions) => {
      const id = nextId.current++;
      const tone = opts?.tone ?? "success";
      const action = opts?.action;
      setToasts((t) => [...t, { id, message, tone, action }]);
      // Give undoable and error toasts longer to be read/acted on.
      const ttl = action ? 6000 : tone === "error" ? 5000 : 3400;
      setTimeout(() => dismissToast(id), ttl);
    },
    [dismissToast],
  );

  // Run a write, toast success (with an optional undo action) or a real error.
  const runWrite = useCallback(
    async (
      op: () => Promise<unknown>,
      successMessage: string,
      action?: ToastAction,
    ): Promise<boolean> => {
      try {
        await op();
        notify(successMessage, { action });
        return true;
      } catch {
        notify(tt("error"), { tone: "error" });
        return false;
      }
    },
    [notify, tt],
  );

  const addSubscription = useCallback(
    (draft: SubscriptionDraft) =>
      runWrite(() => addMutation(draft), tt("added", { name: draft.name })),
    [runWrite, addMutation, tt],
  );

  const updateSubscription = useCallback(
    (id: string, draft: SubscriptionDraft) =>
      runWrite(
        () => updateMutation({ id: id as Id<"subscriptions">, ...draft }),
        tt("updated", { name: draft.name }),
      ),
    [runWrite, updateMutation, tt],
  );

  const deleteSubscription = useCallback(
    (id: string, name: string) =>
      runWrite(
        () => removeMutation({ id: id as Id<"subscriptions"> }),
        tt("deleted", { name }),
      ),
    [runWrite, removeMutation, tt],
  );

  const markPaid = useCallback(
    async (sub: Subscription) => {
      const previousRenewal = sub.nextRenewal;
      await runWrite(
        () => markPaidMutation({ id: sub.id as Id<"subscriptions"> }),
        tt("paid", { name: sub.name }),
        {
          label: tt("undo"),
          run: () => {
            void setRenewalMutation({
              id: sub.id as Id<"subscriptions">,
              nextRenewal: previousRenewal,
            });
            notify(tt("reverted", { name: sub.name }));
          },
        },
      );
    },
    [runWrite, markPaidMutation, setRenewalMutation, notify, tt],
  );

  const pauseSubscription = useCallback(
    async (sub: Subscription) => {
      await runWrite(
        () =>
          setStatusMutation({
            id: sub.id as Id<"subscriptions">,
            status: "paused",
          }),
        tt("canceled", { name: sub.name }),
        {
          label: tt("undo"),
          run: () => {
            void setStatusMutation({
              id: sub.id as Id<"subscriptions">,
              status: "active",
            });
            notify(tt("reverted", { name: sub.name }));
          },
        },
      );
    },
    [runWrite, setStatusMutation, notify, tt],
  );

  const value = useMemo<DashboardContextValue>(
    () => ({
      subscriptions,
      loading,
      drawer,
      openAdd,
      openEdit,
      closeDrawer,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      markPaid,
      pauseSubscription,
      toasts,
      notify,
      dismissToast,
    }),
    [
      subscriptions,
      loading,
      drawer,
      openAdd,
      openEdit,
      closeDrawer,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      markPaid,
      pauseSubscription,
      toasts,
      notify,
      dismissToast,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
