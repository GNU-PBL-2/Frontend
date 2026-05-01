"use client";

import { Allergy } from "@/types/preference";

const ALLERGY_OPTIONS: Allergy[] = [
  "난류(달걀)", "우유", "메밀", "땅콩", "대두(콩)",
  "밀", "고등어", "게", "새우", "돼지고기",
  "복숭아", "토마토", "아황산류", "호두", "닭고기",
  "쇠고기", "오징어", "조개류", "잣", "아몬드",
  "카사바", "참깨",
];

type AllergySelectorProps = {
  selected: Allergy[];
  onChange: (next: Allergy[]) => void;
};

export default function AllergySelector({
  selected,
  onChange,
}: AllergySelectorProps) {
  function handleToggle(item: Allergy) {
    onChange(
      selected.includes(item)
        ? selected.filter((a) => a !== item)
        : [...selected, item]
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* 아이콘 + 제목 */}
      <div className="text-4xl mb-2">⚠️</div>
      <p className="text-base font-semibold text-gray-800 mb-6">
        조심해야 할 재료가 있나요?
      </p>

      {/* 칩 목록 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALLERGY_OPTIONS.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => handleToggle(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${isSelected
                  ? "bg-red-100 border-red-400 text-red-600"
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