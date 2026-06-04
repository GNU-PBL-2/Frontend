import { RecipeIngredient, IngredientSummary, RecipeListItem, SortOption } from "@/types/recipe";
import { Ingredient } from "@/types/ingredient";
import { getDaysLeft } from "@/utils/expiryHelpers";

// 매칭률: { rate(0-100), owned, total }
export function calcMatchRate(ingredients: IngredientSummary[]): {
  rate: number;
  owned: number;
  total: number;
} {
  const total = ingredients.length;
  if (total === 0) return { rate: 0, owned: 0, total: 0 };
  const owned = ingredients.filter((i) => i.fridgeStatus !== "NONE").length;
  return { rate: Math.round((owned / total) * 100), owned, total };
}

// 부족 재료 (냉장고에 없는 것)
export function getShortageIngredients(ingredients: IngredientSummary[]): IngredientSummary[] {
  return ingredients.filter((i) => i.fridgeStatus === "NONE");
}

// 보유 재료 (ENOUGH 또는 EXPIRING)
export function getOwnedIngredients(ingredients: IngredientSummary[]): IngredientSummary[] {
  return ingredients.filter((i) => i.fridgeStatus !== "NONE");
}

// 임박 재료 포함 여부 (EXPIRING 상태인 재료가 하나라도 있으면 true)
export function hasExpiringIngredient(ingredients: IngredientSummary[]): boolean {
  return ingredients.some((i) => i.fridgeStatus === "EXPIRING");
}

// 정렬 옵션에 따라 레시피 목록 정렬 (원본 배열 변경 없음)
export function sortRecipes(recipes: RecipeListItem[], sort: SortOption): RecipeListItem[] {
  return [...recipes].sort((a, b) => {
    switch (sort) {
      case "MATCH_RATE":
        return calcMatchRate(b.ingredients).rate - calcMatchRate(a.ingredients).rate;
      case "COOK_TIME":
        return (a.cookTimeMin ?? 9999) - (b.cookTimeMin ?? 9999);
      case "EXPIRING_COUNT":
        return b.expiringIngredientCount - a.expiringIngredientCount;
    }
  });
}

// 냉장고 재료 기준으로 레시피 재료의 fridgeStatus 동적 계산
export function calcIngredientFridgeStatus(
  recipeIngredients: RecipeIngredient[],
  fridgeItems: Ingredient[]
): RecipeIngredient[] {
  return recipeIngredients.map((ing) => {
    const found = fridgeItems.find((f) => f.name === ing.name);

    // 냉장고에 없음
    if (!found) return { ...ing, fridgeStatus: "NONE" };

    const daysLeft = getDaysLeft(found.expiryDate);

    // 유통기한 초과 또는 폐기임박 (D-3 이하)
    if (daysLeft <= 3) return { ...ing, fridgeStatus: "EXPIRING" };

    // 충분
    return { ...ing, fridgeStatus: "ENOUGH" };
  });
}