import Link from "next/link";

export default function Landing() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-slate-200 dark:border-slate-700 flex flex-row justify-between items-center shadow-sm">
        <h1 className="font-semibold text-slate-800 dark:text-slate-200">
          Outlay
        </h1>
        <Link
          href="/signin"
          className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
        >
          Sign in
        </Link>
      </header>
      <main className="flex flex-col items-center justify-center text-center gap-6 px-4 min-h-[calc(100vh-65px)]">
        <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-200">
          Outlay
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md">
          Landing page placeholder — design coming later.
        </p>
        <Link
          href="/signin"
          className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Get started
        </Link>
      </main>
    </>
  );
}
