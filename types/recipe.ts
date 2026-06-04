// 백엔드 FridgeStatus enum과 동일
export type FridgeStatus = "NONE" | "ENOUGH" | "EXPIRING";

// 레시피 목록 카드용 재료 요약 (백엔드 IngredientSummary와 동일)
export type IngredientSummary = {
  ingredientId: number;
  name: string;
  fridgeStatus: FridgeStatus;
};

// 레시피 분류
export type RecipeCategory = "한식" | "중식" | "일식" | "양식" | "분식" | "기타";

// 레시피 맛
export type RecipeTaste = "매운맛" | "단맛" | "짠맛" | "신맛" | "고소한맛" | "담백한맛" | "쓴맛";

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
  tasteName: RecipeTaste;
  cookTimeMin: number;
  description: string;
  youtubeUrl: string;
  favorite: boolean;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

// 레시피 목록 API 응답 (GET /api/v1/recipes)
export type RecipeListItem = {
  id: number;
  title: string;
  thumbnailUrl: string;
  cookTimeMin: number;
  cookable: boolean;
  expiringIngredientCount: number;
  isFavorite: boolean;
  ingredients: IngredientSummary[];
};

// Spring Page 응답 래퍼
export type RecipePage = {
  content: RecipeListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
};

// 관리자 레시피 등록/수정 폼 전용 타입
export type RecipeFormData = {
  title: string;
  thumbnailUrl: string;
  categoryName: RecipeCategory;
  tasteName: RecipeTaste;
  cookTimeMin: number;
  description: string;
  youtubeUrl: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};

// 관리자 폼의 재료 입력 1개 (ingredientId 없이 입력받을 때)
export type RecipeIngredientFormData = Omit<RecipeIngredient, "ingredientId" | "fridgeStatus">;
