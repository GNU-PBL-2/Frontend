"use client";

import { RecipeIngredient } from "@/types/recipe";

type RecipeIngredientListProps = {
  ingredients: RecipeIngredient[];
  onOpenCartModal: () => void;
};

// fridgeStatus → 보유 수량 텍스트
function getFridgeStatusLabel(status: RecipeIngredient["fridgeStatus"]): string {
  switch (status) {
    case "ENOUGH": return "여유";
    case "LOW": return "임박";
    case "EXPIRING": return "임박";
    case "EXPIRED": return "만료";
    case "NONE": return "없음";
    default: return "-";
  }
}

function getFridgeStatusColor(status: RecipeIngredient["fridgeStatus"]): string {
  switch (status) {
    case "ENOUGH": return "text-green-600 bg-green-50";
    case "LOW": return "text-orange-500 bg-orange-50";
    case "EXPIRING": return "text-red-500 bg-red-50";
    case "EXPIRED": return "text-gray-400 bg-gray-100";
    case "NONE": return "text-gray-400 bg-gray-100";
    default: return "text-gray-400 bg-gray-100";
  }
}

export default function RecipeIngredientList({
  ingredients,
  onOpenCartModal,
}: RecipeIngredientListProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">재료</h2>
        <button
          onClick={onOpenCartModal}
          className="text-xs text-green-700 font-semibold border border-green-700 px-3 py-1 rounded-full"
        >
          장바구니에 추가하기
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {ingredients.map((ing) => (
          <div
            key={ing.ingredientId}
            className="flex items-center justify-between py-2 border-b border-gray-100"
          >
            {/* 재료명 + 수량 */}
            <div className="flex items-center gap-2">
              {/* 보유 여부 아이콘 */}
              <span className={ing.fridgeStatus === "NONE" || ing.fridgeStatus === "EXPIRED"
                ? "text-gray-300" : "text-green-500"}>
                {ing.fridgeStatus === "NONE" || ing.fridgeStatus === "EXPIRED" ? "○" : "✓"}
              </span>
              <span className="text-sm text-gray-800">{ing.name}</span>
              <span className="text-sm text-gray-400">
                {ing.amount}{ing.unit}
              </span>
            </div>

            {/* 냉장고 보유 상태 */}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getFridgeStatusColor(ing.fridgeStatus)}`}>
              {getFridgeStatusLabel(ing.fridgeStatus)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}