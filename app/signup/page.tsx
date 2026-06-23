import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Create your account — outlay",
};

export default function SignUpPage() {
  return <AuthScreen mode="signUp" />;
}
