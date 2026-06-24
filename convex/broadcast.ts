"use node";

import { v } from "convex/values";
import nodemailer from "nodemailer";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function template(heading: string, body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:rgba(11,18,32,0.75);">${esc(
          p,
        ).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#fafaf9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0b1220;">
    <div style="max-width:480px;margin:0 auto;padding:40px 24px;">
      <div style="display:inline-flex;align-items:center;gap:8px;font-size:18px;font-weight:600;letter-spacing:-0.02em;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#10b981;"></span>
        outlay
      </div>
      <div style="margin-top:28px;background:#ffffff;border:1px solid rgba(11,18,32,0.10);border-radius:16px;padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;letter-spacing:-0.01em;">${esc(heading)}</h1>
        ${paragraphs}
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:rgba(11,18,32,0.40);">You're getting this because you joined the outlay waitlist.</p>
    </div>
  </body>
</html>`;
}

/**
 * Send one collective email to every waitlist subscriber. Each recipient gets
 * their own copy (no shared To/BCC — keeps addresses private). One reused SMTP
 * connection. Trigger with:
 *
 *   npx convex run broadcast:waitlist '{"subject":"...","heading":"...","body":"line one\n\nline two"}'
 */
export const waitlist = internalAction({
  args: {
    subject: v.string(),
    heading: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (
    ctx,
    { subject, heading, body },
  ): Promise<{ total: number; sent: number; failed: number }> => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM ?? user;
    if (!host || !user || !pass) {
      throw new Error("Missing SMTP config (SMTP_HOST, SMTP_USER, SMTP_PASS).");
    }

    const emails: string[] = await ctx.runQuery(internal.waitlist.allEmails, {});
    if (emails.length === 0) return { total: 0, sent: 0, failed: 0 };

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const html = template(heading ?? subject, body);

    let sent = 0;
    let failed = 0;
    for (const to of emails) {
      try {
        await transport.sendMail({ from, to, subject, text: body, html });
        sent++;
      } catch (err) {
        failed++;
        console.error(`Broadcast failed for ${to}:`, err);
      }
    }

    return { total: emails.length, sent, failed };
  },
});
