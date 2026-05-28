import { getToken } from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** DB에 매칭된 재료 (냉장고에 추가 가능) */
export type MatchedIngredient = {
  ingredientId: number;
  ingredientName: string;
};

/** YOLO 감지 결과 */
export type DetectedIngredientResponse = {
  matched: MatchedIngredient[];   // DB 매칭 성공 → 냉장고에 추가 가능
  unmatched: string[];            // DB 미매칭 → 표시만 (추가 불가)
};

/**
 * 카메라 이미지를 YOLO 모델로 분석해 재료를 감지합니다.
 * POST /api/v1/fridge/detect  (multipart/form-data, field: "image")
 */
export async function detectIngredients(
  imageFile: File
): Promise<DetectedIngredientResponse> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const form = new FormData();
  form.append("image", imageFile);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${BASE_URL}/api/v1/fridge/detect`, {
      method: "POST",
      headers,
      body: form,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`감지 실패: ${res.status}`);

    const raw = await res.json() as {
      matched: Array<{ ingredientId: number; ingredientName?: string; name?: string }>;
      unmatched: string[];
    };

    return {
      matched: raw.matched.map((item) => ({
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName ?? item.name ?? "",
      })),
      unmatched: raw.unmatched ?? [],
    };
  } finally {
    clearTimeout(timeout);
  }
}
