import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getPrefsForUser } from "./preferences";

// Widest lead window we support; per-user preference narrows it.
const MAX_LEAD = 7;

function isoInDays(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function toMonthly(price: number, cycle: string): number {
  switch (cycle) {
    case "weekly":
      return (price * 52) / 12;
    case "quarterly":
      return price / 3;
    case "yearly":
      return price / 12;
    default:
      return price; // monthly
  }
}

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function shortDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function shell(heading: string, intro: string, inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#fafaf9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0b1220;">
    <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
      <div style="display:inline-flex;align-items:center;gap:8px;font-size:18px;font-weight:600;letter-spacing:-0.02em;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#10b981;"></span>
        outlay
      </div>
      <div style="margin-top:28px;background:#ffffff;border:1px solid rgba(11,18,32,0.10);border-radius:16px;padding:28px;">
        <h1 style="margin:0;font-size:20px;font-weight:600;letter-spacing:-0.01em;">${heading}</h1>
        <p style="margin:10px 0 18px;font-size:15px;line-height:1.6;color:rgba(11,18,32,0.65);">${intro}</p>
        ${inner}
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:rgba(11,18,32,0.40);">Every recurring charge, always visible.</p>
    </div>
  </body>
</html>`;
}

function rowsTable(rows: { label: string; right: string; amber?: boolean }[]): string {
  const body = rows
    .map(
      (r) => `<tr>
        <td style="padding:10px 0;border-top:1px solid rgba(11,18,32,0.08);font-size:14px;color:#0b1220;">${r.label}</td>
        <td style="padding:10px 0;border-top:1px solid rgba(11,18,32,0.08);font-size:13px;color:${r.amber ? "#b45309" : "rgba(11,18,32,0.55)"};text-align:right;white-space:nowrap;">${r.right}</td>
      </tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;">${body}</table>`;
}

// ── Renewal reminders ─────────────────────────────────────────────────────

type DueReminder = {
  id: Id<"subscriptions">;
  email: string;
  name: string;
  price: number;
  currency: string;
  nextRenewal: string;
};

/** Active subs renewing within each owner's chosen lead window, not yet reminded. */
export const dueReminders = internalQuery({
  args: {},
  handler: async (ctx): Promise<DueReminder[]> => {
    const today = isoInDays(0);
    const until = isoInDays(MAX_LEAD);

    const rows = await ctx.db
      .query("subscriptions")
      .withIndex("by_status_and_nextRenewal", (q) =>
        q.eq("status", "active").gte("nextRenewal", today).lte("nextRenewal", until),
      )
      .take(2000);

    const leadCache = new Map<string, number>();
    const out: DueReminder[] = [];

    for (const s of rows) {
      if (s.lastReminderSent === s.nextRenewal) continue;

      let lead = leadCache.get(s.userId);
      if (lead === undefined) {
        lead = (await getPrefsForUser(ctx, s.userId)).reminderLeadDays;
        leadCache.set(s.userId, lead);
      }
      if (daysUntil(s.nextRenewal) > lead) continue;

      const user = await ctx.db.get(s.userId);
      if (!user?.email) continue;
      out.push({
        id: s._id,
        email: user.email,
        name: s.name,
        price: s.price,
        currency: s.currency,
        nextRenewal: s.nextRenewal,
      });
    }
    return out;
  },
});

export const markReminded = internalMutation({
  args: { id: v.id("subscriptions"), renewal: v.string() },
  handler: async (ctx, { id, renewal }) => {
    await ctx.db.patch(id, { lastReminderSent: renewal });
    return null;
  },
});

function reminderEmail(items: DueReminder[]): { subject: string; text: string; html: string } {
  const subject =
    items.length === 1
      ? `${items[0].name} renews soon — outlay`
      : `${items.length} subscriptions renew soon — outlay`;
  const text =
    `These renew soon:\n\n` +
    items.map((i) => `• ${i.name} ${money(i.price, i.currency)} — ${shortDate(i.nextRenewal)}`).join("\n");
  const html = shell(
    "Renewals coming up",
    "These renew soon — cancel, pause, or plan before the money moves.",
    rowsTable(
      items.map((i) => ({
        label: `${i.name} · ${money(i.price, i.currency)}`,
        right: shortDate(i.nextRenewal),
        amber: true,
      })),
    ),
  );
  return { subject, text, html };
}

/** Daily cron: email each user about their upcoming renewals. */
export const sendDueReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number }> => {
    const due = await ctx.runQuery(internal.notifications.dueReminders, {});
    if (due.length === 0) return { sent: 0 };

    const byEmail = new Map<string, DueReminder[]>();
    for (const r of due) {
      const list = byEmail.get(r.email) ?? [];
      list.push(r);
      byEmail.set(r.email, list);
    }

    let sent = 0;
    for (const [email, items] of byEmail) {
      const { subject, text, html } = reminderEmail(items);
      try {
        await ctx.runAction(internal.email.send, { to: email, subject, text, html });
        for (const item of items) {
          await ctx.runMutation(internal.notifications.markReminded, {
            id: item.id,
            renewal: item.nextRenewal,
          });
        }
        sent++;
      } catch (err) {
        console.error(`Failed to send renewal reminder to ${email}:`, err);
      }
    }
    return { sent };
  },
});

// ── Price-hike alerts ─────────────────────────────────────────────────────

/** Built in the `subscriptions.update` mutation when a price increases. */
export function priceHikeEmail(
  name: string,
  oldPrice: number,
  newPrice: number,
  currency: string,
): { subject: string; text: string; html: string } {
  const subject = `${name} raised its price — outlay`;
  const text = `${name} went from ${money(oldPrice, currency)} to ${money(newPrice, currency)}.`;
  const html = shell(
    "A price went up",
    `${name} now costs more than before.`,
    rowsTable([
      { label: "Was", right: money(oldPrice, currency) },
      { label: "Now", right: money(newPrice, currency), amber: true },
    ]),
  );
  return { subject, text, html };
}

// ── Weekly summary ────────────────────────────────────────────────────────

type WeeklyRecipient = {
  email: string;
  monthly: number;
  currency: string;
  upcoming: { name: string; price: number; currency: string; nextRenewal: string }[];
};

export const weeklySummaryRecipients = internalQuery({
  args: {},
  handler: async (ctx): Promise<WeeklyRecipient[]> => {
    const prefs = await ctx.db.query("notificationPrefs").take(10000);
    const out: WeeklyRecipient[] = [];

    for (const p of prefs) {
      if (!p.weeklySummary) continue;
      const user = await ctx.db.get(p.userId);
      if (!user?.email) continue;

      const subs = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", p.userId))
        .take(1000);
      const active = subs.filter((s) => s.status === "active");
      const monthly = active.reduce((sum, s) => sum + toMonthly(s.price, s.cycle), 0);
      const upcoming = active
        .filter((s) => {
          const d = daysUntil(s.nextRenewal);
          return d >= 0 && d <= 7;
        })
        .sort((a, b) => daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal))
        .map((s) => ({
          name: s.name,
          price: s.price,
          currency: s.currency,
          nextRenewal: s.nextRenewal,
        }));

      out.push({
        email: user.email,
        monthly,
        currency: active[0]?.currency ?? "USD",
        upcoming,
      });
    }
    return out;
  },
});

function weeklyEmail(r: WeeklyRecipient): { subject: string; text: string; html: string } {
  const subject = "Your week in subscriptions — outlay";
  const upcomingText =
    r.upcoming.length === 0
      ? "No renewals in the next 7 days."
      : r.upcoming
          .map((i) => `• ${i.name} ${money(i.price, i.currency)} — ${shortDate(i.nextRenewal)}`)
          .join("\n");
  const text = `Monthly spend: ${money(r.monthly, r.currency)}\n\nThis week:\n${upcomingText}`;

  const totalBlock = `<div style="margin-bottom:18px;">
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.04em;color:rgba(11,18,32,0.55);">Monthly spend</div>
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:28px;font-weight:600;color:#0b1220;">${money(r.monthly, r.currency)}</div>
  </div>`;
  const list =
    r.upcoming.length === 0
      ? `<p style="margin:0;font-size:14px;color:rgba(11,18,32,0.55);">No renewals in the next 7 days.</p>`
      : rowsTable(
          r.upcoming.map((i) => ({
            label: `${i.name} · ${money(i.price, i.currency)}`,
            right: shortDate(i.nextRenewal),
          })),
        );

  const html = shell("Your week in subscriptions", "A quick recap of what's coming up.", totalBlock + list);
  return { subject, text, html };
}

/** Weekly cron (Mondays): email a recap to users who opted in. */
export const sendWeeklySummaries = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number }> => {
    const recipients = await ctx.runQuery(internal.notifications.weeklySummaryRecipients, {});
    let sent = 0;
    for (const r of recipients) {
      const { subject, text, html } = weeklyEmail(r);
      try {
        await ctx.runAction(internal.email.send, { to: r.email, subject, text, html });
        sent++;
      } catch (err) {
        console.error(`Failed to send weekly summary to ${r.email}:`, err);
      }
    }
    return { sent };
  },
});
