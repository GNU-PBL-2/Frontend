"use client";

import { useRef } from "react";
import { FridgeItem } from "@/lib/fridgeApi";
import { getDaysLeft } from "@/utils/expiryHelpers";

type FridgeItemCardProps = {
  item: FridgeItem;
  isSelectMode: boolean;
  isSelected: boolean;
  onLongPress: (fridgeId: number) => void;
  onSelect: (fridgeId: number) => void;
  onEditPress: (item: FridgeItem) => void;
  onDelete: (fridgeId: number) => void;
};

function formatKoreanDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

function getDdayBadge(daysLeft: number) {
  if (daysLeft < 0)  return "bg-gray-400";
  if (daysLeft <= 2) return "bg-red-500";
  if (daysLeft <= 7) return "bg-orange-500";
  return "bg-green-500";
}

function getDdayLabel(daysLeft: number) {
  if (daysLeft < 0)   return `D+${Math.abs(daysLeft)}`;
  if (daysLeft === 0) return "D-day";
  return `D-${daysLeft}`;
}

function getQuantityLevel(quantity: number, unit: string): 1 | 2 | 3 {
  if (unit === "적음") return 1;
  if (unit === "보통") return 2;
  if (unit === "많음") return 3;
  if (quantity <= 1) return 1;
  if (quantity <= 5) return 2;
  return 3;
}

const QUANTITY_COLOR: Record<1 | 2 | 3, { fill: string; text: string }> = {
  1: { fill: "bg-red-400",    text: "text-red-400"    },
  2: { fill: "bg-orange-400", text: "text-orange-400" },
  3: { fill: "bg-green-500",  text: "text-green-500"  },
};

export default function FridgeItemCard({
  item,
  isSelectMode,
  isSelected,
  onLongPress,
  onSelect,
  onEditPress,
  onDelete,
}: FridgeItemCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const daysLeft = getDaysLeft(item.expiryDate);
  const badgeBg  = getDdayBadge(daysLeft);
  const qLevel   = getQuantityLevel(item.quantity, item.unit);
  const qColor   = QUANTITY_COLOR[qLevel];

  function handleTouchStart() {
    longPressTimer.current = setTimeout(() => {
      if (!isSelectMode) onLongPress(item.fridgeId);
    }, 500);
  }

  function handleTouchEnd() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }

  function handleTouchMove() {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }

  function handleCardTap() {
    if (isSelectMode) onSelect(item.fridgeId);
    else onEditPress(item);
  }

  return (
    <div className="relative rounded-2xl">

      {/* 카드 본체 */}
      <div
        className={`relative bg-white rounded-2xl transition-all duration-200 cursor-pointer
          ${isSelected
            ? "border-2 border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.12)]"
            : "border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          }
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onClick={handleCardTap}
      >
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">

            {/* 선택 모드 체크박스 */}
            {isSelectMode && (
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                ${isSelected ? "bg-green-500" : "border-2 border-gray-300"}`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            )}

            {/* 메인 콘텐츠 */}
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-gray-900">{item.ingredientName}</p>

              {/* 세그먼트 바 + 수량 */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {([1, 2, 3] as const).map((seg) => (
                    <div key={seg} className={`w-7 h-1.5 rounded-full ${seg <= qLevel ? qColor.fill : "bg-gray-100"}`} />
                  ))}
                </div>
                <span className={`text-xs font-semibold shrink-0 ${qColor.text}`}>
                  {["적음", "보통", "많음"].includes(item.unit) ? item.unit : `${item.quantity} ${item.unit}`}
                </span>
              </div>

              {/* 유통기한 */}
              <p className="text-[11px] text-gray-400 mt-1.5">
                유통기한 {formatKoreanDate(item.expiryDate)}
              </p>
            </div>

            {/* D-day 배지 */}
            <div className={`ml-2 px-3 py-1.5 rounded-full ${badgeBg} shrink-0`}>
              <span className="text-xs font-bold text-white">{getDdayLabel(daysLeft)}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
