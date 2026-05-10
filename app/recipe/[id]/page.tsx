"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchRecipeDetail, addFavorite, removeFavorite } from "@/lib/recipeApi";
import { Recipe, RecipeIngredient } from "@/types/recipe";
import RecipeYoutubeThumbnail from "@/components/recipe/RecipeYoutubeThumbnail";
import RecipeIngredientList from "@/components/recipe/RecipeIngredientList";
import RecipeStepList from "@/components/recipe/RecipeStepList";
import AddToCartModal from "@/components/recipe/AddToCartModal";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";

function DetailSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto animate-pulse">
      <div className="w-full h-72 skeleton" />
      <div className="bg-white rounded-t-3xl -mt-6 px-4 pt-5 pb-8">
        <div className="h-6 skeleton rounded-lg w-2/3 mb-3" />
        <div className="h-4 skeleton rounded-lg w-1/3 mb-6" />
        <div className="h-40 skeleton rounded-xl mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialFavorite = searchParams.get("favorite") === "true";
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [imgError, setImgError] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { toastMessage, toastVisible, showToast } = useToast();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchRecipeDetail(Number(id));
        setRecipe(data);
        setIsFavorite(data.favorite);
      } catch {
        setError("레시피를 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleToggleFavorite() {
    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite);
    try {
      if (wasFavorite) {
        await removeFavorite(Number(id));
      } else {
        await addFavorite(Number(id));
      }
      showToast(
        wasFavorite
          ? `${recipe?.title}이/가 즐겨찾기에서 제거되었습니다`
          : `${recipe?.title}이/가 즐겨찾기에 추가되었습니다`
      );
    } catch {
      setIsFavorite(wasFavorite);
      showToast("즐겨찾기 변경에 실패했어요");
    }
  }

  function handleCartConfirm(selected: RecipeIngredient[]) {
    const names = selected.map((ing) => ing.name).join(", ");
    showToast(`${names}이/가 장바구니에 추가되었습니다`);
  }

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex justify-center">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-400">
        <span className="text-5xl">😢</span>
        <p className="text-base font-medium text-gray-500">{error ?? "레시피를 찾을 수 없어요"}</p>
        <button
          onClick={() => router.back()}
          className="mt-2 px-5 py-2 rounded-full bg-green-700 text-white text-sm font-semibold"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const isCookable = recipe.ingredients
    .filter((ing) => !ing.isSubstitutable)
    .every((ing) => ing.fridgeStatus !== "NONE");

  return (
    <div className="bg-white min-h-screen flex justify-center">
      <div className="w-full max-w-sm relative">

        {/* 히어로 이미지 */}
        <div className="relative w-full h-72 bg-gray-200">
          {imgError || !recipe.thumbnailUrl ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-8xl">🍽️</span>
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* 플로팅 뒤로가기 */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            aria-label="뒤로가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 플로팅 즐겨찾기 */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            aria-label="즐겨찾기"
          >
            <span className={`text-xl transition-colors duration-200 ${isFavorite ? "text-red-400" : "text-white/70"}`}>
              ♥
            </span>
          </button>

          {/* 히어로 하단 정보 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              {isCookable && (
                <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  조리가능
                </span>
              )}
              <span className="text-white/80 text-xs font-medium">
                {recipe.categoryName} · ⏰ {recipe.cookTimeMin}분
              </span>
            </div>
            <h1 className="text-white text-2xl font-bold leading-tight drop-shadow">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* 콘텐츠 카드 */}
        <div className="animate-fadeInUp relative z-10 bg-white rounded-t-3xl -mt-5 px-4 pt-6 pb-28">

          {/* 유튜브 */}
          <RecipeYoutubeThumbnail
            youtubeUrl={recipe.youtubeUrl}
            thumbnailUrl={recipe.thumbnailUrl}
            title={recipe.title}
          />

          {/* 재료 목록 */}
          <RecipeIngredientList
            ingredients={recipe.ingredients}
            onOpenCartModal={() => setIsCartModalOpen(true)}
          />

          {/* 조리방법 */}
          <RecipeStepList steps={recipe.steps} />
        </div>

        {/* 요리 완료 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-6 pt-3 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-20">
          <button className="w-full py-3.5 rounded-xl bg-green-700 active:bg-green-800 text-white text-sm font-bold transition-colors shadow-md shadow-green-200">
            요리 완료 →
          </button>
        </div>

        <Toast message={toastMessage} visible={toastVisible} />

        <AddToCartModal
          isOpen={isCartModalOpen}
          ingredients={recipe.ingredients}
          onClose={() => setIsCartModalOpen(false)}
          onConfirm={handleCartConfirm}
        />
      </div>
    </div>
  );
}
