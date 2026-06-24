"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { Subscription, SubscriptionDraft } from "@/lib/subscriptions";

type DrawerState = { open: boolean; editing: Subscription | null };
type Toast = { id: number; message: string };

type DashboardContextValue = {
  subscriptions: Subscription[];
  loading: boolean;
  drawer: DrawerState;
  openAdd: () => void;
  openEdit: (sub: Subscription) => void;
  closeDrawer: () => void;
  addSubscription: (draft: SubscriptionDraft) => void;
  updateSubscription: (id: string, draft: SubscriptionDraft) => void;
  deleteSubscription: (id: string) => void;
  markPaid: (id: string) => void;
  pauseSubscription: (id: string) => void;
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
    (message: string) => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => dismissToast(id), 3400);
    },
    [dismissToast],
  );

  const addSubscription = useCallback(
    (draft: SubscriptionDraft) => {
      void addMutation(draft);
    },
    [addMutation],
  );

  const updateSubscription = useCallback(
    (id: string, draft: SubscriptionDraft) => {
      void updateMutation({ id: id as Id<"subscriptions">, ...draft });
    },
    [updateMutation],
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      void removeMutation({ id: id as Id<"subscriptions"> });
    },
    [removeMutation],
  );

  const markPaid = useCallback(
    (id: string) => {
      void markPaidMutation({ id: id as Id<"subscriptions"> });
    },
    [markPaidMutation],
  );

  const pauseSubscription = useCallback(
    (id: string) => {
      void setStatusMutation({ id: id as Id<"subscriptions">, status: "paused" });
    },
    [setStatusMutation],
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
