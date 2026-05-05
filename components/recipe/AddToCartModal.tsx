"use client";

import { useEffect, useState } from "react";
import { RecipeIngredient } from "@/types/recipe";


type AddToCartModalProps = {
  isOpen: boolean;
  ingredients: RecipeIngredient[];
  onClose: () => void;
  onConfirm: (selectedIngredients: RecipeIngredient[]) => void; // 선택된 재료 전달 콜백
};

export default function AddToCartModal({
  isOpen,
  ingredients,
  onClose,
  onConfirm,
}: AddToCartModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen) setSelectedIds([]);
  }, [isOpen]);

  if (!isOpen) return null;

  function handleToggle(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleConfirm() {
    const selected = ingredients.filter((ing) =>
      selectedIds.includes(ing.ingredientId)
    );
    onConfirm(selected);
    setSelectedIds([]);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-t-3xl px-6 pt-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">장바구니 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-400"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 재료 목록 */}
        <div className="flex flex-col gap-2 mb-6">
          {ingredients.map((ing) => (
            <button
              key={ing.ingredientId}
              onClick={() => handleToggle(ing.ingredientId)}
              className={`flex items-center justify-between w-full py-3 px-4 rounded-xl border transition-colors
                ${selectedIds.includes(ing.ingredientId)
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedIds.includes(ing.ingredientId)
                    ? "border-green-600 bg-green-600"
                    : "border-gray-300"
                  }`}>
                  {selectedIds.includes(ing.ingredientId) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </span>
                <span className="text-sm text-gray-800">{ing.name}</span>
              </div>
              <span className="text-sm text-gray-400">{ing.amount}{ing.unit}</span>
            </button>
          ))}
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleConfirm}
          disabled={selectedIds.length === 0}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-colors
            ${selectedIds.length > 0
              ? "bg-green-700 text-white"
              : "bg-gray-100 text-gray-400"
            }`}
        >
          {selectedIds.length > 0
            ? `${selectedIds.length}개 장바구니에 추가`
            : "재료를 선택해주세요"
          }
        </button>
      </div>
    </div>
  );
}