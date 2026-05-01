"use client";

import { FoodCategory } from "@/types/preference";

const CATEGORY_OPTIONS: FoodCategory[] = [
  "한식", "중식", "일식", "양식",
  "동남아시아", "카레", "분식", "베이커리",
];

type CategorySelectorProps = {
  selected: FoodCategory[];
  onChange: (next: FoodCategory[]) => void;
};

export default function CategorySelector({
  selected,
  onChange,
}: CategorySelectorProps) {
  function handleToggle(item: FoodCategory) {
    onChange(
      selected.includes(item)
        ? selected.filter((c) => c !== item)
        : [...selected, item]
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl mb-2">🩷</div>
      <p className="text-base font-semibold text-gray-800 mb-6">
        어떤 요리를 좋아하시나요?
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORY_OPTIONS.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => handleToggle(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${isSelected
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-white border-gray-300 text-gray-500"
                }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}