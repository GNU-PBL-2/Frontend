"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategorySelector from "@/components/preference/CategorySelector";
import TasteSelector from "@/components/preference/TasteSelector";
import { FoodCategory, TastePreference } from "@/types/preference";

export default function TasteEditPage() {
  const router = useRouter();

  const [step, setStep] = useState<"category" | "taste">("category");

  // TODO: 백엔드 연동 시 실제 유저 데이터로 교체
  const [categories, setCategories] = useState<FoodCategory[]>(["중식"]);
  const [tastes, setTastes] = useState<TastePreference[]>(["단맛"]);

  function handleSave() {
    // TODO: 백엔드 연동 시 API 호출
    router.back();
  }

  return (
    <div className="bg-white min-h-screen flex justify-center">
      <div className="w-full max-w-sm flex flex-col min-h-screen px-4 pt-6 pb-10">

        {/* 닫기 버튼 */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 text-lg"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 단계별 컴포넌트 */}
        <div className="flex-1">
          {step === "category" ? (
            <CategorySelector
              selected={categories}
              onChange={setCategories}
            />
          ) : (
            <TasteSelector
              selected={tastes}
              onChange={setTastes}
            />
          )}
        </div>

        {/* 하단 버튼 */}
        {step === "category" ? (
          <button
            onClick={() => setStep("taste")}
            className="w-full py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold mt-8"
          >
            다음
          </button>
        ) : (
          <div className="flex gap-3 mt-8">
            {/* 뒤로가기 */}
            <button
              onClick={() => setStep("category")}
              className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium"
            >
              이전
            </button>
            {/* 저장 */}
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold"
            >
              저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}