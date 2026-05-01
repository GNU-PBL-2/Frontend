"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AllergySelector from "@/components/preference/AllergySelector";
import { Allergy } from "@/types/preference";

export default function AllergyEditPage() {
  const router = useRouter();

  // TODO: 백엔드 연동 시 실제 유저 데이터로 교체
  const [selected, setSelected] = useState<Allergy[]>(["우유"]);

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

        {/* 알레르기 선택 컴포넌트 */}
        <div className="flex-1">
          <AllergySelector
            selected={selected}
            onChange={setSelected}
          />
        </div>

        {/* 저장하기 버튼 */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold mt-8"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}