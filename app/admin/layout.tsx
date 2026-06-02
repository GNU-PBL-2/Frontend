"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_TABS = [
  { label: "YouTube 등록", href: "/admin" },
  { label: "레시피 관리", href: "/admin/recipes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-2xl bg-white min-h-screen">
        <div className="sticky top-0 z-20 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <div className="px-6 pt-8 pb-0">
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">
              Admin Panel
            </span>
            <h1 className="text-xl font-extrabold text-gray-900 mt-0.5">관리자 페이지</h1>
          </div>
          <nav className="flex mt-3 px-2">
            {NAV_TABS.map((tab) => {
              const isActive =
                tab.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    isActive
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
