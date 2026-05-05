import { getToken } from "@/utils/auth";
import { Recipe, RecipeListItem, RecipePage, RecipeFilterType } from "@/types/recipe";

const BASE_URL = "http://localhost:8080";

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
}): Promise<RecipePage> {
  const query = new URLSearchParams();
  query.set("tab", TAB_MAP[params.tab ?? "전체"]);
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));

  const res = await fetch(`${BASE_URL}/api/v1/recipes?${query}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`레시피 목록 로드 실패: ${res.status}`);
  return res.json();
}

export async function fetchRecipeDetail(id: number): Promise<Recipe> {
  const res = await fetch(`${BASE_URL}/api/v1/recipes/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`레시피 상세 로드 실패: ${res.status}`);
  return res.json();
}
