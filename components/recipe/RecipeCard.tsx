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
        <div className="relative w-full h-40">
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
          {/* 1. 제목 영역: 길어지면 ... 처리 */}
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-900 truncate" title={recipe.title}>
              {recipe.title}
            </h3>
          </div>

          {/* 2. 정보 영역: 모든 요소를 한 줄로 배치 */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 whitespace-nowrap overflow-hidden">
            {/* 조리가능 칩 */}
            {isCookable && (
              <span className="shrink-0 bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded border border-green-100">
                조리가능
              </span>
            )}

            {/* 분류 */}
            <span className="shrink-0">{recipe.categoryName}</span>

            {/* 구분선 */}
            <span className="shrink-0 w-px h-2.5 bg-gray-200" />

            {/* 소요시간 */}
            <span className="flex items-center gap-0.5 shrink-0">
              <span className="text-sm">🕐</span>
              {recipe.cookTimeMin}분
            </span>
          </div>
        </div>

          {/* 요리 시작 버튼 */}
          <button
            onClick={onStart}
            className="w-full py-3 rounded-b-xl bg-green-700 text-white text-sm font-bold"
          >
            요리 시작 →
          </button>
        </div>
            

      {/* 토스트 메시지 */}
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}