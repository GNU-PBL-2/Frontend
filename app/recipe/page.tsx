"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles, Flame, ChevronRight, SlidersHorizontal } from "lucide-react";
import { fetchRecipes, addFavorite, removeFavorite } from "@/lib/recipeApi";
import { fetchUserProfile } from "@/lib/dashboardApi";
import { fetchFridgeList, FridgeItem } from "@/lib/fridgeApi";
import { getToken } from "@/utils/auth";
import { getUserIdFromToken } from "@/utils/auth";
import { getDaysLeft } from "@/utils/expiryHelpers";
import { sortRecipes } from "@/utils/recipeHelpers";
import { RecipeListItem, RecipeFilterType, IngredientSummary, SortOption, SORT_LABELS, SORT_CYCLE } from "@/types/recipe";
import RecipeCard from "@/components/recipe/RecipeCard";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

const FILTERS: RecipeFilterType[] = ["임박우선", "전체", "조리가능", "즐겨찾기"];
const PAGE_SIZE = 10;
const EXPIRING_BANNER_DAYS = 7;

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-md flex flex-row gap-3">
      <div className="shrink-0 rounded-2xl skeleton" style={{ width: 86, height: 86 }} />
      <div className="flex-1 flex flex-col justify-between py-0.5 gap-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 h-5 rounded-lg skeleton" />
          <div className="shrink-0 w-11 h-11 rounded-full skeleton" />
        </div>
        <div className="h-3 w-28 rounded skeleton" />
        <div className="flex gap-1">
          <div className="h-5 w-14 rounded-full skeleton" />
          <div className="h-5 w-12 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

export default function RecipePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<RecipeFilterType>("전체");
  const [activeSort, setActiveSort] = useState<SortOption>("MATCH_RATE");
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userPrefs, setUserPrefs] = useState<{
    categories: string[]; tastes: string[]; allergies: string[];
  } | null>(null);
  const [prefEnabled, setPrefEnabled] = useState(true);

  const [expiringItems, setExpiringItems] = useState<FridgeItem[]>([]);

  const { toastMessage, toastVisible, showToast } = useToast();

  // 검색어 디바운스
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 취향 + 냉장고 임박 재료 로드
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetchUserProfile()
      .then((p) => setUserPrefs({
        categories: p.categories ?? [],
        tastes: p.tastes ?? [],
        allergies: p.allergies ?? [],
      }))
      .catch(() => {});

    const memberId = getUserIdFromToken();
    if (memberId) {
      fetchFridgeList(memberId)
        .then((items) => {
          const expiring = items.filter(
            (item) => item.expiryDate && getDaysLeft(item.expiryDate) <= EXPIRING_BANNER_DAYS
          );
          setExpiringItems(expiring);
        })
        .catch(() => {});
    }
  }, []);

  const hasPrefs = userPrefs !== null && (
    userPrefs.categories.length > 0 ||
    userPrefs.tastes.length > 0 ||
    userPrefs.allergies.length > 0
  );

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes({
        tab: activeFilter, keyword: debouncedQuery, page: 0, size: PAGE_SIZE,
        usePreference: hasPrefs && prefEnabled,
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
  }, [activeFilter, debouncedQuery, prefEnabled, hasPrefs]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  async function handleLoadMore() {
    if (isLoadingMore || isLast) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchRecipes({
        tab: activeFilter, keyword: debouncedQuery, page: nextPage, size: PAGE_SIZE,
        usePreference: hasPrefs && prefEnabled,
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

  const sortedRecipes = useMemo(
    () => sortRecipes(recipes, activeSort),
    [recipes, activeSort]
  );

  async function handleToggleFavorite(id: number) {
    const wasFavorite = favoriteIds.has(id);
    const title = recipes.find((r) => r.id === id)?.title ?? "";

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorite ? next.delete(id) : next.add(id);
      return next;
    });

    try {
      if (wasFavorite) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
      showToast(
        wasFavorite
          ? `${title}이/가 즐겨찾기에서 제거되었습니다`
          : `${title}이/가 즐겨찾기에 추가되었습니다`
      );
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        wasFavorite ? next.add(id) : next.delete(id);
        return next;
      });
      showToast("즐겨찾기 변경에 실패했어요");
    }
  }

  function handleRecipeClick(recipe: RecipeListItem) {
    const isFav = favoriteIds.has(recipe.id);
    router.push(`/recipe/${recipe.id}?favorite=${isFav}`);
  }

  function handleAddToCart(ingredient: IngredientSummary) {
    // Step 6에서 cart API 연동 예정 — 현재는 토스트만 표시
    showToast(`${ingredient.name}을/를 장바구니에 추가했어요`);
  }

  const prefSummary = [
    (userPrefs?.categories.length ?? 0) > 0 ? `카테고리 ${userPrefs!.categories.length}개` : null,
    (userPrefs?.tastes.length ?? 0) > 0 ? `맛 ${userPrefs!.tastes.length}개` : null,
    (userPrefs?.allergies.length ?? 0) > 0 ? `알레르기 ${userPrefs!.allergies.length}개 제외` : null,
  ].filter(Boolean).join(" · ");

  // 배너용: D-day 라벨이 있는 임박 재료 상위 2개
  const bannerIngredients = expiringItems
    .slice()
    .sort((a, b) => getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate))
    .slice(0, 2);

  const bannerText = bannerIngredients
    .map((item) => {
      const d = getDaysLeft(item.expiryDate);
      return d <= 0 ? `${item.ingredientName} 만료` : `${item.ingredientName} D-${d}`;
    })
    .join(" · ");

  return (
    <div className="min-h-screen flex justify-center" style={{ background: "#F4F7EF" }}>
      <div className="w-full max-w-sm bg-white min-h-screen">

        {/* 스티키 헤더 */}
        <div className="sticky top-0 z-20 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <div className="px-4 pt-6 pb-3 space-y-3">

            {/* 1. 헤더 행 */}
            <div className="flex items-center justify-between">
              <h1 style={{ fontSize: 27, fontWeight: 800, color: "#16201A" }}>
                레시피 추천
              </h1>
              <button
                onClick={() => setIsSortSheetOpen(true)}
                className="flex items-center justify-center rounded-full border"
                style={{
                  width: 42, height: 42,
                  borderColor: "#E6ECDF",
                  color: "#5B6B60",
                }}
                aria-label="정렬 기준 변경"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* 2. 검색바 */}
            <div
              className="flex items-center gap-3 bg-white px-4 focus-within:border-green-500 transition-colors duration-200"
              style={{
                height: 46,
                borderRadius: 14,
                border: "1px solid #E6ECDF",
              }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: "#909C92" }} />
              <input
                type="text"
                placeholder="요리, 식재료 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-[14px] outline-none bg-transparent"
                style={{ color: "#16201A" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ color: "#909C92" }}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 3. 임박 재료 배너 */}
            {expiringItems.length > 0 && (
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left active:scale-[0.98] transition-transform duration-150"
                style={{ background: "#FBEDDB", borderRadius: 14 }}
                onClick={() => setActiveFilter("임박우선")}
              >
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 30, height: 30, background: "#E1832A" }}
                >
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: "#B5631A" }}>
                    임박 재료부터 써요
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "#E1832A" }}>
                    {bannerText} 활용 레시피
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#E1832A" }} />
              </button>
            )}

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

          {/* 내 취향 필터 배너 */}
          {hasPrefs && (
            <div className={`mx-4 mb-3 px-4 py-3 rounded-2xl border transition-colors duration-300 ${
              prefEnabled ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles
                    className={`w-4 h-4 transition-colors duration-300 ${prefEnabled ? "text-green-600" : "text-gray-400"}`}
                    strokeWidth={2}
                  />
                  <span className={`text-[13px] font-bold transition-colors duration-300 ${prefEnabled ? "text-green-800" : "text-gray-500"}`}>
                    내 취향 필터
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors duration-300 ${
                    prefEnabled ? "bg-green-600 text-white" : "bg-gray-300 text-white"
                  }`}>
                    {prefEnabled ? "적용 중" : "꺼짐"}
                  </span>
                </div>
                <button
                  onClick={() => setPrefEnabled((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    prefEnabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                  aria-label="취향 필터 토글"
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] ${
                    prefEnabled ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[11px] truncate flex-1 transition-colors duration-300 ${
                  prefEnabled ? "text-green-600" : "text-gray-400"
                }`}>
                  {prefSummary}
                </p>
                <button
                  onClick={() => router.push("/mypage")}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold active:bg-gray-100 active:scale-95 transition-all"
                >
                  편집
                </button>
              </div>
            </div>
          )}

          {/* 4. 정렬 라벨 행 */}
          {!isLoading && recipes.length > 0 && (
            <div className="flex items-center justify-between px-4 pb-2">
              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#16201A" }}>
                지금 만들 수 있어요
              </span>
              <button
                onClick={() => setIsSortSheetOpen(true)}
                style={{ fontSize: 12, fontWeight: 600, color: "#1AA64E" }}
              >
                {SORT_LABELS[activeSort]} ▾
              </button>
            </div>
          )}
        </div>

        {/* 레시피 목록 */}
        <div className="flex-1 px-4 py-3 space-y-3 pb-24">
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
          ) : sortedRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <span className="text-5xl mb-3">🍽️</span>
              <p className="text-base font-medium text-gray-500">레시피가 없어요</p>
              <p className="text-sm mt-1 text-gray-400 text-center px-4">
                {searchQuery
                  ? "다른 검색어를 입력해보세요"
                  : hasPrefs && prefEnabled
                    ? "선호도 설정이 너무 좁을 수 있어요"
                    : "재료를 냉장고에 추가해보세요"}
              </p>
              {!searchQuery && hasPrefs && prefEnabled && (
                <button
                  onClick={() => router.push("/mypage")}
                  className="mt-3 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
                >
                  마이페이지에서 수정
                </button>
              )}
            </div>
          ) : (
            <>
              {sortedRecipes.map((recipe, i) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  index={i}
                  isFavorite={favoriteIds.has(recipe.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onStart={() => handleRecipeClick(recipe)}
                  onAddToCart={handleAddToCart}
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
        <Toast message={toastMessage} visible={toastVisible} />
        <SortBottomSheet
          isOpen={isSortSheetOpen}
          currentSort={activeSort}
          onSelect={setActiveSort}
          onClose={() => setIsSortSheetOpen(false)}
        />
      </div>
    </div>
  );
}
