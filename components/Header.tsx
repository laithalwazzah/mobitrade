import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-900">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="7" y="2" width="10" height="20" rx="2.5" />
              <path d="M11 18h2" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-white">
              سعّرلي
            </span>
            <span className="block text-xs text-slate-400">
              موبايلات اللاذقية
            </span>
          </span>
        </Link>
        <Link
          href="/add"
          className="rounded-full border border-emerald-400/40 px-5 py-2 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400 hover:text-slate-900"
        >
          أضف سعر
        </Link>
      </nav>
    </header>
  );
}