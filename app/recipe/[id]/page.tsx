"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import Image from "next/image";
import { mockRecipes, getExpiringCount, getIsCookable } from "@/data/recipeData";
import { mockIngredients } from "@/data/dummydata";
import { calcIngredientFridgeStatus } from "@/utils/recipeHelpers";
import RecipeYoutubeThumbnail from "@/components/recipe/RecipeYoutubeThumbnail";
import RecipeIngredientList from "@/components/recipe/RecipeIngredientList";
import RecipeStepList from "@/components/recipe/RecipeStepList";
import AddToCartModal from "@/components/recipe/AddToCartModal";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { RecipeIngredient } from "@/types/recipe";


export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const recipe = mockRecipes.find((r) => r.id === Number(id));


  const searchParams = useSearchParams();
  const initialFavorite = searchParams.get("favorite") === "true";
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const { toastMessage, toastVisible, showToast } = useToast(); // 토스트 훅 사용
// 냉장고 재료 기준으로 레시피 재료의 fridgeStatus 동적 계산된 재료 목록
//todo - 백엔드 연동 전 Zustand 등으로 상태 관리할 때는 fridgeItems 상태를 전역으로 관리하면서 여기서는 useMemo로 계산된 connectedIngredients만 사용하도록 리팩토링 필요

  // 냉장고 재료 기준으로 레시피 재료의 fridgeStatus 동적 계산
  const connectedIngredients = useMemo(() => {
    if (!recipe) return [];
    return calcIngredientFridgeStatus(recipe.ingredients, mockIngredients);
  }, [recipe]);

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        레시피를 찾을 수 없어요
      </div>
    );
  }

  const expiringCount = getExpiringCount(recipe, mockIngredients);
  const isCookable = getIsCookable(recipe, mockIngredients);

  function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    showToast(
      next 
        ? `${recipe?.title}이/가 즐겨찾기에 추가되었습니다` 
        : `${recipe?.title}이/가 즐겨찾기에서 제거되었습니다`
    );
  }

  function handleCartConfirm(selected: RecipeIngredient[]) {
    const names = selected.map((ing) => ing.name).join(", ");
    showToast(`${names}이/가 장바구니에 추가되었습니다`);
  }

  return (
    <div className="bg-white min-h-screen flex justify-center">
      <div className="w-full max-w-sm relative">

        {/* 상단 이미지 */}
        <div className="sticky top-0 z-0 w-full h-56">
          <Image
            src={recipe.thumbnailUrl}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>

        {/* 콘텐츠 영역 */}
        <div className="relative z-10 bg-white rounded-t-3xl -mt-6 px-4 pt-5 pb-28">

          {/* 제목, 요리 가능 여부, 즐겨찾기, 뒤로가기 버튼 */}
          <div className="flex items-start justify-between mb-1">
            {/* 제목 + 요리 가능 여부 */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{recipe.title}</h1>
              {isCookable && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  요리 가능
                </span>
              )}
            </div>
            
            {/* 즐겨찾기 + 뒤로가기 버튼 */}
            <div className="flex items-center gap-8">
              <button
                onClick={handleToggleFavorite}
                aria-label="즐겨찾기"
              >
                <span className={`text-2xl ${isFavorite ? "text-red-500" : "text-gray-300"}`}>
                  ♥
                </span>
              </button>
              <button
                onClick={() => router.back()}
                aria-label="뒤로가기"
                className="text-gray-400 text-lg font-medium"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 분류 + 소요시간 + 임박재료 */}
          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
            <span>{recipe.categoryName}</span>
            <span>🕐 {recipe.cookTimeMin}분</span>
            {/* {expiringCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                임박재료 {expiringCount}개
              </span>
            )} */}
          </div>

          {/* 유튜브 썸네일 */}
          <RecipeYoutubeThumbnail
            youtubeUrl={recipe.youtubeUrl}
            thumbnailUrl={recipe.thumbnailUrl}
            title={recipe.title}
          />

          {/*연동된 재료 목록 전달*/}
          <RecipeIngredientList
            //ingredients={recipe.ingredients} // 냉장고 재료 기준으로 fridgeStatus 동적 계산된 재료 목록 전달
            ingredients = {connectedIngredients}
            onOpenCartModal={() => setIsCartModalOpen(true)}
          />

          {/* 조리방법 */}
          <RecipeStepList steps={recipe.steps} />
        </div>

        {/* 요리 완료 버튼 */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pb-6 pt-2 bg-white border-t border-gray-100 z-20">
          <button className="w-full py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold">
            요리 완료 →
          </button>
        </div>

        <Toast message={toastMessage} visible={toastVisible} />

        {/* 장바구니 추가 모달 */}
        <AddToCartModal
          isOpen={isCartModalOpen}
          ingredients={connectedIngredients} // 냉장고 재료 기준으로 fridgeStatus 동적 계산된 재료 목록 전달
          onClose={() => setIsCartModalOpen(false)}
          onConfirm = {handleCartConfirm} // 선택된 재료 처리 함수 전달
        />
      </div>
      
      
    </div>
  );
}