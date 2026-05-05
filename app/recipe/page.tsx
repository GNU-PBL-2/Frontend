"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchRecipes } from "@/lib/recipeApi";
import { RecipeListItem, RecipeFilterType } from "@/types/recipe";
import RecipeCard from "@/components/recipe/RecipeCard";
import BottomNav from "@/components/BottomNav";

const FILTERS: RecipeFilterType[] = ["임박우선", "전체", "조리가능", "즐겨찾기"];
const PAGE_SIZE = 10;

function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full h-52 skeleton" />
      <div className="h-12 bg-gray-100" />
    </div>
  );
}

export default function RecipePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<RecipeFilterType>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes({
        tab: activeFilter,
        keyword: debouncedQuery,
        page: 0,
        size: PAGE_SIZE,
      });
      setRecipes(data.content);
      setPage(0);
      setIsLast(data.last);
      setFavoriteIds(
        new Set(data.content.filter((r) => r.isFavorite).map((r) => r.id))
      );
    } catch {
      setError("레시피를 불러오지 못했어요. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, debouncedQuery]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  async function handleLoadMore() {
    if (isLoadingMore || isLast) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchRecipes({
        tab: activeFilter,
        keyword: debouncedQuery,
        page: nextPage,
        size: PAGE_SIZE,
      });
      setRecipes((prev) => [...prev, ...data.content]);
      setPage(nextPage);
      setIsLast(data.last);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        data.content.forEach((r) => { if (r.isFavorite) next.add(r.id); });
        return next;
      });
    } catch {
      // 더보기 실패는 조용히 처리
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleToggleFavorite(id: number) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleRecipeClick(recipe: RecipeListItem) {
    const isFav = favoriteIds.has(recipe.id);
    router.push(`/recipe/${recipe.id}?favorite=${isFav}`);
  }

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">

        {/* 헤더 */}
        <div className="px-4 pt-6 pb-3">
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
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-600 bg-gray-50 transition-colors"
            />
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
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200
                  ${activeFilter === filter
                    ? "bg-green-700 text-white shadow-sm shadow-green-200 scale-105"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 레시피 목록 */}
        <div className="flex-1 px-4 py-2 space-y-4 pb-24">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-4xl mb-3">😢</span>
              <p className="text-base font-medium text-gray-500">{error}</p>
              <button
                onClick={loadInitial}
                className="mt-4 px-5 py-2 rounded-full bg-green-700 text-white text-sm font-semibold"
              >
                다시 시도
              </button>
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-5xl mb-3">🍽️</span>
              <p className="text-base font-medium text-gray-500">레시피가 없어요</p>
              <p className="text-sm mt-1 text-gray-400">
                {searchQuery ? "다른 검색어를 입력해보세요" : "재료를 냉장고에 추가해보세요"}
              </p>
            </div>
          ) : (
            <>
              {recipes.map((recipe, i) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={i}
                  isFavorite={favoriteIds.has(recipe.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onStart={() => handleRecipeClick(recipe)}
                />
              ))}

              {!isLast && (
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm text-gray-500 font-semibold disabled:opacity-50 transition-opacity"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                      불러오는 중
                    </span>
                  ) : "더보기"}
                </button>
              )}
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
