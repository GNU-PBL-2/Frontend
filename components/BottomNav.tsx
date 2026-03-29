"use client"

import Link from "next/link"
import { usePathname } from "next/navigation";

export default function BottomNav() {

  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "홈", icon: "🏠" },
    { href: "/fridge", label: "냉장고", icon: "❄️" },
    { href: "/cart", label: "장바구니", icon: "🛒" },
    { href: "/recipe", label: "레시피", icon: "👨‍🍳" },
    { href: "/mypage", label: "MY", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-sm -translate-x-1/2 bg-white px-4 py-2 h-20">
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center transition-colors ${
                isActive ? "text-black font-bold" : "text-gray-400"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}