"use client";

import { SortOption, SORT_LABELS } from "@/types/recipe";

const SORT_OPTIONS: SortOption[] = [
  "MATCH_RATE",
  "COOK_TIME",
  "EXPIRING_COUNT",
  "MISSING_COUNT",
];

const SORT_DESCRIPTIONS: Record<SortOption, string> = {
  MATCH_RATE: "냉장고 재료로 만들 수 있는 비율",
  COOK_TIME: "빠르게 만들 수 있는 순서",
  EXPIRING_COUNT: "임박 재료를 많이 쓰는 순서",
  MISSING_COUNT: "재료를 조금만 더 사면 되는 순서",
};

type SortBottomSheetProps = {
  isOpen: boolean;
  currentSort: SortOption;
  onSelect: (sort: SortOption) => void;
  onClose: () => void;
};

export default function SortBottomSheet({
  isOpen,
  currentSort,
  onSelect,
  onClose,
}: SortBottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-t-3xl px-6 pt-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">정렬 기준</h2>
          <button onClick={onClose} className="text-gray-400" aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {SORT_OPTIONS.map((option) => {
            const isSelected = option === currentSort;
            return (
              <button
                key={option}
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                className={`flex items-center justify-between w-full py-3.5 px-4 rounded-xl border transition-colors
                  ${isSelected ? "border-green-600 bg-green-50" : "border-gray-200 bg-white"}`}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className={`text-sm font-semibold ${isSelected ? "text-green-700" : "text-gray-800"}`}>
                    {SORT_LABELS[option]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {SORT_DESCRIPTIONS[option]}
                  </span>
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3
                    ${isSelected ? "border-green-600 bg-green-600" : "border-gray-300"}`}
                >
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
