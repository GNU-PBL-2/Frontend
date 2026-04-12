"use client";

import { useState, useRef } from "react";
import { Ingredient } from "@/types/ingredient";
import { getDaysLeft } from "@/utils/expiryHelpers";

// ── 헬퍼 함수들 ─────────────────────────────────────────

function formatDateKorean(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDdayText(daysLeft: number) {
  if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
  if (daysLeft === 0) return "D-day";
  return `D-${daysLeft}`;
}

function getDdayPillClass(daysLeft: number) {
  if (daysLeft <= 3) return "bg-red-500 text-white";
  if (daysLeft <= 7) return "bg-orange-400 text-white";
  return "bg-green-600 text-white";
}

function getQuantityLevel(status: Ingredient["quantityStatus"]) {
  switch (status) {
    case "적음": return 1;
    case "보통": return 2;
    case "많음": return 3;
    default: return 1;
  }
}

function getQuantityBarColor(status: Ingredient["quantityStatus"]) {
  switch (status) {
    case "적음": return "bg-red-400";
    case "보통": return "bg-green-400";
    case "많음": return "bg-green-700";
    default: return "bg-gray-300";
  }
}

function getQuantityTextColor(status: Ingredient["quantityStatus"]) {
  switch (status) {
    case "적음": return "text-red-400";
    case "보통": return "text-green-400";
    case "많음": return "text-green-700";
    default: return "text-gray-400";
  }
}

// ── Props ───────────────────────────────────────────────

type FridgeItemCardProps = {
  item: Ingredient;
  isSelectMode: boolean;   // 꾹 누르기로 진입한 선택 모드
  isSelected: boolean;     // 현재 카드가 선택됐는지
  onLongPress: (id: number) => void;   // 꾹 누르기 → 선택 모드 진입
  onSelect: (id: number) => void;      // 선택 모드에서 탭 → 선택/해제
  onEditPress: (item: Ingredient) => void;  // 수정 버튼 → FridgePage에서 모달 열기
  onDelete: (id: number) => void;      // 삭제 confirm 후 실행
};

// ── 컴포넌트 ────────────────────────────────────────────

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
  const touchStartX = useRef<number>(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const daysLeft = getDaysLeft(item.expiryDate);
  const quantityLevel =
    item.quantityType === "number" && item.quantityValue !== undefined
      ? Math.min(item.quantityValue, 3)
      : getQuantityLevel(item.quantityStatus);
  const quantityLabel =
    item.quantityType === "number" && item.quantityValue !== undefined
      ? `${item.quantityValue}개`
      : item.quantityStatus;

  // ── 스와이프 핸들러 ──
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;

    // 꾹 누르기 타이머 시작 (500ms)
    longPressTimer.current = setTimeout(() => {
      if (!isSelectMode) onLongPress(item.id);
    }, 500);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    // 꾹 누르기 타이머 취소
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) setIsSwiped(true);    // 왼쪽으로 → 삭제 버튼 노출
    if (diff < -30) setIsSwiped(false);  // 오른쪽으로 → 닫기
  }

  function handleTouchMove() {
    // 움직이면 꾹 누르기 취소
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  // ── 카드 탭 핸들러 ──
  function handleCardTap() {
    if (isSwiped) {
      setIsSwiped(false); // 스와이프 열린 상태면 탭 시 닫기
      return;
    }
    if (isSelectMode) {
      onSelect(item.id);
    }
  }

  // ── 삭제 confirm ──
  function handleDeleteRequest() {
    const confirmed = window.confirm(`"${item.name}"을(를) 삭제할까요?`);
    if (confirmed) onDelete(item.id);
    setIsSwiped(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">

      {/* 삭제 버튼 (스와이프 시 노출) */}
      <div className="absolute right-0 top-0 h-full w-16 bg-red-500 flex items-center justify-center rounded-r-2xl">
        <button
          onClick={handleDeleteRequest}
          aria-label="재료 삭제"
          className="text-white text-sm font-bold"
        >
          삭제
        </button>
      </div>

      {/* 카드 본체 */}
      <div
        className={`relative bg-white border-2 rounded-2xl shadow-sm px-4 py-4 transition-transform duration-200
          ${isSelected ? "border-green-600" : "border-gray-200"}
          ${isSwiped ? "-translate-x-16" : "translate-x-0"}
        `}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onClick={handleCardTap}
      >
        <div className="flex  justify-between gap-4">

          {/* 왼쪽: 재료명 + 수량 바 + 구매일 */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">{item.name}</p>

            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`h-1.5 w-7 rounded-full ${
                      bar <= quantityLevel
                        ? getQuantityBarColor(item.quantityStatus)
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-semibold ${getQuantityTextColor(item.quantityStatus)}`}>
                {quantityLabel}
              </span>
            </div>

            {/* 구매일 + 수정 버튼 행 */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-300">
                최근 구매&nbsp;&nbsp;{formatDateKorean(item.purchaseDate)}
              </p>

              
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between shrink-0 py-0.5">

            {/* 오른쪽: D-day 배지 */}
            <div
            className={`min-w-[58px] h-8 px-3 rounded-xl text-base font-bold flex items-center justify-center shrink-0 ${getDdayPillClass(daysLeft)}`}
            >
              {getDdayText(daysLeft)}
            </div>

            {/* 수정 버튼 — 선택 모드에선 숨김 */}
              {!isSelectMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 탭 이벤트 차단
                    onEditPress(item);
                  }}
                  aria-label="재료 수정"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {/* 시안의 외부 링크 아이콘 모양 */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>
              )}
          </div>
          

        </div>
      </div>
    </div>
  );
}