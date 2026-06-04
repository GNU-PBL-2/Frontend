"use client";

import { useState, useEffect, type ComponentType } from "react";
import Link from "next/link";
import {
  Bell, Trash2, Timer, Package, AlertTriangle,
  Refrigerator, ChefHat, ShoppingCart, Plus,
  CheckCircle2, ChevronRight, Beef, Milk, Egg,
  Leaf, Carrot, Utensils, Flame,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { getUserIdFromToken } from "@/utils/auth";
import {
  fetchUserProfile,
  fetchNotifications,
  fetchFridgeItems,
  type NotificationItem,
} from "@/lib/dashboardApi";

type LucideIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

const INGREDIENT_ICON: Record<string, { Icon: LucideIcon; color: string; bg: string }> = {
  소고기:   { Icon: Beef,    color: "text-red-500",    bg: "bg-red-50"    },
  돼지고기: { Icon: Beef,    color: "text-red-400",    bg: "bg-red-50"    },
  닭고기:   { Icon: Beef,    color: "text-orange-400", bg: "bg-orange-50" },
  계란:     { Icon: Egg,     color: "text-yellow-500", bg: "bg-yellow-50" },
  우유:     { Icon: Milk,    color: "text-sky-400",    bg: "bg-sky-50"    },
  두부:     { Icon: Package, color: "text-gray-400",   bg: "bg-gray-100"  },
  시금치:   { Icon: Leaf,    color: "text-green-500",  bg: "bg-green-50"  },
  당근:     { Icon: Carrot,  color: "text-orange-500", bg: "bg-orange-50" },
  양파:     { Icon: Utensils,color: "text-purple-400", bg: "bg-purple-50" },
  대파:     { Icon: Leaf,    color: "text-green-400",  bg: "bg-green-50"  },
  김치:     { Icon: Flame,   color: "text-red-500",    bg: "bg-red-50"    },
  토마토:   { Icon: Leaf,    color: "text-red-400",    bg: "bg-red-50"    },
  마늘:     { Icon: Utensils,color: "text-amber-500",  bg: "bg-amber-50"  },
};
const DEFAULT_INGREDIENT = { Icon: Utensils, color: "text-gray-400", bg: "bg-gray-100" };

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "좋은 오후예요";
  return "좋은 저녁이에요";
}

function getDdayLabel(days: number): string {
  if (days < 0) return `D+${Math.abs(days)}`;
  if (days === 0) return "D-Day";
  return `D-${days}`;
}

function DashboardSkeleton() {
  return (
    <div className="bg-[#F4F7EF] min-h-screen flex justify-center">
      <div className="w-full max-w-sm pb-24">
        <div className="px-5 pt-12 pb-20 animate-pulse" style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d7a4f 100%)" }}>
          <div className="h-3 bg-green-600/50 rounded-full w-32 mb-3" />
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-7 bg-green-600/50 rounded-lg w-40" />
              <div className="h-7 bg-green-600/30 rounded-lg w-28" />
            </div>
            <div className="w-11 h-11 bg-green-600/40 rounded-full" />
          </div>
        </div>
        <div className="mx-4 -mt-14 relative z-10 bg-white rounded-3xl shadow-2xl shadow-black/10 px-2 py-5 animate-pulse">
          <div className="grid grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`flex flex-col items-center gap-2 px-2 ${i < 2 ? "border-r border-gray-100" : ""}`}>
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="h-6 bg-gray-100 rounded w-8" />
                <div className="h-3 bg-gray-100 rounded w-14" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-4 mt-5 space-y-4 animate-pulse">
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 bg-white rounded-2xl shadow-sm" />)}
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded-lg w-24" />
            <div className="grid grid-cols-3 gap-2.5">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl shadow-sm" />)}
            </div>
          </div>
          <div className="h-20 bg-white rounded-2xl shadow-sm" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [username, setUsername] = useState("...");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [totalFridgeCount, setTotalFridgeCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profile, notifs] = await Promise.allSettled([
        fetchUserProfile(),
        fetchNotifications(),
      ]);
      if (profile.status === "fulfilled") setUsername(profile.value.name);
      if (notifs.status === "fulfilled") {
        setNotifications(notifs.value);
        setUnreadCount(notifs.value.filter((n) => !n.isRead).length);
      }
      const userId = getUserIdFromToken();
      if (userId) {
        const fridge = await fetchFridgeItems(userId).catch(() => null);
        if (fridge) setTotalFridgeCount(fridge.length);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const todayExpiryItems = notifications.filter((n) => n.daysUntilExpiry === 0);
  const urgentItems = notifications.filter(
    (n) => n.daysUntilExpiry >= 1 && n.daysUntilExpiry <= 3
  );
  const urgentDisplayItems = [...urgentItems]
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .slice(0, 3);

  const STATS = [
    { Icon: Trash2,  value: todayExpiryItems.length,  label: "오늘 폐기 예상", color: "text-red-500",    iconColor: "text-red-400",    bg: "bg-red-50"    },
    { Icon: Timer,   value: urgentItems.length,        label: "D-3 임박",       color: "text-orange-400", iconColor: "text-orange-400", bg: "bg-orange-50" },
    { Icon: Package, value: totalFridgeCount ?? "—",  label: "전체 재료",      color: "text-green-600",  iconColor: "text-green-500",  bg: "bg-green-50"  },
  ];

  const QUICK_ACTIONS = [
    { href: "/fridge",  Icon: Refrigerator,  label: "냉장고",   iconColor: "text-sky-500",    bg: "bg-sky-50",    labelColor: "text-sky-600"    },
    { href: "/recipe",  Icon: ChefHat,       label: "레시피",   iconColor: "text-green-600",  bg: "bg-green-50",  labelColor: "text-green-700"  },
    { href: "/cart",    Icon: ShoppingCart,  label: "장바구니", iconColor: "text-amber-500",  bg: "bg-amber-50",  labelColor: "text-amber-600"  },
    { href: "/alarm",   Icon: Bell,          label: "알림",     iconColor: "text-rose-500",   bg: "bg-rose-50",   labelColor: "text-rose-600",  badge: unreadCount > 0 },
  ] as const;

  return (
    <div className="bg-[#F4F7EF] min-h-screen flex justify-center">
      <div className="w-full max-w-sm pb-24">

        {/* ── 그라디언트 헤더 ── */}
        <div
          className="relative px-5 pt-12 pb-20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d7a4f 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/[0.04]" />
          <div className="absolute top-6 -right-3 w-24 h-24 rounded-full bg-white/[0.06]" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/[0.03]" />

          <p className="text-green-300/90 text-xs font-medium mb-3 relative z-10 flex items-center gap-1.5">
            {getGreeting()}
          </p>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-white text-[23px] font-bold leading-snug tracking-tight">
                {username}님의
              </h1>
              <h1 className="text-green-300 text-[23px] font-bold leading-snug tracking-tight">
                냉장고
              </h1>
            </div>
            <Link
              href="/alarm"
              className="relative w-11 h-11 rounded-full flex items-center justify-center border border-white/20"
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
            >
              <Bell className="w-5 h-5 text-white" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── 오버랩 스탯 카드 ── */}
        <div className="mx-4 -mt-14 relative z-10 bg-white rounded-3xl shadow-2xl shadow-black/[0.12] px-2 py-5">
          <div className="grid grid-cols-3">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-1.5 px-2 ${i < 2 ? "border-r border-gray-100" : ""}`}
              >
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={1.8} />
                </div>
                <p className={`text-2xl font-bold ${stat.color} leading-none`}>{stat.value}</p>
                <p className="text-[10px] text-gray-400 text-center leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 메인 컨텐츠 ── */}
        <div className="px-4 mt-5 space-y-4">

          {/* 폐기 위험 배너 */}
          {todayExpiryItems.length > 0 && (
            <Link href="/urgent" className="block">
              <div
                className="rounded-2xl px-4 py-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)", boxShadow: "0 8px 24px rgba(239,68,68,0.28)" }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-snug">
                    오늘 폐기 예상 재료 {todayExpiryItems.length}개
                  </p>
                  <p className="text-orange-100 text-xs truncate mt-0.5">
                    {todayExpiryItems.map((i) => i.ingredientName).join(", ")} — 지금 바로 확인하세요
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/60 shrink-0" strokeWidth={2} />
              </div>
            </Link>
          )}

          {/* 빠른 실행 */}
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-2xl py-3.5 flex flex-col items-center gap-1.5 shadow-sm relative active:scale-95 transition-transform"
              >
                <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                  <item.Icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={1.8} />
                </div>
                <p className={`text-[10px] font-bold ${item.labelColor}`}>{item.label}</p>
                {"badge" in item && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* 임박 재료 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">유통기한 임박 재료</h2>
                {urgentItems.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {urgentItems.length}
                  </span>
                )}
              </div>
              <Link href="/urgent" className="text-xs text-green-700 font-bold flex items-center gap-0.5">
                전체 보기 <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </Link>
            </div>

            {urgentDisplayItems.length === 0 ? (
              <div className="bg-white rounded-2xl py-8 flex flex-col items-center gap-2 shadow-sm">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-500" strokeWidth={1.8} />
                </div>
                <p className="text-sm font-bold text-gray-700">유통기한 임박 재료가 없어요!</p>
                <p className="text-xs text-gray-400">냉장고를 잘 관리하고 있어요 🎉</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {urgentDisplayItems.map((item) => {
                  const isExpired    = item.daysUntilExpiry <= 0;
                  const isVeryUrgent = item.daysUntilExpiry === 1;
                  const { Icon, color, bg } = INGREDIENT_ICON[item.ingredientName] ?? DEFAULT_INGREDIENT;
                  return (
                    <div key={item.notificationId} className="bg-white rounded-2xl p-3 shadow-sm flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 ${isExpired ? "bg-red-100" : bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${isExpired ? "text-red-400" : color}`} strokeWidth={1.6} />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-1 w-full">
                        {item.ingredientName}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isExpired    ? "bg-red-500 text-white" :
                        isVeryUrgent ? "bg-orange-400 text-white" :
                                       "bg-orange-50 text-orange-500"
                      }`}>
                        {getDdayLabel(item.daysUntilExpiry)}
                      </span>
                    </div>
                  );
                })}

                <Link
                  href="/fridge"
                  className="rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-sm active:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #1a4731 0%, #2d7a4f 100%)" }}
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] text-white/80 font-medium">재료 추가</span>
                </Link>
              </div>
            )}
          </div>

          {/* 레시피 추천 배너 */}
          <Link href="/recipe" className="block">
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between active:scale-[0.98] transition-transform overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)", boxShadow: "0 8px 24px rgba(22,101,52,0.32)" }}
            >
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/5" />
              <div className="absolute right-10 -top-4 w-16 h-16 rounded-full bg-white/[0.04]" />
              <div className="relative z-10">
                <p className="text-white font-bold text-sm mb-0.5 leading-snug">
                  임박 재료로 만들 수 있는 레시피
                </p>
                <p className="text-green-300 text-xs">버리기 전에 요리해보세요</p>
              </div>
              <div className="relative z-10 w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                <ChefHat className="w-6 h-6 text-white" strokeWidth={1.6} />
              </div>
            </div>
          </Link>

        </div>

        <BottomNav />
      </div>
    </div>
  );
}
