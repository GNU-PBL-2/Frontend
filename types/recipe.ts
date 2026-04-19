// 백엔드 fridgeStatus 값과 동일하게 맞춤
export type FridgeStatus = "NONE" | "ENOUGH" | "LOW" | "EXPIRING" | "EXPIRED";

// 레시피 분류
export type RecipeCategory = "한식" | "중식" | "일식" | "양식" | "분식" | "기타";

// 필터 탭
export type RecipeFilterType = "전체" | "임박우선" | "조리가능" | "즐겨찾기";

// 레시피에 포함된 재료 1개 (백엔드 구조 그대로)
export type RecipeIngredient = {
  ingredientId: number;
  name: string;
  amount: string;
  unit: string;
  isSubstitutable: boolean;
  fridgeStatus: FridgeStatus;
};

// 조리 단계 1개
export type RecipeStep = {
  stepOrder: number;
  content: string;
};

// 레시피 1개 전체
export type Recipe = {
  id: number;
  title: string;
  thumbnailUrl: string;
  categoryName: RecipeCategory;
  cookTimeMin: number;
  youtubeUrl: string;
  favorite: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

// 레시피 카드에서 계산해서 쓸 파생 정보
// — 백엔드에서 안 주는 값들, 프론트에서 계산
export type RecipeDerivedInfo = {
  expiringCount: number;    // 임박 재료 몇 개 사용하는지
  isCookable: boolean;      // 냉장고 재료로 바로 조리 가능한지
};

// 관리자 레시피 등록/수정 폼 전용 타입
export type RecipeFormData = {
  title: string;
  thumbnailUrl: string;
  categoryName: RecipeCategory;
  cookTimeMin: number;
  youtubeUrl: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

// 관리자 폼의 재료 입력 1개 (ingredientId 없이 입력받을 때)
export type RecipeIngredientFormData = Omit<RecipeIngredient, "ingredientId" | "fridgeStatus">;