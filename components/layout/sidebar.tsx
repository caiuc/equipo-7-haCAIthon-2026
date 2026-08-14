"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/network", label: "Red de salud" },
  { href: "/inventory", label: "Inventario" },
  { href: "/transfers", label: "Transferencias" },
  { href: "/purchases", label: "Compras" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-r border-cyan-100 bg-white md:w-72">
      <div className="sticky top-0 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-cyan-950">MedStock</h1>
        <p className="mt-1 text-sm text-slate-500">Hackathon Salud Publica</p>

        <nav className="mt-8 space-y-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/25"
                    : "text-slate-700 hover:bg-cyan-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
