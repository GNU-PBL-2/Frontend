"use client";

import Image from "next/image";
import { Recipe } from "@/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
  expiringCount: number;
  isCookable: boolean;
  onStart: () => void;
};

export default function RecipeCard({
  recipe,
  expiringCount,
  isCookable,
  onStart,
}: RecipeCardProps) {
  return (
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
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
          aria-label="즐겨찾기"
        >
          <span className={recipe.favorite ? "text-red-500" : "text-gray-300"}>
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
  );
}