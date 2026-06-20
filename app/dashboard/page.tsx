"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center shadow-sm">
        <h1 className="font-semibold text-slate-800 dark:text-slate-200">
          Outlay
        </h1>
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <div className="max-w-lg mx-auto">
          <h2 className="font-bold text-xl text-slate-800 dark:text-slate-200">
            Welcome to Outlay
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Start building your app here.
          </p>
        </div>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          onClick={() =>
            void signOut().then(() => {
              router.push("/");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}
