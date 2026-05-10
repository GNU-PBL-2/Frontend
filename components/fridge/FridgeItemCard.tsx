"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FridgeItem } from "@/lib/fridgeApi";
import { getDaysLeft } from "@/utils/expiryHelpers";
import { Carrot, Flame, Milk, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getIngredientImageUrl } from "@/data/ingredientImages";

// ── 카테고리 폴백 아이콘 테마 ─────────────────────────────────────

type CategoryKey = "채소" | "육류" | "유제품" | "기타";

const CATEGORY_CONFIG: Record<CategoryKey, {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  tagBg: string;
  tagText: string;
  tagBorder: string;
}> = {
  채소:  { icon: Carrot,  iconBg: "bg-emerald-100", iconColor: "text-emerald-600", tagBg: "bg-emerald-50",  tagText: "text-emerald-700", tagBorder: "border-emerald-200" },
  육류:  { icon: Flame,   iconBg: "bg-rose-100",    iconColor: "text-rose-600",    tagBg: "bg-rose-50",    tagText: "text-rose-700",    tagBorder: "border-rose-200"    },
  유제품: { icon: Milk,   iconBg: "bg-sky-100",     iconColor: "text-sky-600",     tagBg: "bg-sky-50",     tagText: "text-sky-700",     tagBorder: "border-sky-200"     },
  기타:  { icon: Package, iconBg: "bg-violet-100",  iconColor: "text-violet-600",  tagBg: "bg-violet-50",  tagText: "text-violet-700",  tagBorder: "border-violet-200"  },
};

const DEFAULT_CATEGORY = {
  icon: Package,
  iconBg: "bg-gray-100", iconColor: "text-gray-500",
  tagBg: "bg-gray-50",   tagText: "text-gray-600", tagBorder: "border-gray-200",
};

// ── D-day 헬퍼 ───────────────────────────────────────────────────

function getDdayLabel(daysLeft: number) {
  if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
  if (daysLeft === 0) return "D-day";
  return `D-${daysLeft}`;
}

function getDdayGradient(daysLeft: number) {
  if (daysLeft < 0)  return "from-gray-400 to-gray-500";
  if (daysLeft <= 2) return "from-red-500 to-rose-600";
  if (daysLeft <= 7) return "from-amber-400 to-orange-500";
  return "from-emerald-400 to-green-600";
}

function getDdaySubLabel(daysLeft: number) {
  if (daysLeft < 0) return "경과";
  if (daysLeft <= 2) return "위험";
  if (daysLeft <= 7) return "주의";
  return "안전";
}

// ── Props ────────────────────────────────────────────────────────

type FridgeItemCardProps = {
  item: FridgeItem;
  isSelectMode: boolean;
  isSelected: boolean;
  onLongPress: (fridgeId: number) => void;
  onSelect: (fridgeId: number) => void;
  onEditPress: (item: FridgeItem) => void;
  onDelete: (fridgeId: number) => void;
};

// ── 컴포넌트 ─────────────────────────────────────────────────────

export default function FridgeItemCard({
  item,
  isSelectMode,
  isSelected,
  onLongPress,
  onSelect,
  onEditPress,
  onDelete,
}: FridgeItemCardProps) {
  const [isSwiped, setIsSwiped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const touchStartX = useRef<number>(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const daysLeft = getDaysLeft(item.expiryDate);
  const cat = CATEGORY_CONFIG[item.categoryName as CategoryKey] ?? DEFAULT_CATEGORY;
  const CatIcon = cat.icon;
  const imgUrl = getIngredientImageUrl(item.ingredientName, item.categoryName);
  const formattedExpiry = item.expiryDate.replace(/-/g, ".");

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    longPressTimer.current = setTimeout(() => {
      if (!isSelectMode) onLongPress(item.fridgeId);
    }, 500);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 60) setIsSwiped(true);
    if (diff < -30) setIsSwiped(false);
  }

  function handleTouchMove() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleCardTap() {
    if (isSwiped) { setIsSwiped(false); return; }
    if (isSelectMode) onSelect(item.fridgeId);
  }

  function handleDeleteRequest() {
    const confirmed = window.confirm(`"${item.ingredientName}"을(를) 삭제할까요?`);
    if (confirmed) onDelete(item.fridgeId);
    setIsSwiped(false);
  }

  // ── 좌측 썸네일 렌더링 ──────────────────────────────────────────

  function renderThumbnail() {
    // 선택 모드: 체크박스
    if (isSelectMode) {
      return (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors
          ${isSelected ? "bg-green-500" : "bg-gray-100 border-2 border-dashed border-gray-300"}`}
        >
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      );
    }

    // 이미지 로드 실패 시: 카테고리 아이콘 폴백
    if (imgError) {
      return (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg}`}>
          <CatIcon className={`w-[22px] h-[22px] ${cat.iconColor}`} strokeWidth={1.8} />
        </div>
      );
    }

    // 정상: 재료 사진
    return (
      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-gray-100">
        <Image
          src={imgUrl}
          alt={item.ingredientName}
          width={44}
          height={44}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">

      {/* 스와이프 삭제 버튼 */}
      <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-red-500 to-rose-400 rounded-r-2xl flex flex-col items-center justify-center gap-1">
        <button
          onClick={handleDeleteRequest}
          aria-label="재료 삭제"
          className="flex flex-col items-center gap-1 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="text-[10px] font-bold">삭제</span>
        </button>
      </div>

      {/* 카드 본체 */}
      <div
        className={`relative bg-white rounded-2xl transition-all duration-200 cursor-pointer
          ${isSelected
            ? "border-2 border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.12)]"
            : "border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          }
          ${isSwiped ? "-translate-x-20" : "translate-x-0"}
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onClick={handleCardTap}
      >
        <div className="px-4 pt-4 pb-3">

          {/* 상단: 썸네일 · 이름 · D-day */}
          <div className="flex items-center gap-3">

            {renderThumbnail()}

            {/* 이름 + 태그 */}
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-gray-900 truncate leading-snug">
                {item.ingredientName}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {item.categoryName ? (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border
                    ${cat.tagBg} ${cat.tagText} ${cat.tagBorder}`}>
                    {item.categoryName}
                  </span>
                ) : null}
                <span className="text-[11px] text-gray-400 font-medium">
                  {item.quantity} {item.unit}
                </span>
              </div>
            </div>

            {/* D-day 배지 */}
            <div className={`flex flex-col items-center justify-center
              bg-gradient-to-br ${getDdayGradient(daysLeft)}
              text-white rounded-xl px-3 py-2 min-w-[56px] shrink-0 shadow-sm`}>
              <span className="text-[9px] font-bold tracking-wide opacity-85 uppercase">
                {getDdaySubLabel(daysLeft)}
              </span>
              <span className="text-[13px] font-extrabold leading-tight mt-0.5">
                {getDdayLabel(daysLeft)}
              </span>
            </div>
          </div>

          {/* 하단: 유통기한 · 수정 버튼 */}
          <div className="flex items-center justify-between mt-3 pl-[56px]">
            <span className="text-[11px] text-gray-400">
              유통기한 <span className="font-medium text-gray-500">{formattedExpiry}</span>
            </span>

            {!isSelectMode && (
              <button
                onClick={(e) => { e.stopPropagation(); onEditPress(item); }}
                aria-label="재료 수정"
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                수정
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
