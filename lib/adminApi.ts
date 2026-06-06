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
  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  // 1단계: 분석 작업 제출
  const submitRes = await fetch(`${BASE_URL}/api/v1/admin/recipes/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader },
    body: JSON.stringify({ youtubeUrl }),
  });

  if (submitRes.status === 401 || submitRes.status === 403) throw new Error("관리자 권한이 필요합니다");
  if (submitRes.status === 400 || submitRes.status === 409) throw new Error("이미 등록된 레시피입니다");
  if (!submitRes.ok) throw new Error(`서버 오류 (${submitRes.status})`);

  const { jobId } = await submitRes.json();

  // 2단계: 완료될 때까지 폴링 (최대 90초, 1.5초 간격)
  const maxAttempts = 60;
  const pollIntervalMs = 1500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const statusRes = await fetch(
      `${BASE_URL}/api/v1/admin/recipes/import/status/${jobId}`,
      { headers: { ...authHeader } }
    );

    if (!statusRes.ok) throw new Error(`상태 조회 실패 (${statusRes.status})`);

    const data = await statusRes.json();

    if (data.status === "completed") return data.recipeId as number;
    if (data.status === "failed") throw new Error(data.error ?? "레시피 분석에 실패했습니다");
    // pending / processing → 계속 폴링
  }

  throw new Error("레시피 분석 시간이 초과되었습니다 (최대 90초)");
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
