import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign in — outlay",
};

export default function SignInPage() {
  return <AuthScreen mode="signIn" />;
}
