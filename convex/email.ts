"use node";

import { v } from "convex/values";
import nodemailer from "nodemailer";
import { internalAction } from "./_generated/server";

// SMTP delivery via nodemailer. Runs in the Node runtime (nodemailer needs
// Node's net/tls). Configure these in the Convex deployment env:
//   SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS, EMAIL_FROM
export const send = internalAction({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.string(),
  },
  handler: async (_ctx, { to, subject, html, text }) => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.EMAIL_FROM ?? user;

    if (!host || !user || !pass) {
      throw new Error(
        "Missing SMTP config. Set SMTP_HOST, SMTP_USER and SMTP_PASS in the Convex deployment env.",
      );
    }

    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user, pass },
    });

    await transport.sendMail({ from, to, subject, text, html });
    return null;
  },
});
