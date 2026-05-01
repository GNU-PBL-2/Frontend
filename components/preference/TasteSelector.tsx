"use client";

import { TastePreference } from "@/types/preference";

const TASTE_OPTIONS: TastePreference[] = [
  "매운맛", "단맛", "짠맛", "신맛",
  "고소한맛", "담백한맛", "쓴맛",
];

type TasteSelectorProps = {
  selected: TastePreference[];
  onChange: (next: TastePreference[]) => void;
};

export default function TasteSelector({
  selected,
  onChange,
}: TasteSelectorProps) {
  function handleToggle(item: TastePreference) {
    onChange(
      selected.includes(item)
        ? selected.filter((t) => t !== item)
        : [...selected, item]
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl mb-2">🩷</div>
      <p className="text-base font-semibold text-gray-800 mb-6">
        놓칠 수 없는 나만의 입맛은?
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {TASTE_OPTIONS.map((item) => {
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