"use client";

import { ExternalLink } from "lucide-react";
import { RecipeIngredient } from "@/types/recipe";
import { openShoppingSearch } from "@/utils/shopping";

type RecipeIngredientListProps = {
  ingredients: RecipeIngredient[];
  onOpenCartModal: () => void;
};

const STATUS_CONFIG = {
  ENOUGH:   { label: "여유", text: "text-green-600", bg: "bg-green-50", icon: "✓" },
  EXPIRING: { label: "임박", text: "text-red-500",   bg: "bg-red-50",   icon: "⚡" },
  NONE:     { label: "없음", text: "text-gray-400",  bg: "bg-gray-50",  icon: "✗" },
} as const;

export default function RecipeIngredientList({
  ingredients,
  onOpenCartModal,
}: RecipeIngredientListProps) {
  const safeIngredients = ingredients ?? [];
  const missingCount = safeIngredients.filter((i) => i.fridgeStatus === "NONE").length;

  return (
    <div className="mb-7">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">재료</h2>
          {missingCount > 0 && (
            <span className="text-xs text-gray-400 font-medium">없는 재료 {missingCount}개</span>
          )}
        </div>
        <button
          onClick={onOpenCartModal}
          className="flex items-center gap-1 text-xs text-green-700 font-semibold border border-green-200 bg-green-50 px-3 py-1.5 rounded-full"
        >
          🛒 장바구니 추가
        </button>
      </div>

      {/* 재료 리스트 */}
      <div className="flex flex-col gap-1.5">
        {safeIngredients.map((ing) => {
          const cfg = STATUS_CONFIG[ing.fridgeStatus] ?? STATUS_CONFIG.NONE;
          const isMissing = ing.fridgeStatus === "NONE";

          const content = (
            <>
              {/* 재료명 + 수량 */}
              <div className="flex items-center gap-2.5">
                <span className={`text-sm font-bold ${cfg.text}`}>{cfg.icon}</span>
                <span className={`text-sm font-medium ${isMissing ? "text-gray-400" : "text-gray-800"}`}>
                  {ing.name}
                </span>
                <span className="text-xs text-gray-400">
                  {ing.amount}{ing.unit}
                </span>
                {ing.isSubstitutable && (
                  <span className="text-xs text-gray-300 font-medium">대체가능</span>
                )}
              </div>

              {/* 상태 칩 — 없는 재료는 구매 링크로 표시 */}
              {isMissing ? (
                <span
                  className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#FBEDDB", color: "#B5631A" }}
                >
                  구매하기
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </span>
              ) : (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.text}`}>
                  {cfg.label}
                </span>
              )}
            </>
          );

          // 없는 재료: 클릭 시 온라인 쇼핑몰 검색으로 이동
          if (isMissing) {
            return (
              <button
                key={ing.ingredientId}
                onClick={() => openShoppingSearch(ing.name)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${cfg.bg} transition-colors active:bg-gray-100 text-left`}
                aria-label={`${ing.name} 온라인 쇼핑몰에서 구매하기`}
              >
                {content}
              </button>
            );
          }

          return (
            <div
              key={ing.ingredientId}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${cfg.bg} transition-colors`}
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
