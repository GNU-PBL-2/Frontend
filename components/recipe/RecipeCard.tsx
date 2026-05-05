"use client";

import Image from "next/image";
import { useState } from "react";
import { RecipeListItem } from "@/types/recipe";

type RecipeCardProps = {
  recipe: RecipeListItem;
  isFavorite: boolean;
  onToggleFavorite?: (id: number) => void;
  onStart: () => void;
  index?: number;
  showToast?: (message: string) => void;
};

export default function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onStart,
  index = 0,
  showToast,
}: RecipeCardProps) {
  const [imgError, setImgError] = useState(false);

  function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !isFavorite;
    onToggleFavorite?.(recipe.id);
    showToast?.(
      next
        ? `${recipe.title}이/가 즐겨찾기에 추가되었습니다`
        : `${recipe.title}이/가 즐겨찾기에서 제거되었습니다`
    );
  }

  return (
    <div
      className="animate-fadeInUp rounded-2xl overflow-hidden shadow-md active:scale-[0.97] transition-transform duration-150 cursor-pointer"
        style={{ animationDelay: `${index * 60}ms` }}
        onClick={onStart}
      >
        {/* 히어로 이미지 */}
        <div className="relative w-full h-52">
          {imgError || !recipe.thumbnailUrl ? (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-6xl">🍽️</span>
            </div>
          ) : (
            <Image
              src={recipe.thumbnailUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
          )}

          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* 상단: 임박재료 배지 + 즐겨찾기 */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {recipe.expiringIngredientCount > 0 ? (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                🔥 임박재료 {recipe.expiringIngredientCount}개
              </span>
            ) : (
              <div />
            )}
            <button
              onClick={handleToggleFavorite}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
              aria-label="즐겨찾기"
            >
              <span className={`text-xl transition-colors duration-200 ${isFavorite ? "text-red-400" : "text-white/60"}`}>
                ♥
              </span>
            </button>
          </div>

          {/* 하단: 제목 + 메타 */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-[17px] leading-snug mb-2 drop-shadow">
              {recipe.title}
            </h3>
            <div className="flex items-center gap-2">
              {recipe.cookable && (
                <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
                  조리가능
                </span>
              )}
              <span className="text-white/80 text-xs font-medium">⏰ {recipe.cookTimeMin}분</span>
            </div>
          </div>
        </div>

        {/* 요리 시작 버튼 */}
        <button
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          className="w-full py-3.5 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-sm font-bold transition-colors"
        >
          요리 시작 →
        </button>
    </div>
  );
}
