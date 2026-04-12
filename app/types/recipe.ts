export type RecipeCategory = "한식" | "중식" | "일식" | "양식" | "분식" | "기타";

export type RecipeFilterType = "전체" | "임박우선" | "조리가능" | "즐겨찾기";

export type RecipeIngredient = {
  ingredientId: number;
  name: string;
  amount: string;
  unit: string;
  isSubstitutable: boolean;
  fridgeStatus: "NONE" | "ENOUGH" | "LOW" | "EXPIRING" | "EXPIRED";
};

export type RecipeStep = {
  stepOrder: number;
  content: string;
};

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