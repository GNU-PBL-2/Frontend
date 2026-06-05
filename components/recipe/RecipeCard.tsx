"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Plus, Flame } from "lucide-react";
import { RecipeListItem, IngredientSummary } from "@/types/recipe";
import MatchingRing from "@/components/recipe/MatchingRing";
import RecipePlaceholder from "@/components/recipe/RecipePlaceholder";
import {
  calcMatchRate,
  getShortageIngredients,
  getOwnedIngredients,
  hasExpiringIngredient,
} from "@/utils/recipeHelpers";

type Props = {
  recipe: RecipeListItem;
  isFavorite: boolean;
  onToggleFavorite?: (id: number) => void;
  onStart: () => void;
  index?: number;
  onAddToCart?: (ingredient: IngredientSummary) => void;
};

export default function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
  onStart,
  index = 0,
  onAddToCart,
}: Props) {
  const [imgError, setImgError] = useState(false);

  const { rate, total } = calcMatchRate(recipe.ingredients);
  const hasIngredientData = total > 0;
  const shortage = getShortageIngredients(recipe.ingredients);
  const owned = getOwnedIngredients(recipe.ingredients);
  const isExpiring = hasExpiringIngredient(recipe.ingredients);
  const firstExpiring = recipe.ingredients.find((i) => i.fridgeStatus === "EXPIRING");

  // 부족 먼저, 보유 뒤, 최대 3개 노출
  const allChips = [...shortage, ...owned];
  const visibleChips = allChips.slice(0, 3);
  const extraCount = allChips.length - visibleChips.length;

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    onToggleFavorite?.(recipe.id);
  }

  function handleChipClick(e: React.MouseEvent, ingredient: IngredientSummary) {
    e.stopPropagation();
    onAddToCart?.(ingredient);
  }

  return (
    <div
      className="animate-fadeInUp bg-white rounded-2xl p-3 shadow-md flex flex-row gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-150"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={onStart}
    >
      {/* [A] 썸네일 86×86 */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: 86, height: 86, borderRadius: 13 }}
      >
        {imgError || !recipe.thumbnailUrl ? (
          <RecipePlaceholder title={recipe.title} />
        ) : (
          <Image
            src={recipe.thumbnailUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        )}

        {/* 임박 재료 배지 */}
        {isExpiring && firstExpiring && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-400 shrink-0" />
              <span className="text-white text-[9px] font-bold leading-tight truncate">
                {firstExpiring.name} 임박
              </span>
            </div>
          </>
        )}

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={handleFavorite}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          aria-label="즐겨찾기"
        >
          <span
            className={`text-xs transition-colors duration-200 ${
              isFavorite ? "text-red-400" : "text-white/60"
            }`}
          >
            ♥
          </span>
        </button>
      </div>

      {/* [B] 우측 정보 열 */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        {/* 1줄: (제목 + 조리시간·상태) + 매칭률 링 */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-extrabold leading-snug line-clamp-2"
              style={{ fontSize: 16, color: "#16201A" }}
            >
              {recipe.title}
            </h3>
            <p className="text-xs mt-0.5 whitespace-nowrap" style={{ color: "#5B6B60" }}>
              🕒 {recipe.cookTimeMin}분
              {hasIngredientData && (
                <>
                  {" · "}
                  {shortage.length > 0 ? (
                    <span className="font-bold" style={{ color: "#B5631A" }}>
                      {shortage.length}개 부족
                    </span>
                  ) : (
                    <span className="font-bold" style={{ color: "#0D7A37" }}>
                      바로 가능
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          {hasIngredientData && (
            <div className="shrink-0">
              <MatchingRing pct={rate} />
            </div>
          )}
        </div>

        {/* 2줄: 재료 칩 */}
        <div className="flex flex-wrap gap-1">
          {visibleChips.map((chip) => {
            const isShortage = chip.fridgeStatus === "NONE";
            return (
              <button
                key={chip.ingredientId}
                onClick={isShortage ? (e) => handleChipClick(e, chip) : undefined}
                disabled={!isShortage}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                style={
                  isShortage
                    ? { background: "#FBEDDB", color: "#B5631A", border: "1px dashed #E1832A" }
                    : { background: "#E7F4EA", color: "#0D7A37" }
                }
              >
                {isShortage ? (
                  <Plus className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <Check className="w-2.5 h-2.5 shrink-0" />
                )}
                {chip.name}
              </button>
            );
          })}
          {extraCount > 0 && (
            <span
              className="flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: "#F4F7EF", color: "#909C92" }}
            >
              +{extraCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
