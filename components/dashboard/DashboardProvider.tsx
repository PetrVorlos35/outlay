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
import type { Subscription, SubscriptionDraft } from "@/lib/subscriptions";
import { MOCK_SUBSCRIPTIONS } from "@/lib/mock";

type DrawerState = { open: boolean; editing: Subscription | null };
type Toast = { id: number; message: string };

type DashboardContextValue = {
  subscriptions: Subscription[];
  loading: boolean;
  drawer: DrawerState;
  openAdd: () => void;
  openEdit: (sub: Subscription) => void;
  closeDrawer: () => void;
  addSubscription: (draft: SubscriptionDraft) => Subscription;
  updateSubscription: (id: string, draft: SubscriptionDraft) => void;
  deleteSubscription: (id: string) => void;
  toasts: Toast[];
  notify: (message: string) => void;
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
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    () => MOCK_SUBSCRIPTIONS,
  );
  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    editing: null,
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  // Simulates the initial data fetch so skeletons are exercised now and the
  // swap to Convex's async `useQuery` (loading === data === undefined) is a
  // drop-in. Runs once when the dashboard mounts; route changes keep state.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(id);
  }, []);

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
    (message: string) => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => dismissToast(id), 3400);
    },
    [dismissToast],
  );

  const addSubscription = useCallback((draft: SubscriptionDraft) => {
    const sub: Subscription = {
      ...draft,
      id: `sub_${Date.now().toString(36)}`,
      currency: draft.currency ?? "USD",
    };
    setSubscriptions((prev) => [sub, ...prev]);
    return sub;
  }, []);

  const updateSubscription = useCallback(
    (id: string, draft: SubscriptionDraft) => {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, ...draft, id, currency: draft.currency ?? s.currency }
            : s,
        ),
      );
    },
    [],
  );

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

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
