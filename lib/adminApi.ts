import { getToken } from "@/utils/auth";
import { RecipeFormData, RecipePage } from "@/types/recipe";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// RecipeFormData → 백엔드 요청 형식으로 변환
function toBackendPayload(data: RecipeFormData) {
  return {
    title: data.title,
    thumbnailUrl: data.thumbnailUrl,
    categoryName: data.categoryName,
    tasteName: data.tasteName,
    cookTimeMin: data.cookTimeMin,
    description: data.description,
    youtubeUrl: data.youtubeUrl,
    ingredients: data.ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      isSubstitutable: ing.isSubstitutable,
    })),
    steps: data.steps
      .slice()
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .map((s) => s.content),
  };
}

export async function importRecipeFromYoutube(youtubeUrl: string): Promise<number> {
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  try {
    const res = await fetch(`${BASE_URL}/api/v1/admin/recipes/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ youtubeUrl }),
      signal: controller.signal,
    });

    if (res.status === 401 || res.status === 403) throw new Error("관리자 권한이 필요합니다");
    if (res.status === 409) throw new Error("이미 등록된 레시피입니다");
    if (!res.ok) throw new Error(`서버 오류 (${res.status})`);

    const location = res.headers.get("Location") ?? "";
    const id = parseInt(location.split("/").pop() ?? "0", 10);
    return isNaN(id) ? 0 : id;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAdminRecipes(params: {
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<RecipePage> {
  const token = getToken();
  const query = new URLSearchParams();
  query.set("tab", "ALL");
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 20));

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/v1/recipes?${query}`, { headers });
  if (!res.ok) throw new Error(`레시피 목록 로드 실패: ${res.status}`);
  return res.json();
}

export async function createRecipe(data: RecipeFormData): Promise<number> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/recipes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(toBackendPayload(data)),
  });
  if (res.status === 401 || res.status === 403) throw new Error("관리자 권한이 필요합니다");
  if (!res.ok) throw new Error(`등록 실패 (${res.status})`);
  const location = res.headers.get("Location") ?? "";
  const id = parseInt(location.split("/").pop() ?? "0", 10);
  return isNaN(id) ? 0 : id;
}

export async function updateRecipe(id: number, data: RecipeFormData): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/recipes/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(toBackendPayload(data)),
  });
  if (res.status === 401 || res.status === 403) throw new Error("관리자 권한이 필요합니다");
  if (!res.ok) throw new Error(`수정 실패 (${res.status})`);
}

export async function deleteRecipe(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/admin/recipes/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401 || res.status === 403) throw new Error("관리자 권한이 필요합니다");
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
