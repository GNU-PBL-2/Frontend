import { RecipeIngredient } from "@/types/recipe";
import { Ingredient } from "@/types/ingredient";
import { getDaysLeft } from "@/utils/expiryHelpers";

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