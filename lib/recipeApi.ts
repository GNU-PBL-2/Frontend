import { getToken } from "@/utils/auth";
import { Recipe, RecipeListItem, RecipePage, RecipeFilterType } from "@/types/recipe";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const TAB_MAP: Record<RecipeFilterType, string> = {
  "전체": "ALL",
  "임박우선": "EXPIRING",
  "조리가능": "COOKABLE",
  "즐겨찾기": "FAVORITE",
};

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRecipes(params: {
  tab?: RecipeFilterType;
  keyword?: string;
  page?: number;
  size?: number;
  usePreference?: boolean;
}): Promise<RecipePage> {
  const query = new URLSearchParams();
  query.set("tab", TAB_MAP[params.tab ?? "전체"]);
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  if (params.usePreference === false) query.set("usePreference", "false");

  const res = await fetch(`${BASE_URL}/api/v1/recipes?${query}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`레시피 목록 로드 실패: ${res.status}`);
  const data: RecipePage = await res.json();
  data.content = (data.content ?? []).map((r) => ({
    ...r,
    ingredients: r.ingredients ?? [],
  }));
  return data;
}

export async function fetchRecipeDetail(id: number): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/api/v1/recipes/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`레시피 상세 로드 실패: ${res.status}`);
  const data: Recipe = await res.json();
  return {
    ...data,
    ingredients: data.ingredients ?? [],
    steps: data.steps ?? [],
  };
}

export async function addFavorite(recipeId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/recipes/${recipeId}/favorites`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`즐겨찾기 추가 실패: ${res.status}`);
}

export async function removeFavorite(recipeId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/recipes/${recipeId}/favorites`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`즐겨찾기 제거 실패: ${res.status}`);
}
