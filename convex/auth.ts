import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { EmailVerification, PasswordReset } from "./authEmail";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    // Default Google behavior: auto sign-in with a single account, show the
    // account chooser only when more than one Google account is signed in.
    Google,
    Password({
      // Capture the display name on sign-up; ignored on sign-in.
      profile(params) {
        const name = (params.name as string | undefined)?.trim();
        return {
          email: params.email as string,
          ...(name ? { name } : {}),
        };
      },
      // Email a code on sign-up; the account must verify before it's active.
      verify: EmailVerification,
      // Email a code to authorize a password reset.
      reset: PasswordReset,
    }),
  ],
});
