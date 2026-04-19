"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockRecipes, getExpiringCount, getIsCookable } from "@/data/recipeData";
import { Recipe, RecipeFilterType } from "@/types/recipe";
import RecipeCard from "@/components/recipe/RecipeCard";
import BottomNav from "@/components/BottomNav";

const FILTERS: RecipeFilterType[] = ["임박우선", "전체", "조리가능", "즐겨찾기"];

export default function RecipePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<RecipeFilterType>("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // 즐겨찾기 상태 관리 (초기값은 mockRecipes에서 favorite이 true인 것들의 id 배열)
  const [favoriteIds, setFavoriteIds] = useState<number[]>(
    mockRecipes.filter((r) => r.favorite).map((r) => r.id)
  );

  function handleToggleFavorite(id: number) {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }

  // 필터 + 검색 적용
  const filteredRecipes = useMemo(() => {
    let result = [...mockRecipes];

    // 검색어 필터
    if (searchQuery.trim()) {
      result = result.filter((recipe) =>
        recipe.title.includes(searchQuery.trim()) ||
        recipe.ingredients.some((ing) => ing.name.includes(searchQuery.trim()))
      );
    }

    // 탭 필터
    switch (activeFilter) {
      case "임박우선":
        // 임박 재료 많이 쓰는 순으로 정렬
        result = result
          .filter((r) => getExpiringCount(r) > 0)
          .sort((a, b) => getExpiringCount(b) - getExpiringCount(a));
        break;
      case "조리가능":
        result = result.filter((r) => getIsCookable(r));
        break;
      case "즐겨찾기":
        //result = result.filter((r) => r.favorite);
        result = result.filter((r) => favoriteIds.includes(r.id));
        break;
      case "전체":
      default:
        break;
    }

    return result;
  }, [activeFilter, searchQuery, favoriteIds]);

  function handleRecipeClick(recipe: Recipe) {
    const isFav = favoriteIds.includes(recipe.id);
    router.push(`/recipe/${recipe.id}?favorite=${isFav}`); // 레시피 상세 페이지로 이동 (favorite 상태 전달)
  }

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">

        {/* 헤더 */}
        <div className="px-4 pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">레시피 추천</h1>

          {/* 검색창 */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="요리, 식재료 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-600 bg-gray-50"
            />
            {/* 검색어 지우기 버튼 */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                ✕
              </button>
            )}
          </div>

          {/* 필터 탭 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                  ${activeFilter === filter
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 레시피 목록 */}
        <div className="flex-1 px-4 py-3 space-y-4 pb-24">
          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-base font-medium">레시피가 없어요</p>
              <p className="text-sm mt-1">
                {searchQuery ? "다른 검색어를 입력해보세요" : "재료를 냉장고에 추가해보세요"}
              </p>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                expiringCount={getExpiringCount(recipe)}
                isCookable={getIsCookable(recipe)}
                isFavorite={favoriteIds.includes(recipe.id)}
                onToggleFavorite={handleToggleFavorite}
                onStart={() => handleRecipeClick(recipe)}
              />
            ))
          )}
        </div>

        <BottomNav /> {/*하단 네비게이션바*/}
      </div>
    </div>
  );
}