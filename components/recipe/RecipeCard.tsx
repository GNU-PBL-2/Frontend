"use client";

import Image from "next/image";
import { useState } from "react";
import { Recipe } from "@/types/recipe";
import Toast from "@/components/Toast";


type RecipeCardProps = {
  recipe: Recipe;
  expiringCount: number;
  isCookable: boolean;
  onStart: () => void;
  onToggleFavorite?: (id: number) => void; // 즐겨찾기 토글 핸들러
  isFavorite?: boolean; // 즐겨찾기 상태
};

export default function RecipeCard({
  recipe,
  expiringCount,
  isCookable,
  isFavorite,
  onToggleFavorite,
  onStart,
}: RecipeCardProps) {

  {/* 즐겨찾기 상태 관리 */}
  // const [isFavorite, setIsFavorite] = useState(recipe.favorite); //부모 컴포넌트에서 상태 관리로 변경
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function handleToggleFavorite() {
    const next = !isFavorite;
    // setIsFavorite(next);
    onToggleFavorite?.(recipe.id);

    setToastMessage(
      next 
        ? `${recipe.title}이/가 즐겨찾기에 추가되었습니다` 
        : `${recipe.title}이/가 즐겨찾기에서 제거되었습니다`
    );
    // 토스트 메시지 재노출을 위해 잠깐 숨겼다가 다시 보이게 함
    setToastVisible(false);
    setTimeout(() => setToastVisible(true), 10); 
  }

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

        {/* 요리 이미지 */}
        <div className="relative w-full h-44">
          <Image
            src={recipe.thumbnailUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
          {/* 즐겨찾기 하트 */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
            aria-label="즐겨찾기"
          >
            <span className={isFavorite ? "text-red-500" : "text-gray-300"}>
              ♥
            </span>
          </button>

          {/* 임박재료 칩 — 있을 때만 */}
          {expiringCount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              임박재료 {expiringCount}개
            </div>
          )}
        </div>

        {/* 카드 하단 정보 */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-gray-900">{recipe.title}</h3>
            {/* 조리가능 칩 — 가능할 때만 */}
            {isCookable && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                조리가능
              </span>
            )}
          </div>

          {/* 분류 + 소요시간 */}
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
            <span>{recipe.categoryName}</span>
            <span className="flex items-center gap-1">
              🕐 {recipe.cookTimeMin}분
            </span>
          </div>

          {/* 요리 시작 버튼 */}
          <button
            onClick={onStart}
            className="w-full py-3 rounded-xl bg-green-700 text-white text-sm font-bold"
          >
            요리 시작 →
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}