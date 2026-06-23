import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
    Password({
      // Capture the display name on sign-up; ignored on sign-in.
      profile(params) {
        const name = (params.name as string | undefined)?.trim();
        return {
          email: params.email as string,
          ...(name ? { name } : {}),
        };
      },
    }),
  ],
});
