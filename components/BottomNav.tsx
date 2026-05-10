"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Refrigerator, ChefHat, ShoppingCart, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",        label: "홈",       Icon: Home,         activeColor: "text-green-700" },
  { href: "/fridge",  label: "냉장고",   Icon: Refrigerator, activeColor: "text-sky-600"   },
  { href: "/recipe",  label: "레시피",   Icon: ChefHat,      activeColor: "text-green-700" },
  { href: "/cart",    label: "장바구니", Icon: ShoppingCart, activeColor: "text-amber-600" },
  { href: "/mypage",  label: "MY",       Icon: User,         activeColor: "text-purple-600" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 w-full max-w-sm -translate-x-1/2 bg-white/95 backdrop-blur-md border-t border-gray-100 px-2 py-2 h-[62px] z-50">
      <div className="flex items-center justify-around h-full">
        {NAV_ITEMS.map(({ href, label, Icon, activeColor }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 active:scale-90"
            >
              <Icon
                className={`w-[22px] h-[22px] transition-colors duration-200 ${isActive ? activeColor : "text-gray-300"}`}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? activeColor : "text-gray-300"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
