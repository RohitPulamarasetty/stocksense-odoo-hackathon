"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Package, ArrowLeftRight, History, Settings, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operations", label: "Operations", icon: ArrowLeftRight },
  { href: "/products", label: "Products", icon: Package },
  { href: "/move-history", label: "Move History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="shrink-0 text-sm font-semibold tracking-tight">
            Stock<span className="text-brand">Sense</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground",
                    active && "bg-surface-muted text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <form
          className="hidden max-w-sm flex-1 sm:block"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q");
            if (q) router.push(`/search?q=${encodeURIComponent(String(q))}`);
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder="Search products, references…"
              className="h-8 w-full rounded-md border border-border bg-surface-muted pl-8 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            />
          </div>
        </form>
        <Link
          href="/profile"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted-foreground hover:text-foreground"
          aria-label="Profile"
        >
          <User className="size-4" />
        </Link>
      </div>
    </header>
  );
}
