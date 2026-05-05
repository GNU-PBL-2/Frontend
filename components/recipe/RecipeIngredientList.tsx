"use client";

import { RecipeIngredient } from "@/types/recipe";

type RecipeIngredientListProps = {
  ingredients: RecipeIngredient[];
  onOpenCartModal: () => void;
};

const STATUS_CONFIG = {
  ENOUGH:   { label: "여유", dot: "bg-green-400",  text: "text-green-600",  bg: "bg-green-50",  icon: "✓" },
  EXPIRING: { label: "임박", dot: "bg-red-400",    text: "text-red-500",    bg: "bg-red-50",    icon: "⚡" },
  NONE:     { label: "없음", dot: "bg-gray-300",   text: "text-gray-400",   bg: "bg-gray-50",   icon: "✗" },
} as const;

export default function RecipeIngredientList({
  ingredients,
  onOpenCartModal,
}: RecipeIngredientListProps) {
  const missingCount = ingredients.filter((i) => i.fridgeStatus === "NONE").length;

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
        {ingredients.map((ing) => {
          const cfg = STATUS_CONFIG[ing.fridgeStatus] ?? STATUS_CONFIG.NONE;
          return (
            <div
              key={ing.ingredientId}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${cfg.bg} transition-colors`}
            >
              {/* 재료명 + 수량 */}
              <div className="flex items-center gap-2.5">
                <span className={`text-sm font-bold ${cfg.text}`}>{cfg.icon}</span>
                <span className={`text-sm font-medium ${ing.fridgeStatus === "NONE" ? "text-gray-400" : "text-gray-800"}`}>
                  {ing.name}
                </span>
                <span className="text-xs text-gray-400">
                  {ing.amount}{ing.unit}
                </span>
                {ing.isSubstitutable && (
                  <span className="text-xs text-gray-300 font-medium">대체가능</span>
                )}
              </div>

              {/* 상태 칩 */}
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
