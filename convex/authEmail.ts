import { Email } from "@convex-dev/auth/providers/Email";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimits";

// Throttle outgoing OTP emails per address (server-side backstop for the
// client "Resend in 0:30" countdown). Throws if the address asked too soon,
// which rejects the signIn call before any email is sent.
async function guardOtpEmail(ctx: ActionCtx, email: string) {
  const key = email.trim().toLowerCase();
  const { ok, retryAfter } = await rateLimiter.limit(ctx, "sendOtp", { key });
  if (!ok) {
    const seconds = Math.ceil((retryAfter ?? 0) / 1000);
    throw new Error(
      `Too many code requests. Please wait ${seconds}s before trying again.`,
    );
  }
}

// 6-digit numeric OTP. Short tokens are paired with the email on verification
// (Convex Auth checks the code matches the email used to request it).
function generateCode(): string {
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
}

const CODE_TTL_SECONDS = 60 * 15; // 15 minutes

function otpEmail(heading: string, intro: string, code: string): string {
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
        <p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:rgba(11,18,32,0.65);">${intro}</p>
        <div style="margin:24px 0;text-align:center;">
          <span style="display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:32px;font-weight:600;letter-spacing:8px;color:#047857;background:rgba(16,185,129,0.08);border-radius:12px;padding:14px 20px;">${code}</span>
        </div>
        <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(11,18,32,0.50);">This code expires in 15 minutes. If you didn't request it, you can safely ignore this email.</p>
      </div>
      <p style="margin:20px 0 0;font-size:12px;color:rgba(11,18,32,0.40);">Every recurring charge, always visible.</p>
    </div>
  </body>
</html>`;
}

/** Sends a verification code when a new account signs up. */
export const EmailVerification = Email({
  id: "email-verification",
  maxAge: CODE_TTL_SECONDS,
  generateVerificationToken: async () => generateCode(),
  sendVerificationRequest: async (
    { identifier: email, token }: { identifier: string; token: string },
    ctx?: ActionCtx,
  ) => {
    await guardOtpEmail(ctx!, email);
    await ctx!.runAction(internal.email.send, {
      to: email,
      subject: "Verify your email — outlay",
      text: `Your outlay verification code is ${token}. It expires in 15 minutes.`,
      html: otpEmail(
        "Verify your email",
        "Enter this code to finish creating your outlay account.",
        token,
      ),
    });
  },
});

/** Sends a code so the user can set a new password. */
export const PasswordReset = Email({
  id: "password-reset",
  maxAge: CODE_TTL_SECONDS,
  generateVerificationToken: async () => generateCode(),
  sendVerificationRequest: async (
    { identifier: email, token }: { identifier: string; token: string },
    ctx?: ActionCtx,
  ) => {
    await guardOtpEmail(ctx!, email);
    await ctx!.runAction(internal.email.send, {
      to: email,
      subject: "Reset your password — outlay",
      text: `Your outlay password reset code is ${token}. It expires in 15 minutes.`,
      html: otpEmail(
        "Reset your password",
        "Use this code to set a new password for your outlay account.",
        token,
      ),
    });
  },
});
